import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterCard from './CharacterCard';
import './CharacterCard.css';
import '../App.css';
import { authFetch } from '../utils/authFetch';
import { useTranslation } from 'react-i18next';

// Import icons for filters
import physicalIcon from '../assets/icons/elements/physical.png';
import fireIcon from '../assets/icons/elements/fire.png';
import iceIcon from '../assets/icons/elements/ice.png';
import lightningIcon from '../assets/icons/elements/lightning.png';
import windIcon from '../assets/icons/elements/wind.png';
import quantumIcon from '../assets/icons/elements/quantum.png';
import imaginaryIcon from '../assets/icons/elements/imaginary.png';

import destructionIcon from '../assets/icons/paths/Icon_Destruction.webp';
import huntIcon from '../assets/icons/paths/Icon_The_Hunt.webp';
import eruditionIcon from '../assets/icons/paths/Icon_Erudition.webp';
import harmonyIcon from '../assets/icons/paths/Icon_Harmony.webp';
import nihilityIcon from '../assets/icons/paths/Icon_Nihility.webp';
import preservationIcon from '../assets/icons/paths/Icon_Preservation.webp';
import abundanceIcon from '../assets/icons/paths/Icon_Abundance.webp';
import remembranceIcon from '../assets/icons/paths/Icon_Remembrance.webp';

const elementIcons = {
  Physical: physicalIcon,
  Fire: fireIcon,
  Ice: iceIcon,
  Lightning: lightningIcon,
  Wind: windIcon,
  Quantum: quantumIcon,
  Imaginary: imaginaryIcon,
};

const pathIcons = {
  Destruction: destructionIcon,
  Hunt: huntIcon,
  Erudition: eruditionIcon,
  Harmony: harmonyIcon,
  Nihility: nihilityIcon,
  Preservation: preservationIcon,
  Abundance: abundanceIcon,
  Remembrance: remembranceIcon,
};

const rarities = [5, 4];

const CharacterList = () => {
  const { t } = useTranslation();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElements, setSelectedElements] = useState([]);
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    authFetch('http://localhost:3000/api/characters/getCharacters', {}, () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    })
      .then(res => res.json())
      .then(data => {
        setCharacters(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setVisibleCount(6);
  }, [selectedElements, selectedPaths, selectedRarities]);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollY + windowHeight >= docHeight - 200) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(v => v + 6);
          setLoadingMore(false);
        }, 500);
      }
      
      // Show/hide back to top button
      setShowBackToTop(scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore]);

  useEffect(() => {
    document.title = 'Character Library';
  }, []);

  const toggleFilter = (value, selected, setSelected) => {
    setSelected(selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    );
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const filteredCharacters = characters.filter(char => {
    const elementMatch = selectedElements.length === 0 || selectedElements.includes(char.element);
    const pathMatch = selectedPaths.length === 0 || selectedPaths.includes(char.path);
    const rarityMatch = selectedRarities.length === 0 || selectedRarities.includes(char.rarity);
    return elementMatch && pathMatch && rarityMatch;
  });

  if (loading) return <p>Loading...</p>;

  return (
    <motion.div
      className="character-list-container"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4 }}
    >
      <div className="character-list-welcome" style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-accent)', marginBottom: 10 }}>
        Welcome to the library!
      </div>
      <h2 className="character-list-heading">{t('characters')}</h2>
      {/* Filter Buttons */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => {
            setSelectedElements([]);
            setSelectedPaths([]);
            setSelectedRarities([]);
          }}
          className="filter-btn filter-reset-btn"
          style={{ marginBottom: 12, marginRight: 12 }}
        >
          {t('reset_filters')}
        </button>
        <div style={{ marginBottom: 8 }}>
          <strong>{t('element')}: </strong>
          {Object.entries(elementIcons).map(([element, icon]) => (
            <button
              key={element}
              onClick={() => toggleFilter(element, selectedElements, setSelectedElements)}
              className={`filter-btn${selectedElements.includes(element) ? ' filter-btn-selected' : ''}`}
              style={{ marginRight: 6, marginBottom: 4 }}
            >
              <img src={icon} alt={element} style={{ width: 20, height: 20, verticalAlign: 'middle', marginRight: 4 }} />
              {element}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>{t('path')}: </strong>
          {Object.entries(pathIcons).map(([path, icon]) => (
            <button
              key={path}
              onClick={() => toggleFilter(path, selectedPaths, setSelectedPaths)}
              className={`filter-btn${selectedPaths.includes(path) ? ' filter-btn-selected' : ''}`}
              style={{ marginRight: 6, marginBottom: 4 }}
            >
              <img src={icon} alt={path} style={{ width: 20, height: 20, verticalAlign: 'middle', marginRight: 4 }} />
              {path}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>{t('rarity')}: </strong>
          {rarities.map(rarity => (
            <button
              key={rarity}
              onClick={() => toggleFilter(rarity, selectedRarities, setSelectedRarities)}
              className={`filter-btn${selectedRarities.includes(rarity) ? ' filter-btn-selected' : ''} rarity-${rarity}-filter`}
              style={{ marginRight: 6, marginBottom: 4, fontWeight: 700 }}
            >
              {rarity}★
            </button>
          ))}
        </div>
      </div>
      <div className="character-card-grid">
        <AnimatePresence mode="popLayout">
        {filteredCharacters.slice(0, visibleCount).map(char => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25 }}
              layout
            >
              <CharacterCard character={char} />
            </motion.div>
        ))}
        </AnimatePresence>
      </div>
      {visibleCount < filteredCharacters.length && (
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <div className="infinite-scroll-spinner" />
        </div>
      )}
      
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
    </motion.div>
  );
};

export default CharacterList; 