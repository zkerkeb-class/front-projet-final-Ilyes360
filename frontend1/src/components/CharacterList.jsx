import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterCard from './CharacterCard';
import './CharacterCard.css';
import '../App.css';

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
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElements, setSelectedElements] = useState([]);
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/characters/getCharacters')
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
        Welcome to the library
      </div>
      <h2 className="character-list-heading">Characters</h2>
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
          Reset Filters
        </button>
        <div style={{ marginBottom: 8 }}>
          <strong>Element: </strong>
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
          <strong>Path: </strong>
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
          <strong>Rarity: </strong>
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
    </motion.div>
  );
};

export default CharacterList; 