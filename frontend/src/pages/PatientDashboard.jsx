import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  
  // Navigation tabs: 'timeline' | 'book' | 'history'
  const [activeTab, setActiveTab] = useState('timeline');
  
  // State
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');

  // Booking Modal / Form State
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  
  // Pre-defined time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch appointments
      const appRes = await api.get('/appointments');
      setAppointments(appRes.data);

      // 2. Fetch medical records / prescriptions
      const recRes = await api.get('/records');
      setRecords(recRes.data);

      // 3. Fetch doctors
      const docRes = await api.get(`/doctors?specialization=${selectedSpec}&search=${searchQuery}`);
      setDoctors(docRes.data);

      // 4. Fetch specializations list
      const specRes = await api.get('/doctors/specializations');
      setSpecializations(specRes.data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to retrieve data');
    } finally {
      setLoading(false);
    }
  }, [selectedSpec, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      fetchData(); // Refresh records
    } catch (err) {
      alert(err.message || 'Could not cancel appointment');
    }
  };

  const handleOpenBooking = (doc) => {
    setSelectedDoctor(doc);
    setShowBooking(true);
    setBookingSuccess('');
    setBookingError('');
    setBookingDate('');
    setBookingSlot('');
    setBookingReason('');
  };

  const handleCloseBooking = () => {
    setShowBooking(false);
    setSelectedDoctor(null);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    
    if (!bookingDate || !bookingSlot || !bookingReason) {
      setBookingError('Please complete all form fields');
      return;
    }

    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor.user._id,
        date: bookingDate,
        timeSlot: bookingSlot,
        reason: bookingReason,
      });

      setBookingSuccess('Appointment successfully requested! Waiting for doctor confirmation.');
      setTimeout(() => {
        handleCloseBooking();
        fetchData();
        setActiveTab('timeline');
      }, 2000);
    } catch (err) {
      setBookingError(err.message || 'Failed to book slot.');
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span style={{ fontSize: '1.5rem' }}>✚</span> HealthCare
        </div>
        <ul className="sidebar-menu">
          <li>
            <button 
              onClick={() => setActiveTab('timeline')} 
              className={`sidebar-link w-full ${activeTab === 'timeline' ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              📅 My Schedule
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('book')} 
              className={`sidebar-link w-full ${activeTab === 'book' ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              🔍 Find & Book Doctor
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`sidebar-link w-full ${activeTab === 'history' ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              📋 Prescriptions & Records
            </button>
          </li>
        </ul>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={logout} className="btn btn-secondary w-full" style={{ padding: '8px' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main" style={{ padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2>Patient Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your clinic schedules and active prescriptions</p>
          </div>
          <span style={{ fontSize: '0.9rem', backgroundColor: '#eff6ff', color: 'var(--primary)', padding: '6px 12px', borderRadius: 'var(--border-radius-sm)', fontWeight: '600' }}>
            Patient: {user?.name}
          </span>
        </header>

        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--border-radius-sm)', color: 'var(--error)', marginBottom: '24px' }}>
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Timeline */}
        {activeTab === 'timeline' && (
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>Upcoming and Past Consultations</h3>
            {loading ? (
              <p>Retrieving schedule logs...</p>
            ) : appointments.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No appointment records found. Book a consultation slot using the sidebar finder.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {appointments.map((app) => (
                  <div key={app._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '18px 24px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Dr. {app.doctor?.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500' }}>{app.doctor?.specialization}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                        📅 {new Date(app.date).toLocaleDateString()} | ⏰ {app.timeSlot}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Reason: "{app.reason}"</p>
                      {app.notes && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: '6px', fontStyle: 'italic', fontWeight: '500' }}>
                          Doctor Notes: "{app.notes}"
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                      <span className={`badge badge-${app.status}`}>
                        {app.status.toUpperCase()}
                      </span>
                      {app.status === 'pending' && (
                        <button onClick={() => handleCancelAppointment(app._id)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--error)' }}>
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Finder & Book */}
        {activeTab === 'book' && (
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>Specialist Directory</h3>
            
            {/* Search and Specialization selectors */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search physician name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ maxWidth: '280px' }}
              />
              <select
                className="form-control"
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
                style={{ maxWidth: '220px' }}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <p>Finding doctors...</p>
            ) : doctors.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No approved medical specialists match your search filters.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {doctors.map((doc) => (
                  <div key={doc._id} style={{ background: '#ffffff', padding: '24px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', color: '#0f172a' }}>Dr. {doc.user?.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500', marginBottom: '8px' }}>{doc.specialization}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>💼 Experience: {doc.experienceYears} Years</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>💵 Consultation Fee: ${doc.consultationFee}</p>
                      {doc.bio && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px' }}>"{doc.bio}"</p>}
                    </div>
                    <button
                      onClick={() => handleOpenBooking(doc)}
                      className="btn btn-primary w-full"
                      style={{ marginTop: 'auto' }}
                    >
                      Book Session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: History & Prescriptions */}
        {activeTab === 'history' && (
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>Prescription & Consultations Log</h3>
            
            {loading ? (
              <p>Accessing medical records...</p>
            ) : records.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No prescription documents logged for your user profile.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {records.map((rec) => (
                  <div key={rec._id} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.15rem', color: '#0f172a' }}>Diagnostic Session Report</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dr. {rec.doctor?.name} | Specialization: {rec.doctor?.specialization || 'General'}</p>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                        📅 {new Date(rec.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Primary Diagnosis</strong>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{rec.diagnoses}</p>
                    </div>

                    {rec.notes && (
                      <div style={{ marginBottom: '20px' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Treatment Advice & Notes</strong>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{rec.notes}</p>
                      </div>
                    )}

                    {rec.prescribedMedicines && rec.prescribedMedicines.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'block', marginBottom: '10px' }}>Prescribed Medications</strong>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: '#f8fafc' }}>
                              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Medicine</th>
                              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Dosage</th>
                              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Frequency</th>
                              <th style={{ textAlign: 'left', padding: '8px 12px' }}>Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rec.prescribedMedicines.map((med, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '10px 12px', fontWeight: '600' }}>{med.name}</td>
                                <td style={{ padding: '10px 12px' }}>{med.dosage}</td>
                                <td style={{ padding: '10px 12px' }}>{med.frequency}</td>
                                <td style={{ padding: '10px 12px' }}>{med.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Form Dialog Box */}
      {showBooking && selectedDoctor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: 0, padding: '32px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
            <button onClick={handleCloseBooking} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            
            <h3 style={{ marginBottom: '8px' }}>Request Appointment</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Booking with <strong>Dr. {selectedDoctor.user?.name}</strong> ({selectedDoctor.specialization})
            </p>

            {bookingError && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--border-radius-sm)', color: 'var(--error)', marginBottom: '16px', fontSize: '0.85rem' }}>
                {bookingError}
              </div>
            )}

            {bookingSuccess && (
              <div style={{ padding: '8px 12px', background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: 'var(--border-radius-sm)', color: 'var(--accent)', marginBottom: '16px', fontSize: '0.85rem' }}>
                {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleBookSubmit}>
              <div className="form-group">
                <label className="form-label">Appointment Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="form-control"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time Slot</label>
                <select
                  required
                  className="form-control"
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                >
                  <option value="">Select Time Slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Appointment</label>
                <textarea
                  required
                  rows="3"
                  className="form-control"
                  placeholder="Tell us what symptoms you have..."
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={handleCloseBooking} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .dashboard-layout {
            flex-direction: column !important;
          }
          .sidebar {
            width: 100% !important;
            height: auto !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border-color) !important;
          }
        }
      `}</style>
    </div>
  );
}
