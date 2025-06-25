import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CharacterCard.css';

import physicalIcon from '../assets/icons/elements/physical.png';
import fireIcon from '../assets/icons/elements/fire.png';
import iceIcon from '../assets/icons/elements/ice.png';
import lightningIcon from '../assets/icons/elements/lightning.png';
import windIcon from '../assets/icons/elements/wind.png';
import quantumIcon from '../assets/icons/elements/quantum.png';
import imaginaryIcon from '../assets/icons/elements/imaginary.png';
import { portraitMap } from '../assets/icons/portraits/portraits';

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

const CharacterCard = ({ character }) => {
  const navigate = useNavigate();
  return (
    <div className="character-card" onClick={() => navigate(`/characters/${character.id}`)} tabIndex={0} role="button">
      {portraitMap[character.name] && (
        <div className="character-portrait-wrapper">
          <img
            src={portraitMap[character.name]}
            alt={character.name}
            className="character-portrait"
            style={{ width: 100, height: 100, borderRadius: '50%', marginBottom: 8, objectFit: 'cover' }}
          />
        </div>
      )}
      <div className="character-card-header">
        <strong className="character-card-name">{character.name}</strong>
        <strong className={`character-card-rarity rarity-${character.rarity}`}>{character.rarity}★</strong>
      </div>
      <div className="character-card-info">
        <span className="character-card-element">
          {elementIcons[character.element] && <img src={elementIcons[character.element]} alt={character.element} className="character-icon" />} {character.element}
        </span>
        <span className="character-card-path">
          {pathIcons[character.path] && <img src={pathIcons[character.path]} alt={character.path} className="character-icon" />} {character.path}
        </span>
      </div>
    </div>
  );
};

export default CharacterCard; 