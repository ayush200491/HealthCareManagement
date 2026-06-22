import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <span style={{ color: 'var(--accent-primary)' }}>✚</span> HealthCare
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          {user ? (
            <>
              <li>
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/doctor' : '/patient'}>
                  Dashboard
                </Link>
              </li>
              <li>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Logged in as <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong> ({user.role})
                </span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
