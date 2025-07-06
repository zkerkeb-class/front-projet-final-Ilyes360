import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../theme';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [shouldRenderErrorPopup, setShouldRenderErrorPopup] = useState(false);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useTheme();

  useEffect(() => {
    document.title = 'Login';
  }, []);

  useEffect(() => {
    if (error) {
      setShowErrorPopup(true);
      setShouldRenderErrorPopup(true);
      const hideTimeout = setTimeout(() => setShowErrorPopup(false), 1000);
      const removeTimeout = setTimeout(() => setShouldRenderErrorPopup(false), 1350);
      return () => { clearTimeout(hideTimeout); clearTimeout(removeTimeout); };
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowPopup(false);
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (onLogin) onLogin(data.token);
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate('/');
        }, 1500);
      } else {
        setError(data.message || 'Login failed');
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
          <li><Link to="/register">Register</Link></li>
        </ul>
      </nav>
      <h2 className="login-heading">Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
      {shouldRenderErrorPopup && error && (
        <div className={errorPopupClass} style={{ background: '#ef4444' }}>
          <div className="checkmark" style={{ color: '#fff', fontSize: '3.2rem' }}>❌</div>
          <div className="popup-title">Login Failed</div>
          <div className="popup-message">{error}</div>
        </div>
      )}
      {showPopup && (
        <div className={`success-popup${!showPopup ? ' hide' : ''}`}>
          <div className="checkmark" style={{ color: '#4ade80', fontSize: '3.2rem' }}>✅</div>
          <div className="popup-title">Login Successful!</div>
          <div className="popup-message">Welcome back!</div>
        </div>
      )}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <span>Don't have an account? </span>
        <Link to="/register">Register here</Link>
      </div>
    </div>
  );
}

export default Login; 