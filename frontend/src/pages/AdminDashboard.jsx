import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Tabs: 'overview' | 'doctors' | 'appointments'
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data State
  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0, totalRevenue: 0 });
  const [doctorsList, setDoctorsList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error('Stats loading error:', err.message);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await fetchStats();

      // Fetch Doctors
      const docRes = await api.get('/admin/doctors');
      setDoctorsList(docRes.data);

      // Fetch Appointments
      const appRes = await api.get('/appointments');
      setAppointmentsList(appRes.data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to retrieve administrative data.');
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDoctorApproval = async (docProfileId, newStatus) => {
    try {
      await api.put(`/admin/doctors/${docProfileId}/approve`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update doctor verification status');
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointmentsList.filter((app) => {
    const matchesSearch = 
      app.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.doctor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter ? app.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

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
              onClick={() => setActiveTab('overview')} 
              className={`sidebar-link w-full ${activeTab === 'overview' ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              📊 System Overview
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('doctors')} 
              className={`sidebar-link w-full ${activeTab === 'doctors' ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              🩺 Manage Specialists
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('appointments')} 
              className={`sidebar-link w-full ${activeTab === 'appointments' ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              📅 Master Appointments
            </button>
          </li>
        </ul>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          Role: System Administrator
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main" style={{ padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2>Clinical Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Hospital administration and analytics portal</p>
          </div>
          <span style={{ fontSize: '0.9rem', backgroundColor: '#e2e8f0', color: '#334155', padding: '6px 12px', borderRadius: 'var(--border-radius-sm)', fontWeight: '600' }}>
            Hello, {user?.name}
          </span>
        </header>

        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--border-radius-sm)', color: 'var(--error)', marginBottom: '24px' }}>
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Metric Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
              <div className="stat-card">
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>TOTAL PATIENTS</p>
                  <h3 style={{ fontSize: '2rem', marginTop: '4px', fontWeight: '800' }}>{stats.totalPatients}</h3>
                </div>
                <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>👥</div>
              </div>

              <div className="stat-card">
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>TOTAL DOCTORS</p>
                  <h3 style={{ fontSize: '2rem', marginTop: '4px', fontWeight: '800' }}>{stats.totalDoctors}</h3>
                </div>
                <div className="stat-icon" style={{ backgroundColor: '#f0fdfa', color: '#14b8a6' }}>🩺</div>
              </div>

              <div className="stat-card">
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>APPOINTMENTS</p>
                  <h3 style={{ fontSize: '2rem', marginTop: '4px', fontWeight: '800' }}>{stats.totalAppointments}</h3>
                </div>
                <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>📅</div>
              </div>

              <div className="stat-card">
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>TOTAL REVENUE</p>
                  <h3 style={{ fontSize: '2rem', marginTop: '4px', fontWeight: '800' }}>${stats.totalRevenue}</h3>
                </div>
                <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>💰</div>
              </div>
            </div>

            {/* Simulated Graphs and stats overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }} className="grid-layout">
              {/* Trends bar */}
              <div className="card" style={{ margin: 0 }}>
                <h3 style={{ marginBottom: '20px' }}>Weekly Consultation Trends</h3>
                {/* SVG Chart */}
                <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: '#f8fafc', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                  {[
                    { day: 'Mon', count: 12 }, { day: 'Tue', count: 19 }, { day: 'Wed', count: 15 },
                    { day: 'Thu', count: 28 }, { day: 'Fri', count: 22 }, { day: 'Sat', count: 8 }, { day: 'Sun', count: 3 }
                  ].map((item, idx) => {
                    const heightPercent = `${(item.count / 30) * 100}%`;
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                        <div style={{ height: heightPercent, minHeight: '10px', width: '24px', background: 'linear-gradient(180deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '4px', position: 'relative' }}>
                          <span style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {item.count}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Specialization breakdown donut card */}
              <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyBetween: 'center' }}>
                <h3 style={{ marginBottom: '16px' }}>Doctor Breakdown</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <svg width="120" height="120" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--primary)" strokeWidth="3.2" strokeDasharray="60 100" />
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--secondary)" strokeWidth="3.2" strokeDasharray="25 100" strokeDashoffset="-60" />
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--accent)" strokeWidth="3.2" strokeDasharray="15 100" strokeDashoffset="-85" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--primary)', borderRadius: '25%' }} />
                      Cardiology (60%)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--secondary)', borderRadius: '25%' }} />
                      Pediatrics (25%)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent)', borderRadius: '25%' }} />
                      Dental (15%)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Recent Table list */}
            <div className="card" style={{ margin: 0 }}>
              <h3 style={{ marginBottom: '20px' }}>Recent Appointment Logs</h3>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Date</th>
                      <th>Slot</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentsList.slice(0, 5).map((app) => (
                      <tr key={app._id}>
                        <td style={{ fontWeight: '600' }}>{app.patient?.name}</td>
                        <td>Dr. {app.doctor?.name}</td>
                        <td style={{ color: 'var(--primary)', fontWeight: '500' }}>{app.doctor?.specialization}</td>
                        <td>{new Date(app.date).toLocaleDateString()}</td>
                        <td>{app.timeSlot}</td>
                        <td>
                          <span className={`badge badge-${app.status}`}>
                            {app.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manage Doctors approvals */}
        {activeTab === 'doctors' && (
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>Licensed Specialist Profiles</h3>
            
            {loading ? (
              <p>Loading medical profiles...</p>
            ) : doctorsList.length === 0 ? (
              <p>No specialists profiles registered.</p>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Specialization</th>
                      <th>Exp (Years)</th>
                      <th>Consultation Fee</th>
                      <th>License Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorsList.map((doc) => (
                      <tr key={doc._id}>
                        <td style={{ fontWeight: '600' }}>Dr. {doc.user?.name}</td>
                        <td style={{ color: 'var(--primary)', fontWeight: '500' }}>{doc.specialization}</td>
                        <td>{doc.experienceYears} Years</td>
                        <td>${doc.consultationFee}</td>
                        <td>
                          <span className={`badge badge-${doc.status}`}>
                            {doc.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {doc.status !== 'approved' && (
                            <button 
                              onClick={() => handleDoctorApproval(doc._id, 'approved')} 
                              className="btn btn-primary" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Approve
                            </button>
                          )}
                          {doc.status !== 'rejected' && (
                            <button 
                              onClick={() => handleDoctorApproval(doc._id, 'rejected')} 
                              className="btn btn-danger" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Master Appointments logs */}
        {activeTab === 'appointments' && (
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }} className="grid-layout">
              <h3>Global Appointments Listing</h3>
              
              {/* Filter Row */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter name or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '220px', padding: '8px 12px', fontSize: '0.85rem' }}
                />
                
                <select
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: '150px', padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p>Fetching clinical appointments database...</p>
            ) : filteredAppointments.length === 0 ? (
              <p>No appointments match current filters.</p>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Reason</th>
                      <th>Date</th>
                      <th>Slot</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((app) => (
                      <tr key={app._id}>
                        <td style={{ fontWeight: '600' }}>{app.patient?.name}</td>
                        <td>Dr. {app.doctor?.name}</td>
                        <td>"{app.reason}"</td>
                        <td>{new Date(app.date).toLocaleDateString()}</td>
                        <td>{app.timeSlot}</td>
                        <td>
                          <span className={`badge badge-${app.status}`}>
                            {app.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

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
          .grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
