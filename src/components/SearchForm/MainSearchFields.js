import React, { useState } from 'react';
import CommuneSearch from '../CommuneSearch';
import { XMarkIcon, MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

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
    <div className="space-y-4">
      {/* Ligne 1 : mots-clés + localisation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Mots-clés */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Poste / Mots-clés
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="block w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-ft-blue focus:ring-1 focus:ring-ft-blue/30 transition-colors bg-gray-50 focus:bg-white"
              placeholder="Développeur, chef de projet..."
              maxLength={20}
            />
            {keywords.length > 15 && (
              <p className="mt-1 text-xs text-orange-500">{20 - keywords.length} car. restants</p>
            )}
          </div>
        </div>

        {/* Localisation */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Localisation
          </label>
          <CommuneSearch onSelect={handleCommuneSelect} />
          {selectedCommune && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-ft-blue rounded-full text-xs border border-blue-100 font-medium">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{selectedCommune.nom}</span>
              {selectedCommune.codesPostaux?.[0] && (
                <span className="text-blue-400 font-normal">{selectedCommune.codesPostaux[0]}</span>
              )}
              <button
                type="button"
                onClick={handleRemoveCommune}
                className="ml-0.5 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rayon — apparaît seulement si commune sélectionnée */}
      {selectedCommune && (
        <div className="flex items-center gap-3 py-1">
          <span className="text-xs text-gray-400 shrink-0 w-12">0 km</span>
          <div className="relative flex-1 flex items-center h-7">
            <div className="absolute w-full h-1 bg-gray-200 rounded-full" />
            <div
              className="absolute h-1 bg-ft-blue rounded-full transition-all duration-150"
              style={{ width: `${parseInt(distance)}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="relative w-full h-7 bg-transparent appearance-none cursor-pointer z-10
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-ft-blue
                [&::-webkit-slider-thumb]:shadow
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-ft-blue
                [&::-moz-range-thumb]:shadow
                [&::-moz-range-thumb]:cursor-pointer
              "
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0 w-14 text-right">100 km</span>
          <span className="text-xs font-semibold text-ft-blue bg-blue-50 px-2.5 py-1 rounded-full shrink-0">
            {distance === '0' ? 'Commune' : `${distance} km`}
          </span>
        </div>
      )}
    </div>
  );
};

export default MainSearchFields;
