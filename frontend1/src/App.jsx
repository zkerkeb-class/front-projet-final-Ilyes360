import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import CharacterList from './components/CharacterList';
import Login from './components/Login';
import CharacterDetail, { BackToListButton } from './components/CharacterDetail';
import { useTheme } from './theme';
import logo from './assets/icons/logo.png';

function AppContent() {
  const location = useLocation();
  const hideNav = location.pathname === '/login';
  const isLoggedIn = !!localStorage.getItem('token');
  const [darkMode, setDarkMode] = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="App">
      <img src={logo} alt="Logo" className="app-logo" />
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
      <Routes>
        <Route index element={isLoggedIn ? <CharacterList /> : <Navigate to="/login" replace />} />
        <Route path="characters" element={isLoggedIn ? <CharacterList /> : <Navigate to="/login" replace />} />
        <Route path="characters/:id" element={isLoggedIn ? <CharacterDetail isLoggedIn={isLoggedIn} /> : <Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
      </Routes>
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
