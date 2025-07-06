import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme';
import './Dashboard.css';

const Dashboard = () => {
  const [darkMode] = useTheme();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to HSR Character Manager</h1>
        <p>Manage your character collection and plan your future pulls</p>
      </div>

      <div className="dashboard-grid">
        <Link to="/collection" className="dashboard-card collection-card">
          <div className="card-icon">📚</div>
          <h2>My Collection</h2>
          <p>View and manage the characters you own</p>
          <ul>
            <li>Track character levels and eidolons</li>
            <li>Add notes and personal details</li>
            <li>View collection statistics</li>
          </ul>
        </Link>

        <Link to="/wishlist" className="dashboard-card wishlist-card">
          <div className="card-icon">⭐</div>
          <h2>My Wishlist</h2>
          <p>Plan your future character pulls</p>
          <ul>
            <li>Set priority levels for characters</li>
            <li>Add notes about why you want them</li>
            <li>Move characters to collection when obtained</li>
          </ul>
        </Link>

        <Link to="/characters" className="dashboard-card browse-card">
          <div className="card-icon">🔍</div>
          <h2>Browse Characters</h2>
          <p>Explore all available characters</p>
          <ul>
            <li>View character details and stats</li>
            <li>Filter by element, path, and rarity</li>
            <li>Add characters to collection or wishlist</li>
          </ul>
        </Link>
      </div>

      <div className="dashboard-footer">
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          <Link to="/collection" className="quick-action-btn">
            + Add Character to Collection
          </Link>
          <Link to="/wishlist" className="quick-action-btn">
            + Add to Wishlist
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 