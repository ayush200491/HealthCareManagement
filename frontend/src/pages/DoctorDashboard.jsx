import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  
  // Navigation tabs: 'consultations' | 'history'
  const [activeTab, setActiveTab] = useState('consultations');

  // Dashboard states
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Consultation Modal State
  const [showConsult, setShowConsult] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  
  // Prescription Form state
  const [diagnoses, setDiagnoses] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([]); // Array of { name, dosage, frequency, duration }
  
  // Temp single medicine inputs
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('');
  const [medDur, setMedDur] = useState('');

  const [consultSuccess, setConsultSuccess] = useState('');
  const [consultError, setConsultError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Fetch Appointments
      const appRes = await api.get('/appointments');
      setAppointments(appRes.data);

      // Fetch historical clinical records
      const recRes = await api.get('/records');
      setRecords(recRes.data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to retrieve appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (appId, targetStatus) => {
    try {
      await api.put(`/appointments/${appId}/status`, { status: targetStatus });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update appointment status');
    }
  };

  const handleOpenConsult = (app) => {
    setActiveApp(app);
    setShowConsult(true);
    setDiagnoses('');
    setNotes('');
    setMedicines([]);
    setConsultSuccess('');
    setConsultError('');
    clearMedInputs();
  };

  const handleCloseConsult = () => {
    setShowConsult(false);
    setActiveApp(null);
  };

  const clearMedInputs = () => {
    setMedName('');
    setMedDosage('');
    setMedFreq('');
    setMedDur('');
  };

  const handleAddMedicine = () => {
    if (!medName || !medDosage || !medFreq || !medDur) {
      alert('Please fill out all medicine parameters');
      return;
    }
    setMedicines([...medicines, { name: medName, dosage: medDosage, frequency: medFreq, duration: medDur }]);
    clearMedInputs();
  };

  const handleRemoveMedicine = (index) => {
    const updated = [...medicines];
    updated.splice(index, 1);
    setMedicines(updated);
  };

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    setConsultError('');
    setConsultSuccess('');

    if (!diagnoses) {
      setConsultError('Diagnoses description is required');
      return;
    }

    try {
      await api.post('/records', {
        appointmentId: activeApp._id,
        diagnoses,
        prescribedMedicines: medicines,
        notes,
      });

      setConsultSuccess('Consultation logged and prescription successfully issued!');
      setTimeout(() => {
        handleCloseConsult();
        fetchData();
      }, 2000);
    } catch (err) {
      setConsultError(err.message || 'Failed to submit consultation record.');
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
              onClick={() => setActiveTab('consultations')} 
              className={`sidebar-link w-full ${activeTab === 'consultations' ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              📅 Consultations Queue
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`sidebar-link w-full ${activeTab === 'history' ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              📋 Clinical History Logs
            </button>
          </li>
        </ul>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={logout} className="btn btn-secondary w-full" style={{ padding: '8px' }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main" style={{ padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2>Doctor Portal</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your diagnostic consultations and treatment files</p>
          </div>
          <span style={{ fontSize: '0.9rem', backgroundColor: '#f0fdfa', color: 'var(--secondary)', padding: '6px 12px', borderRadius: 'var(--border-radius-sm)', fontWeight: '600' }}>
            Dr. {user?.name}
          </span>
        </header>

        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--border-radius-sm)', color: 'var(--error)', marginBottom: '24px' }}>
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Consultations Queue */}
        {activeTab === 'consultations' && (
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>Today's Scheduled Patients</h3>
            {loading ? (
              <p>Loading consultation queue...</p>
            ) : appointments.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No scheduled sessions booked under your profile.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {appointments.map((app) => (
                  <div key={app._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '18px 24px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Patient: {app.patient?.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Gender: {app.patient?.gender?.toUpperCase() || 'N/A'} | Email: {app.patient?.email}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '6px', fontWeight: '500' }}>
                        📅 {new Date(app.date).toLocaleDateString()} | ⏰ {app.timeSlot}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Reason for Visit: "{app.reason}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span className={`badge badge-${app.status}`}>
                        {app.status.toUpperCase()}
                      </span>
                      
                      {app.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(app._id, 'approved')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            Approve
                          </button>
                          <button onClick={() => handleUpdateStatus(app._id, 'cancelled')} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            Reject
                          </button>
                        </>
                      )}

                      {app.status === 'approved' && (
                        <button onClick={() => handleOpenConsult(app)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', backgroundColor: 'var(--secondary)' }}>
                          Consult & Prescribe
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Historical Clinical Records */}
        {activeTab === 'history' && (
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>Logged Consultations History</h3>
            {loading ? (
              <p>Retrieving diagnostic records...</p>
            ) : records.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No diagnostics recorded under your profile.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {records.map((rec) => (
                  <div key={rec._id} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Patient Consultation File</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Patient Name: {rec.patient?.name} | Email: {rec.patient?.email}</p>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>
                        📅 {new Date(rec.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Diagnoses:</strong>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{rec.diagnoses}</p>
                    </div>

                    {rec.notes && (
                      <div style={{ marginBottom: '20px' }}>
                        <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>Doctor's Advice:</strong>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{rec.notes}</p>
                      </div>
                    )}

                    {rec.prescribedMedicines && rec.prescribedMedicines.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '10px', color: 'var(--secondary)' }}>Issued Prescriptions:</strong>
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

      {/* Consult & Prescribe Dialog Box */}
      {showConsult && activeApp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', margin: 'auto', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
            <button onClick={handleCloseConsult} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            
            <h3 style={{ marginBottom: '8px' }}>Clinical Session & Prescription</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Patient: <strong>{activeApp.patient?.name}</strong> ({activeApp.patient?.gender})
            </p>

            {consultError && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--border-radius-sm)', color: 'var(--error)', marginBottom: '16px', fontSize: '0.85rem' }}>
                {consultError}
              </div>
            )}

            {consultSuccess && (
              <div style={{ padding: '8px 12px', background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: 'var(--border-radius-sm)', color: 'var(--accent)', marginBottom: '16px', fontSize: '0.85rem' }}>
                {consultSuccess}
              </div>
            )}

            <form onSubmit={handleConsultSubmit}>
              <div className="form-group">
                <label className="form-label">Diagnosis / Clinic Assessment</label>
                <textarea
                  required
                  rows="3"
                  className="form-control"
                  placeholder="Primary diagnoses (e.g. Throat infection, acute sinusitis...)"
                  value={diagnoses}
                  onChange={(e) => setDiagnoses(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Treatment Advice & Notes</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="Clinical treatment advice, rest schedule..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Dynamic Prescription Table Section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '12px' }}>Add Prescription Medication</h4>
                
                {/* Medicine Input row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 50px', gap: '8px', marginBottom: '16px' }}>
                  <input type="text" className="form-control" placeholder="Aspirin" value={medName} onChange={(e) => setMedName(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} />
                  <input type="text" className="form-control" placeholder="100mg" value={medDosage} onChange={(e) => setMedDosage(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} />
                  <input type="text" className="form-control" placeholder="Once daily" value={medFreq} onChange={(e) => setMedFreq(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} />
                  <input type="text" className="form-control" placeholder="10 days" value={medDur} onChange={(e) => setMedDur(e.target.value)} style={{ padding: '8px', fontSize: '0.85rem' }} />
                  <button type="button" onClick={handleAddMedicine} className="btn btn-primary" style={{ padding: '8px', fontSize: '0.85rem' }}>+</button>
                </div>

                {/* Table of added medicines */}
                {medicines.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '16px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: '#f8fafc' }}>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Medicine</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Dosage</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Frequency</th>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Duration</th>
                        <th style={{ width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicines.map((med, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px' }}>{med.name}</td>
                          <td style={{ padding: '8px' }}>{med.dosage}</td>
                          <td style={{ padding: '8px' }}>{med.frequency}</td>
                          <td style={{ padding: '8px' }}>{med.duration}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button type="button" onClick={() => handleRemoveMedicine(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={handleCloseConsult} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Clinical Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
