import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import './CharacterDetail.css';

import physicalIcon from '../assets/icons/elements/physical.png';
import fireIcon from '../assets/icons/elements/fire.png';
import iceIcon from '../assets/icons/elements/ice.png';
import lightningIcon from '../assets/icons/elements/lightning.png';
import windIcon from '../assets/icons/elements/wind.png';
import quantumIcon from '../assets/icons/elements/quantum.png';
import imaginaryIcon from '../assets/icons/elements/imaginary.png';
import acheronPortrait from '../assets/icons/portraits/acheron.webp';

import destructionIcon from '../assets/icons/paths/Icon_Destruction.webp';
import huntIcon from '../assets/icons/paths/Icon_The_Hunt.webp';
import eruditionIcon from '../assets/icons/paths/Icon_Erudition.webp';
import harmonyIcon from '../assets/icons/paths/Icon_Harmony.webp';
import nihilityIcon from '../assets/icons/paths/Icon_Nihility.webp';
import preservationIcon from '../assets/icons/paths/Icon_Preservation.webp';
import abundanceIcon from '../assets/icons/paths/Icon_Abundance.webp';
import remembranceIcon from '../assets/icons/paths/Icon_Remembrance.webp';
import { splashartMap } from '../assets/icons/splashart/Splashart';

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

const portraitMap = {
  Acheron: acheronPortrait,
  // Add more mappings as needed
};

const FIELD_LABELS = {
  name: 'Name',
  fullName: 'Full Name',
  element: 'Element',
  path: 'Path',
  rarity: 'Rarity',
  spNeed: 'Max Energy',
  description: 'Description',
  speed: 'Speed',
  taunt: 'Taunt',
  basehp: 'Base HP',
  baseatk: 'Base ATK',
  basedef: 'Base DEF',
  basicatkdescription: 'Basic Attack Description',
  basicatkname: 'Basic Attack Name',
  skilldescription: 'Skill Description',
  skillname: 'Skill Name',
  talentdescription: 'Talent Description',
  talentname: 'Talent Name',
  techniquedescription: 'Technique Description',
  techniquename: 'Technique Name',
  ultdescription: 'Ultimate Description',
  ultname: 'Ultimate Name',
};

const FIELD_ORDER = [
  'name', 'fullName', 'element', 'path', 'rarity', 'spNeed', 'description',
  'speed', 'taunt', 'basehp', 'baseatk', 'basedef',
  'basicatkname', 'basicatkdescription',
  'skillname', 'skilldescription',
  'talentname', 'talentdescription',
  'techniquename', 'techniquedescription',
  'ultname', 'ultdescription',
];

const STAT_FIELDS = ['rarity', 'element', 'path', 'speed', 'taunt', 'basehp', 'baseatk', 'basedef', 'spNeed'];
const DESCRIPTION_FIELDS = ['description'];
const ABILITY_FIELDS = [
  ['basicatkname', 'basicatkdescription'],
  ['skillname', 'skilldescription'],
  ['talentname', 'talentdescription'],
  ['techniquename', 'techniquedescription'],
  ['ultname', 'ultdescription'],
];

const ABILITY_LABELS = {
  basicatkname: 'Basic Attack',
  skillname: 'Skill',
  ultname: 'Ultimate',
  techniquename: 'Technique',
  talentname: 'Talent',
};

export function BackToListButton() {
  const navigate = useNavigate();
  return (
    <button className="back-to-list" onClick={() => navigate('/characters')}>
      &larr; Back to List
    </button>
  );
}

function renderParagraphs(text) {
  if (!text) return null;
  // Split on a dot followed by a space or end of string, keep the dot
  const sentences = text.match(/[^.]+\.(?:\s|$)/g) || [text];
  return sentences.map((sentence, idx) => (
    <p key={idx} style={{ margin: '0 0 1em 0' }}>{sentence.trim()}</p>
  ));
}

