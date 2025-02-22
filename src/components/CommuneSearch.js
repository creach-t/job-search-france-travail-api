import React, { useState, useEffect, useRef } from 'react';
import { searchCommunes } from '../services/communeService';

const CommuneSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState(null);
  const containerRef = useRef(null);
  
  // Fonction pour rechercher les communes à partir du texte saisi
  const searchCommunesHandler = async (text) => {
    if (text.length < 2) {
      setCommunes([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await searchCommunes(text);
      setCommunes(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setCommunes([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Utilisation d'un debounce pour éviter trop d'appels API
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchCommunesHandler(query);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  // Fermer les suggestions si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [containerRef]);
  
  // Gestion du changement de texte
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    
    // Si le champ est vidé, on réinitialise la sélection
    if (!value) {
      setSelectedCommune(null);
      onSelect(null);
    }
  };
  
  // Sélection d'une commune dans la liste
  const handleSelectCommune = (commune) => {
    setSelectedCommune(commune);
    setQuery(commune.nom);
    setShowSuggestions(false);
    onSelect(commune);
  };
  
  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Nom de la commune"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ft-blue focus:ring-ft-blue sm:text-sm"
      />
      
      {loading && (
        <div className="absolute right-2 top-2">
          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      {showSuggestions && communes.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {communes.map((commune) => (
            <li
              key={commune.code}
              className="relative cursor-default select-none py-2 px-3 hover:bg-gray-100"
              onClick={() => handleSelectCommune(commune)}
            >
              <div className="flex justify-between">
                <span className="font-medium">{commune.nom}</span>
                <span className="text-gray-500">{commune.code}</span>
              </div>
              {commune.codesPostaux && commune.codesPostaux.length > 0 && (
                <span className="text-xs text-gray-500">
                  CP: {commune.codesPostaux.join(', ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      
      {showSuggestions && query.length >= 2 && communes.length === 0 && !loading && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
          <p className="py-2 px-3 text-gray-500">Aucune commune trouvée</p>
        </div>
      )}
      
      {selectedCommune && (
        <div className="mt-1 text-xs text-gray-500">
          Code INSEE: {selectedCommune.code}
        </div>
      )}
    </div>
  );
};

export default CommuneSearch;
