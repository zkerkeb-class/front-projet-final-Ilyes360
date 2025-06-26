import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import CharacterList from './components/CharacterList';
import Login from './components/Login';
import CharacterDetail, { BackToListButton } from './components/CharacterDetail';
import { useTheme } from './theme';
import logo from './assets/icons/logo.png';
import { AnimatePresence, motion } from 'framer-motion';
import Register from './components/Register';

function AppContent() {
  const location = useLocation();
  const hideNav = location.pathname === '/login';
  const isLoggedIn = !!localStorage.getItem('token');
  const [darkMode, setDarkMode] = useTheme();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    setShowLogoutPopup(true);
    setTimeout(() => {
      setShowLogoutPopup(false);
      localStorage.removeItem('token');
      window.location.href = '/login';
    }, 1600);
  };

  return (
    <div className="App">
      <img src={logo} alt="Logo" className="app-logo" />
      {showLogoutPopup && (
        <div className="success-popup">
          <div className="checkmark">👋</div>
          <div className="popup-title">Goodbye!</div>
          <div className="popup-message">You have been logged out. See you next time!</div>
        </div>
      )}
      {!hideNav && (
        <nav>
          <ul>
            <li>
              <button onClick={() => setDarkMode(dm => !dm)} style={{marginRight: 8}}>
                {darkMode ? '🌙 Dark' : '☀️ Light'}
              </button>
            </li>
            {location.pathname.match(/^\/characters\/[\w-]+$/) && (
              <li><BackToListButton /></li>
            )}
            {!isLoggedIn && <li><Link to="/login">Login</Link></li>}
            {isLoggedIn && location.pathname !== '/login' && <li><button onClick={handleLogout}>Logout</button></li>}
          </ul>
        </nav>
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route 
            index 
            element={
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                {isLoggedIn ? <CharacterList /> : <Navigate to="/login" replace />}
              </motion.div>
            }
          />
          <Route 
            path="characters" 
            element={
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                {isLoggedIn ? <CharacterList /> : <Navigate to="/login" replace />}
              </motion.div>
            }
          />
          <Route 
            path="characters/:id" 
            element={
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                {isLoggedIn ? <CharacterDetail isLoggedIn={isLoggedIn} /> : <Navigate to="/login" replace />}
              </motion.div>
            }
          />
          <Route 
            path="login" 
            element={
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                <Login />
              </motion.div>
            }
          />
          <Route 
            path="register" 
            element={
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                <Register />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
