import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const services = [
    { icon: '🩺', title: 'Primary Care', desc: 'Comprehensive health checks, disease management, and family medicine counseling.' },
    { icon: '🫀', title: 'Cardiology', desc: 'Heart screenings, ECG reports, specialist consultations, and preventive advice.' },
    { icon: '🦷', title: 'Dental Clinic', desc: 'Orthodontics, teeth whitening, hygiene checkups, and standard operations.' },
    { icon: '🔬', title: 'Diagnostic Lab', desc: 'Rapid hematology screening, urine tests, biochemical profile checks, and digital imaging.' },
    { icon: '🧸', title: 'Pediatrics', desc: 'Infant immunization schedules, child psychology checks, and nutrition charts.' },
    { icon: '🧘', title: 'Mental Health', desc: 'Therapy sessions, anxiety guidance, clinical evaluations, and stress relief counseling.' },
  ];

  const doctors = [
    { name: 'Dr. Emily Watson', role: 'Chief Cardiologist', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', tag: 'Heart Specialist' },
    { name: 'Dr. Marcus Vance', role: 'Head Pediatrician', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', tag: 'Child Specialist' },
    { name: 'Dr. Sarah Lin', role: 'Dental Surgeon', img: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300', tag: 'Oral Health Specialist' },
  ];

  const testimonials = [
    { text: "This management system is incredible. Booking appointments with specialized doctors takes only 10 seconds. Highly reliable and lag-free!", author: "Samantha Green", role: "Patient" },
    { text: "Logistics, prescriptions, and daily consultation slots are perfectly synchronized. Highly recommended for modern clinics.", author: "Dr. Marcus Vance", role: "MD, Pediatrics" },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', padding: '80px 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <span style={{ backgroundColor: '#dbeafe', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🏥 Modern Clinic Administration
            </span>
            <h1 style={{ marginTop: '16px', fontSize: '3.2rem', color: '#0f172a', fontWeight: '800', lineHeight: '1.15' }}>
              Professional <br /><span className="text-gradient">Healthcare Portal</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', marginTop: '20px', marginBottom: '32px', maxWidth: '540px' }}>
              Synchronize doctor availability schedules, book consultation slots, and access clinical prescriptions through a secure, fast, and hospital-grade dashboard.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {user ? (
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/doctor' : '/patient'} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '0.95rem' }}>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '0.95rem' }}>
                    Access Portal
                  </Link>
                  <Link to="/register" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '0.95rem' }}>
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: '450px', height: '450px', borderRadius: '30px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', padding: '10px', boxShadow: 'var(--shadow-lg)' }}>
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500" 
                alt="Healthcare Management" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services List Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.25rem', color: '#0f172a' }}>Our Healthcare Services</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '12px auto 0' }}>
              Access full clinical expertise and diagnostics right in the palm of your hand.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {services.map((srv, idx) => (
              <div key={idx} className="card" style={{ display: 'flex', gap: '20px', padding: '28px', margin: 0, transition: 'var(--transition-normal)' }}>
                <div style={{ fontSize: '2.5rem', lineHeight: '1' }}>{srv.icon}</div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#0f172a' }}>{srv.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{srv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctor Spotlight */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.25rem', color: '#0f172a' }}>Meet Our Top Specialists</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '12px auto 0' }}>
              Qualified clinical professionals dedicated to providing state-of-the-art diagnostics and patient care.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {doctors.map((doc, idx) => (
              <div key={idx} className="card" style={{ textAlign: 'center', padding: '24px', margin: 0 }}>
                <img 
                  src={doc.img} 
                  alt={doc.name} 
                  style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', border: '4px solid #eff6ff', boxShadow: 'var(--shadow-sm)' }}
                />
                <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
                  {doc.tag}
                </span>
                <h3 style={{ fontSize: '1.15rem', marginTop: '12px', color: '#0f172a' }}>{doc.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{doc.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.25rem', color: '#0f172a' }}>What Our Patients Say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {testimonials.map((test, idx) => (
              <div key={idx} className="card" style={{ margin: 0, padding: '32px', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '3rem', color: '#e2e8f0', lineHeight: 1 }}>“</span>
                <p style={{ color: '#334155', fontStyle: 'italic', fontSize: '0.95rem', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                  "{test.text}"
                </p>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{test.author}</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '650px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.25rem', color: '#0f172a' }}>Get In Touch</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              Have questions? Send us an inquiry and our medical coordinators will contact you.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Message successfully sent!'); }} className="card" style={{ padding: '40px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" required className="form-control" placeholder="Ayush Patidar" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" required className="form-control" placeholder="name@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea rows="4" required className="form-control" placeholder="Your inquiry details..." style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '12px' }}>
              Send Inquiry
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>© 2026 HealthCare Management Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
