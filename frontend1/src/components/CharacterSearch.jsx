import React, { useState, useEffect, useRef } from 'react';
import { authFetch } from '../utils/authFetch';
import { portraitMap } from '../assets/icons/portraits/portraits';
import './CharacterSearch.css';

const CharacterSearch = ({ onCharacterSelect, placeholder = "Search for a character..." }) => {
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Fetch all characters on component mount
  useEffect(() => {
    fetchCharacters();
  }, []);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/api/characters/getCharacters');
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
        setFilteredCharacters(data);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter characters based on search criteria
  useEffect(() => {
    let filtered = characters;

    // Filter by search term (name)
    if (searchTerm.trim()) {
      filtered = filtered.filter(char => 
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by element
    if (selectedElement) {
      filtered = filtered.filter(char => char.element === selectedElement);
    }

    // Filter by path
    if (selectedPath) {
      filtered = filtered.filter(char => char.path === selectedPath);
    }

    // Filter by rarity
    if (selectedRarity) {
      filtered = filtered.filter(char => char.rarity === parseInt(selectedRarity));
    }

    setFilteredCharacters(filtered);
  }, [searchTerm, selectedElement, selectedPath, selectedRarity, characters]);

  const handleCharacterSelect = (character) => {
    onCharacterSelect({
      characterId: character.id.toString(),
      characterName: character.name,
      element: character.element,
      path: character.path,
      rarity: character.rarity
    });
    setSearchTerm('');
    setShowResults(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedElement('');
    setSelectedPath('');
    setSelectedRarity('');
  };

  const getRarityStars = (rarity) => {
    return '★'.repeat(rarity);
  };

  const getElementColor = (element) => {
    const colors = {
      'Fire': '#ff6b6b',
      'Ice': '#74b9ff',
      'Lightning': '#fdcb6e',
      'Wind': '#00b894',
      'Quantum': '#6c5ce7',
      'Imaginary': '#fd79a8',
      'Physical': '#a29bfe'
    };
    return colors[element] || '#636e72';
  };

  return (
    <div className="character-search" ref={searchRef}>
      <div className="search-filters">
        <div className="search-input-group">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowResults(true)}
            className="search-input"
          />
          {loading && <div className="search-loading">Loading...</div>}
        </div>

        <div className="filter-controls">
          <select
            value={selectedElement}
            onChange={(e) => setSelectedElement(e.target.value)}
            className="filter-select"
          >
            <option value="">All Elements</option>
            <option value="Fire">Fire</option>
            <option value="Ice">Ice</option>
            <option value="Lightning">Lightning</option>
            <option value="Wind">Wind</option>
            <option value="Quantum">Quantum</option>
            <option value="Imaginary">Imaginary</option>
            <option value="Physical">Physical</option>
          </select>

          <select
            value={selectedPath}
            onChange={(e) => setSelectedPath(e.target.value)}
            className="filter-select"
          >
            <option value="">All Paths</option>
            <option value="The Hunt">The Hunt</option>
            <option value="Erudition">Erudition</option>
            <option value="Destruction">Destruction</option>
            <option value="Harmony">Harmony</option>
            <option value="Nihility">Nihility</option>
            <option value="Preservation">Preservation</option>
            <option value="Abundance">Abundance</option>
            <option value="Remembrance">Remembrance</option>
          </select>

          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="filter-select"
          >
            <option value="">All Rarities</option>
            <option value="4">4-Star</option>
            <option value="5">5-Star</option>
          </select>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>

      {showResults && (
        <div className="search-results">
          {filteredCharacters.length === 0 ? (
            <div className="no-results">
              {loading ? 'Loading characters...' : 'No characters found matching your criteria'}
            </div>
          ) : (
            <div className="results-grid">
              {filteredCharacters.slice(0, 12).map(character => (
                <div
                  key={character._id}
                  className="character-result-card"
                  onClick={() => handleCharacterSelect(character)}
                >
                                     <div className="character-portrait">
                     {portraitMap[character.name] ? (
                       <img
                         src={portraitMap[character.name]}
                         alt={character.name}
                         onError={(e) => {
                           e.target.style.display = 'none';
                           e.target.nextSibling.style.display = 'block';
                         }}
                       />
                     ) : (
                       <div className="fallback-portrait">
                         {character.name.charAt(0)}
                       </div>
                     )}
                   </div>
                  
                  <div className="character-info">
                    <h4 className="character-name">{character.name}</h4>
                    <div className="character-details">
                      <span 
                        className="element-badge"
                        style={{ backgroundColor: getElementColor(character.element) }}
                      >
                        {character.element}
                      </span>
                      <span className="path-badge">{character.path}</span>
                      <span className="rarity-badge">{getRarityStars(character.rarity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {filteredCharacters.length > 12 && (
            <div className="results-footer">
              <p>Showing first 12 results. Use filters to narrow down your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterSearch; 