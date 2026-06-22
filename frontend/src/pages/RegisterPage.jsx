import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phoneNumber: '',
    gender: 'male',
    dob: '',
    specialization: '',
    experienceYears: '',
    consultationFee: '',
    bio: '',
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = { ...formData };
      
      if (formData.role !== 'doctor') {
        delete payload.specialization;
        delete payload.experienceYears;
        delete payload.consultationFee;
        delete payload.bio;
      } else {
        payload.experienceYears = Number(payload.experienceYears);
        payload.consultationFee = Number(payload.consultationFee);
      }

      const data = await register(payload);
      if (data.role === 'admin') {
        navigate('/admin');
      } else if (data.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '40px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>Register Account</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>
            Join the clinical information system
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--border-radius-sm)', color: 'var(--error)', marginBottom: '24px', fontSize: '0.85rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="form-control"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="form-control"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                required
                className="form-control"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Portal Access Role</label>
              <select name="role" className="form-control" value={formData.role} onChange={handleChange}>
                <option value="patient">Patient</option>
                <option value="doctor">Medical Specialist</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                className="form-control"
                placeholder="+1 (555) 019-2834"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="dob"
              className="form-control"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>

          {formData.role === 'doctor' && (
            <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', marginBottom: '24px', marginTop: '8px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--primary)' }}>Specialist Profile</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    required={formData.role === 'doctor'}
                    className="form-control"
                    placeholder="Cardiology, Pediatrics, General Medicine"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">Exp (Yrs)</label>
                    <input
                      type="number"
                      name="experienceYears"
                      required={formData.role === 'doctor'}
                      className="form-control"
                      placeholder="5"
                      value={formData.experienceYears}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fee ($)</label>
                    <input
                      type="number"
                      name="consultationFee"
                      required={formData.role === 'doctor'}
                      className="form-control"
                      placeholder="120"
                      value={formData.consultationFee}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Medical Bio / Statement</label>
                <textarea
                  name="bio"
                  rows="2"
                  className="form-control"
                  placeholder="Tell us about your medical background..."
                  value={formData.bio}
                  onChange={handleChange}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={submitting} style={{ marginTop: '12px' }}>
            {submitting ? 'Registering specialist profile...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
