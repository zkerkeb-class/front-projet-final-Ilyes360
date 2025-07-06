import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../theme';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [shouldRenderErrorPopup, setShouldRenderErrorPopup] = useState(false);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useTheme();

  useEffect(() => {
    document.title = 'Register';
  }, []);

  useEffect(() => {
    if (error) {
      setShowErrorPopup(true);
      setShouldRenderErrorPopup(true);
      const hideTimeout = setTimeout(() => setShowErrorPopup(false), 1000);
      const removeTimeout = setTimeout(() => setShouldRenderErrorPopup(false), 1350);
      return () => { clearTimeout(hideTimeout); clearTimeout(removeTimeout); };
      const timer = setTimeout(() => setShowErrorPopup(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setShowPopup(false);
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate('/login');
        }, 1800);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const errorPopupClass = showErrorPopup ? 'success-popup' : 'success-popup hide';

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <nav>
        <ul>
          <li>
            <button onClick={() => setDarkMode(dm => !dm)} style={{marginRight: 8}}>
              {darkMode ? '🌙 Dark' : '☀️ Light'}
            </button>
          </li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      </nav>
      <h2 className="login-heading">Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'var(--bg-accent)',
          color: 'var(--text-main)',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '18px',
          fontSize: '1.08rem',
          fontWeight: 500,
          textAlign: 'center',
          boxShadow: '0 1px 4px rgba(79,140,255,0.07)'
        }}>
          Create a new account to access the character library. Your username must be unique.
        </div>
        <div>
          <label>Username: </label>
          <input value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Register</button>
      </form>
      {shouldRenderErrorPopup && error && (
        <div className={errorPopupClass} style={{ background: '#ef4444' }}>
          <div className="checkmark" style={{ color: '#fff', fontSize: '3.2rem' }}>❌</div>
          <div className="popup-title">Registration Failed</div>
          <div className="popup-message">
            {error.toLowerCase().includes('already taken') || error.toLowerCase().includes('exist')
              ? 'Username already taken. Please choose a different username.'
              : error}
          </div>
        </div>
      )}
      {showPopup && (
        <div className={`success-popup${!showPopup ? ' hide' : ''}`}>
          <div className="checkmark" style={{ color: '#4ade80', fontSize: '3.2rem' }}>✅</div>
          <div className="popup-title">Registration Successful!</div>
          <div className="popup-message">You can now log in with your new account.</div>
        </div>
      )}
    </div>
  );
}

export default Register; 