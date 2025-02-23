import React from 'react';
import CommuneSearch from '../CommuneSearch';

const MainSearchFields = ({ 
  keywords, 
  setKeywords, 
  onCommuneSelect, 
  distance, 
  setDistance 
}) => {
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
          Commune
        </label>
        <CommuneSearch onSelect={onCommuneSelect} />
      </div>
      
      <div>
        <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
          Distance (km)
        </label>
        <select
          id="distance"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ft-blue focus:ring-ft-blue sm:text-sm"
        >
          <option value="0">Exactement</option>
          <option value="10">10 km</option>
          <option value="20">20 km</option>
          <option value="30">30 km</option>
        </select>
      </div>
    </div>
  );
};

export default MainSearchFields;
