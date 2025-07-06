import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../utils/authFetch';
import CharacterCard from './CharacterCard';
import CharacterSearch from './CharacterSearch';
import './Wishlist.css';
import { useTranslation } from 'react-i18next';

const Wishlist = ({ onLogout }) => {
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/wishlist/my-wishlist', {}, onLogout);
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      } else {
        throw new Error('Failed to fetch wishlist');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authFetch('/api/wishlist/stats/overview', {}, onLogout);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchWishlist();
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

  const handleAddToWishlist = async (characterData) => {
    try {
      const response = await authFetch('/api/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData)
      }, onLogout);

      if (response.ok) {
        const newItem = await response.json();
        setWishlist(prev => [newItem, ...prev]);
        setShowAddForm(false);
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to wishlist');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateWishlistItem = async (id, updateData) => {
    try {
      const response = await authFetch(`/api/wishlist/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      }, onLogout);

      if (response.ok) {
        const updatedItem = await response.json();
        setWishlist(prev => 
          prev.map(item => item._id === id ? updatedItem : item)
        );
        setEditingItem(null);
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update wishlist item');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDeleteWishlistItem = async (id) => {
    setDeleteConfirm({ id, type: 'wishlist' });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      const response = await authFetch(`/api/wishlist/remove/${deleteConfirm.id}`, {
        method: 'DELETE'
      }, onLogout);

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item._id !== deleteConfirm.id));
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from wishlist');
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

  const [transferSuccess, setTransferSuccess] = useState(null);

  const handleMoveToOwned = async (id) => {
    try {
      const response = await authFetch(`/api/wishlist/move-to-owned/${id}`, {
        method: 'POST'
      }, onLogout);

      if (response.ok) {
        const result = await response.json();
        // Remove from wishlist
        setWishlist(prev => prev.filter(item => item._id !== id));
        fetchStats();
        
        // Show success message
        setTransferSuccess(result.characterName || 'Character');
      } else {
        const errorData = await response.json();
        if (errorData.message === 'Character already owned by user') {
          // If character is already owned, just remove from wishlist
          setWishlist(prev => prev.filter(item => item._id !== id));
          fetchStats();
          setTransferSuccess('Character already owned - removed from wishlist');
        } else {
          throw new Error(errorData.message || 'Failed to move character');
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const closeTransferSuccess = () => {
    setTransferSuccess(null);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const WishlistForm = ({ item = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      characterId: item?.characterId || '',
      characterName: item?.characterName || '',
      element: item?.element || '',
      path: item?.path || '',
      rarity: item?.rarity || 5,
      priority: item?.priority || 1,
      notes: item?.notes || ''
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
        className="wishlist-form-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="wishlist-form"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h3>{item ? 'Edit Wishlist Item' : 'Add Character to Wishlist'}</h3>
          <form onSubmit={handleSubmit}>
            {!item && (
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
              <label>Priority (1-5):</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                required
              >
                <option value={1}>1 - Low Priority</option>
                <option value={2}>2 - Medium-Low</option>
                <option value={3}>3 - Medium</option>
                <option value={4}>4 - High</option>
                <option value={5}>5 - Highest Priority</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows="3"
                placeholder="Why do you want this character? Any specific plans?"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={!item && !formData.characterName}>
                {item ? 'Update' : 'Add to Wishlist'}
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

  const getPriorityColor = (priority) => {
    const colors = {
      1: '#6c757d',
      2: '#17a2b8',
      3: '#ffc107',
      4: '#fd7e14',
      5: '#dc3545'
    };
    return colors[priority] || '#6c757d';
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="wishlist">
      <div className="wishlist-header">
        <h1>{t('my_wishlist')}</h1>
        <button 
          className="btn-primary add-wishlist-btn"
          onClick={() => setShowAddForm(true)}
        >
          {t('add_to_wishlist')}
        </button>
      </div>

      {stats && (
        <div className="wishlist-stats">
          <div className="stat-card">
            <h3>{t('total_items')}</h3>
            <p>{stats.totalItems}</p>
          </div>
          <div className="stat-card">
            <h3>{t('average_priority')}</h3>
            <p>{Math.round(stats.averagePriority || 0)}</p>
          </div>
          <div className="stat-card">
            <h3>{t('highest_priority')}</h3>
            <p>{Math.max(...wishlist.map(item => item.priority), 0)}</p>
          </div>
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h2>{t('empty_wishlist')}</h2>
          <p>{t('add_first_wish')}</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          <AnimatePresence mode="popLayout">
            {wishlist.map((item, index) => (
              <motion.div
                key={item._id}
                className="wishlist-item-card"
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
                <div className="priority-badge" style={{ backgroundColor: getPriorityColor(item.priority) }}>
                  {t('priority')} {item.priority}
                </div>
                <CharacterCard character={{
                  id: item.characterId,
                  name: item.characterName,
                  element: item.element,
                  path: item.path,
                  rarity: item.rarity
                }} />
                <div className="wishlist-actions">
                  <button 
                    className="btn-success"
                    onClick={() => handleMoveToOwned(item._id)}
                    title={t('owned')}
                  >
                    {t('owned')}
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => setEditingItem(item)}
                  >
                    {t('edit')}
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDeleteWishlistItem(item._id)}
                  >
                    {t('remove')}
                  </button>
                </div>
                <div className="wishlist-details">
                  {item.notes && <p><strong>{t('notes')}:</strong> {item.notes}</p>}
                  <p><strong>{t('added')}:</strong> {new Date(item.addedAt).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showAddForm && (
          <WishlistForm
            onSubmit={handleAddToWishlist}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingItem && (
          <WishlistForm
            item={editingItem}
            onSubmit={(data) => handleUpdateWishlistItem(editingItem._id, data)}
            onCancel={() => setEditingItem(null)}
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

      <AnimatePresence>
        {transferSuccess && (
          <motion.div
            className="transfer-success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="transfer-success-dialog"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="transfer-success-icon">✅</div>
              <h3>{t('success_added')}</h3>
              <p><strong>{transferSuccess}</strong> {t('owned').toLowerCase()}.</p>
              <p className="transfer-info">The character is now in your owned characters with default level 1 and eidolon 0.</p>
              <div className="transfer-success-actions">
                <button 
                  className="btn-primary"
                  onClick={closeTransferSuccess}
                >
                  {t('got_it')}
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

export default Wishlist; 