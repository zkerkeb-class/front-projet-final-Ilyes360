import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../utils/authFetch';
import CharacterCard from './CharacterCard';
import CharacterSearch from './CharacterSearch';
import './UserCollection.css';
import { useTranslation } from 'react-i18next';

const UserCollection = ({ onLogout }) => {
  const { t } = useTranslation();
  const [userCharacters, setUserCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const fetchUserCharacters = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/user-characters/my-characters', {}, onLogout);
      if (response.ok) {
        const data = await response.json();
        setUserCharacters(data);
      } else {
        throw new Error('Failed to fetch user characters');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authFetch('/api/user-characters/stats/overview', {}, onLogout);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchUserCharacters();
    fetchStats();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setShowBackToTop(scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddCharacter = async (characterData) => {
    try {
      const response = await authFetch('/api/user-characters/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData)
      }, onLogout);

      if (response.ok) {
        const newCharacter = await response.json();
        setUserCharacters(prev => [newCharacter, ...prev]);
        setShowAddForm(false);
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add character');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateCharacter = async (id, updateData) => {
    try {
      const response = await authFetch(`/api/user-characters/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      }, onLogout);

      if (response.ok) {
        const updatedCharacter = await response.json();
        setUserCharacters(prev => 
          prev.map(char => char._id === id ? updatedCharacter : char)
        );
        setEditingCharacter(null);
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update character');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDeleteCharacter = async (id) => {
    setDeleteConfirm({ id, type: 'collection' });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      const response = await authFetch(`/api/user-characters/remove/${deleteConfirm.id}`, {
        method: 'DELETE'
      }, onLogout);

      if (response.ok) {
        setUserCharacters(prev => prev.filter(char => char._id !== deleteConfirm.id));
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove character');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const CharacterForm = ({ character = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      characterId: character?.characterId || '',
      characterName: character?.characterName || '',
      element: character?.element || '',
      path: character?.path || '',
      rarity: character?.rarity || 5,
      eidolon: character?.eidolon || 0,
      level: character?.level || 1,
      notes: character?.notes || ''
    });

    const handleCharacterSelect = (selectedCharacter) => {
      setFormData(prev => ({
        ...prev,
        characterId: selectedCharacter.characterId,
        characterName: selectedCharacter.characterName,
        element: selectedCharacter.element,
        path: selectedCharacter.path,
        rarity: selectedCharacter.rarity
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <motion.div 
        className="character-form-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="character-form"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h3>{character ? 'Edit Character' : 'Add Character to Collection'}</h3>
          <form onSubmit={handleSubmit}>
            {!character && (
              <div className="form-group">
                <label>Search for Character:</label>
                <CharacterSearch 
                  onCharacterSelect={handleCharacterSelect}
                  placeholder="Type character name or use filters..."
                />
                {formData.characterName && (
                  <div className="selected-character">
                    <strong>Selected:</strong> {formData.characterName} ({formData.element} • {formData.path} • {formData.rarity}★)
                  </div>
                )}
              </div>
            )}
            
            {/* Hidden fields for form data - auto-filled by search */}
            <input type="hidden" value={formData.characterId} />
            <input type="hidden" value={formData.characterName} />
            <input type="hidden" value={formData.element} />
            <input type="hidden" value={formData.path} />
            <input type="hidden" value={formData.rarity} />
            <div className="form-group">
              <label>Eidolon Level (0-6):</label>
              <input
                type="number"
                min="0"
                max="6"
                value={formData.eidolon}
                onChange={(e) => setFormData(prev => ({ ...prev, eidolon: parseInt(e.target.value) }))}
              />
            </div>
            <div className="form-group">
              <label>Character Level (1-80):</label>
              <input
                type="number"
                min="1"
                max="80"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
              />
            </div>
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={!character && !formData.characterName}>
                {character ? 'Update' : 'Add'} Character
              </button>
              <button type="button" onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-collection">
      <div className="collection-header">
        <h1>{t('my_collection')}</h1>
        <button 
          className="btn-primary add-character-btn"
          onClick={() => setShowAddForm(true)}
        >
          {t('add_character')}
        </button>
      </div>

      {stats && (
        <div className="collection-stats">
          <div className="stat-card">
            <h3>{t('total_characters')}</h3>
            <p>{stats.totalCharacters}</p>
          </div>
          <div className="stat-card">
            <h3>{t('total_eidolons')}</h3>
            <p>{stats.totalEidolons}</p>
          </div>
          <div className="stat-card">
            <h3>{t('average_level')}</h3>
            <p>{Math.round(stats.averageLevel || 0)}</p>
          </div>
        </div>
      )}

      {userCharacters.length === 0 ? (
        <div className="empty-collection">
          <h2>{t('empty_collection')}</h2>
          <p>{t('add_first_character')}</p>
        </div>
      ) : (
        <div className="characters-grid">
          <AnimatePresence mode="popLayout">
            {userCharacters.map((character, index) => (
              <motion.div
                key={character._id}
                className="user-character-card"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20, height: 0 }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeInOut",
                  delay: index * 0.1
                }}
                layout
              >
                <CharacterCard character={{
                  id: character.characterId,
                  name: character.characterName,
                  element: character.element,
                  path: character.path,
                  rarity: character.rarity
                }} />
                <div className="character-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setEditingCharacter(character)}
                  >
                    {t('edit')}
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDeleteCharacter(character._id)}
                  >
                    {t('remove')}
                  </button>
                </div>
                <div className="character-details">
                  <p><strong>{t('level')}:</strong> {character.level}</p>
                  <p><strong>{t('eidolon')}:</strong> {character.eidolon}/6</p>
                  {character.notes && <p><strong>{t('notes')}:</strong> {character.notes}</p>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showAddForm && (
          <CharacterForm
            onSubmit={handleAddCharacter}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingCharacter && (
          <CharacterForm
            character={editingCharacter}
            onSubmit={(data) => handleUpdateCharacter(editingCharacter._id, data)}
            onCancel={() => setEditingCharacter(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="delete-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="delete-confirm-dialog"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="delete-confirm-icon">🗑️</div>
              <h3>{t('confirm_deletion')}</h3>
              <p>{t('confirm_deletion_msg')}</p>
              <p className="delete-warning">{t('deletion_warning')}</p>
              <div className="delete-confirm-actions">
                <button 
                  className="btn-secondary"
                  onClick={cancelDelete}
                >
                  {t('cancel')}
                </button>
                <button 
                  className="btn-danger"
                  onClick={confirmDelete}
                >
                  {t('delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            className="back-to-top-btn"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="arrow-icon">↑</span>
            <span>{t('top')}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserCollection; 