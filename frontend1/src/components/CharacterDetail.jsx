import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import './CharacterDetail.css';
import { useTranslation } from 'react-i18next';

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
import { splashartMap } from '../assets/icons/splashart/Splashart';
import { authFetch } from '../utils/authFetch';

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

const FIELD_LABELS = {
  name: 'name',
  fullName: 'full_name',
  element: 'element',
  path: 'path',
  rarity: 'rarity',
  spNeed: 'max_energy',
  description: 'description',
  speed: 'speed',
  taunt: 'taunt',
  basehp: 'base_hp',
  baseatk: 'base_atk',
  basedef: 'base_def',
  basicatkdescription: 'basic_attack_description',
  basicatkname: 'basic_attack_name',
  skilldescription: 'skill_description',
  skillname: 'skill_name',
  talentdescription: 'talent_description',
  talentname: 'talent_name',
  techniquedescription: 'technique_description',
  techniquename: 'technique_name',
  ultdescription: 'ultimate_description',
  ultname: 'ultimate_name',
};

const STAT_FIELDS = ['rarity', 'element', 'path', 'speed', 'taunt', 'basehp', 'baseatk', 'basedef', 'spNeed'];
const DESCRIPTION_FIELDS = ['description'];

export function BackToListButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  // Get the previous location from state, or default to characters list
  const previousPath = location.state?.from || '/characters';
  const previousLabel = location.state?.fromLabel || t('character_list');
  
  return (
    <button className="back-to-list" onClick={() => navigate(previousPath)}>
      &larr; {t('back_to')} {previousLabel}
    </button>
  );
}

function highlightNumbers(text) {
  // Match numbers, decimals, and percentages (e.g., 100, 12.5, 50%)
  return text.replace(/(\b\d+(?:\.\d+)?%?\b)/g, '<span class="highlight-number">$1</span>');
}

function renderParagraphs(text) {
  if (!text) return null;
  // Split on a dot followed by a space or end of string, keep the dot
  const sentences = text.match(/[^.]+\.(?:\s|$)/g) || [text];
  return sentences.map((sentence, idx) => (
    <p key={idx} style={{ margin: '0 0 1em 0' }}
      dangerouslySetInnerHTML={{ __html: highlightNumbers(sentence.trim()) }} />
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
  const { t } = useTranslation();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSplashModal, setShowSplashModal] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const res = await authFetch(`http://localhost:3000/api/characters/${id}`, {}, () => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        });
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
      document.title = character.fullName || character.name || t('character_detail');
    }
  }, [character, t]);

  // Close splash modal on ESC
  useEffect(() => {
    if (!showSplashModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowSplashModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSplashModal]);

  if (loading) return <div className="character-detail-card">{t('loading')}</div>;
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
              <span className="blue-label">{t('rarity')}:</span> <span className={`rarity-${character.rarity}`}>{character.rarity}★</span>
            </div>
          </div>
          <div className="character-detail-section">
            <div className="description-label">{t('stats')}</div>
            <div className="character-detail-stats">
              {STAT_FIELDS.filter(key => character[key] !== undefined && character[key] !== '' && key !== 'rarity' && key !== 'element' && key !== 'path').map(key => (
                <div className="character-detail-stat" key={key}>
                  <strong>{t(FIELD_LABELS[key] || key)}:</strong> {character[key]}
                </div>
              ))}
            </div>
          </div>
          {DESCRIPTION_FIELDS.map(key => character[key] && (
            <div className="character-detail-section" key={key}>
              <div className="description-label">{t('description')}</div>
              <div className="character-detail-description">{renderParagraphs(character[key])}</div>
            </div>
          ))}
          {renderAbility(character.basicatkname, character.basicatkdescription, t('basic_attack'))}
          {renderAbility(character.skillname, character.skilldescription, t('skill'))}
          {renderAbility(character.talentname, character.talentdescription, t('talent'))}
          {renderAbility(character.techniquename, character.techniquedescription, t('technique'))}
          {renderAbility(character.ultname, character.ultdescription, t('ultimate'))}
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