function renderAbility(name, desc, label) {
  if (Array.isArray(name) && Array.isArray(desc)) {
    return name.map((n, i) => (
      <div className="character-detail-section" key={n}>
        <div className="ability-label">{label}</div>
        <h3>{n}</h3>
        <div className="character-detail-description">{renderParagraphs(desc[i])}</div>
      </div>
    ));
  } else if (name && desc) {
    return (
      <div className="character-detail-section">
        <div className="ability-label">{label}</div>
        <h3>{name}</h3>
        <div className="character-detail-description">{renderParagraphs(desc)}</div>
      </div>
    );
  }
  return null;
}

const CharacterDetail = () => {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSplashModal, setShowSplashModal] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/characters/${id}`);
        if (!res.ok) throw new Error('Character not found');
        const data = await res.json();
        setCharacter(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [id]);

  useEffect(() => {
    if (character) {
      document.title = character.fullName || character.name || 'Character Detail';
    }
  }, [character]);

  // Close splash modal on ESC
  useEffect(() => {
    if (!showSplashModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowSplashModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSplashModal]);

  if (loading) return <div className="character-detail-card">Loading...</div>;
  if (error) return <div className="character-detail-card error">{error}</div>;
  if (!character) return null;

  // Side-by-side layout for all characters
  return (
    <>
      <motion.div
        className="character-detail-card acheron-detail-layout"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.4 }}
      >
        {splashartMap[character.name] && (
          <div className="character-splashart-block">
            <img
              src={splashartMap[character.name]}
              alt={`${character.name} splash art`}
              className="character-splashart-img"
              style={{ cursor: 'zoom-in' }}
              onClick={() => setShowSplashModal(true)}
            />
          </div>
        )}
        <div className="acheron-info-block">
          <div className="character-detail-header">
            <h2 className="blue-label">{character.fullName || character.name}</h2>
            <div className="subtitle">
              {elementIcons[character.element] && <img src={elementIcons[character.element]} alt={character.element} className="character-icon" />} <span className="blue-label">{character.element}</span> |
              {pathIcons[character.path] && <img src={pathIcons[character.path]} alt={character.path} className="character-icon" />} <span className="blue-label">{character.path}</span> |
              <span className="blue-label">Rarity:</span> <span className={`rarity-${character.rarity}`}>{character.rarity}★</span>
            </div>
          </div>
          <div className="character-detail-section">
            <h3>Stats</h3>
            <div className="character-detail-stats">
              {STAT_FIELDS.filter(key => character[key] !== undefined && character[key] !== '' && key !== 'rarity' && key !== 'element' && key !== 'path').map(key => (
                <div className="character-detail-stat" key={key}>
                  <strong>{FIELD_LABELS[key] || key}:</strong> {character[key]}
                </div>
              ))}
            </div>
          </div>
          {DESCRIPTION_FIELDS.map(key => character[key] && (
            <div className="character-detail-section" key={key}>
              <div className="description-label">Description</div>
              <div className="character-detail-description">{renderParagraphs(character[key])}</div>
            </div>
          ))}
          {renderAbility(character.basicatkname, character.basicatkdescription, 'Basic Attack')}
          {renderAbility(character.skillname, character.skilldescription, 'Skill')}
          {renderAbility(character.talentname, character.talentdescription, 'Talent')}
          {renderAbility(character.techniquename, character.techniquedescription, 'Technique')}
          {renderAbility(character.ultname, character.ultdescription, 'Ultimate')}
        </div>
      </motion.div>
      {showSplashModal && splashartMap[character.name] && (
        <div className="acheron-modal-overlay" onClick={() => setShowSplashModal(false)}>
          <img
            src={splashartMap[character.name]}
            alt={`${character.name} full splash art`}
            className="acheron-modal-img"
            onClick={e => e.stopPropagation()}
          />
          <button className="acheron-modal-close" onClick={() => setShowSplashModal(false)}>&times;</button>
        </div>
      )}
    </>
  );
};

export default CharacterDetail; 