import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import Input from '../../atoms/Input';

const API_URL = 'https://geo.api.gouv.fr/communes';

const CommuneSearch = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestions = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}?nom=${searchTerm}&fields=nom,code,codeDepartement,departement&boost=population&limit=5`
        );
        
        if (!response.ok) {
          throw new Error('Erreur lors de la recherche des communes');
        }

        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        setError('Erreur lors de la recherche des communes');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(search);
  }, [search, fetchSuggestions]);

  const handleSelect = (commune) => {
    setSearch(commune.nom);
    setSuggestions([]);
    onSelect(commune);
  };

  return (
    <div className="relative">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher une commune..."
        className={loading ? 'pr-10' : ''}
      />
      {loading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
      
      {error ? (
        <div className="absolute w-full mt-1 bg-red-50 rounded-md border border-red-200 shadow-lg">
          <p className="p-2 text-sm text-red-600">{error}</p>
        </div>
      ) : suggestions.length > 0 && (
        <ul className="absolute w-full mt-1 bg-white rounded-md border border-gray-200 shadow-lg z-10">
          {suggestions.map((commune) => (
            <li
              key={commune.code}
              className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelect(commune)}
            >
              <div className="p-3">
                <div className="font-medium text-sm text-gray-900">
                  {commune.nom}
                </div>
                <div className="text-xs text-gray-500">
                  {commune.departement.nom} ({commune.departement.code})
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

CommuneSearch.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default CommuneSearch;