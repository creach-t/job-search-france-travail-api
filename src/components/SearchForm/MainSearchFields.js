import React, { useState } from 'react';
import CommuneSearch from '../CommuneSearch';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/20/solid';

const MainSearchFields = ({
  keywords,
  setKeywords,
  onCommuneSelect,
  distance,
  setDistance
}) => {
  const [selectedCommune, setSelectedCommune] = useState(null);

  const handleCommuneSelect = (commune) => {
    setSelectedCommune(commune);
    onCommuneSelect(commune);
  };

  const handleRemoveCommune = () => {
    setSelectedCommune(null);
    onCommuneSelect(null);
  };
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="col-span-full md:col-span-1 lg:col-span-2">
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
          Mots-clés
        </label>
        <input
          type="text"
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ft-blue focus:ring-ft-blue sm:text-sm"
          placeholder="Titre, technologie..."
          maxLength={20}
        />
        {keywords.length > 15 && (
          <p className="mt-1 text-xs text-orange-500">
            {20 - keywords.length} caractères restants
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          <div className="flex items-center gap-1">
            <MapPinIcon className="h-4 w-4 text-ft-blue" />
            <span>Localisation</span>
          </div>
        </label>
        <CommuneSearch onSelect={handleCommuneSelect} />
        {selectedCommune && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-ft-blue/10 text-ft-blue rounded-md text-sm">
            <MapPinIcon className="h-4 w-4" />
            <span className="font-medium">{selectedCommune.nom}</span>
            {selectedCommune.codesPostaux?.[0] && (
              <span className="text-xs opacity-75">({selectedCommune.codesPostaux[0]})</span>
            )}
            <button
              type="button"
              onClick={handleRemoveCommune}
              className="ml-1 hover:bg-ft-blue/20 rounded p-0.5"
              title="Retirer la localisation"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
          <div className="flex items-center justify-between">
            <span>Rayon de recherche</span>
            {selectedCommune && (
              <span className="text-xs font-normal text-gray-500">
                autour de {selectedCommune.nom}
              </span>
            )}
          </div>
        </label>
        <select
          id="distance"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ft-blue focus:ring-ft-blue sm:text-sm"
          disabled={!selectedCommune}
        >
          <option value="0">📍 Cette commune uniquement</option>
          <option value="5">🎯 5 km</option>
          <option value="10">📌 10 km</option>
          <option value="20">🗺️ 20 km</option>
          <option value="30">🌍 30 km</option>
          <option value="50">🚀 50 km</option>
          <option value="100">✈️ 100 km</option>
        </select>
        {!selectedCommune && (
          <p className="mt-1 text-xs text-gray-500">
            Sélectionnez d'abord une commune
          </p>
        )}
      </div>
    </div>
  );
};

export default MainSearchFields;
