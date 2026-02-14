import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { MagnifyingGlassIcon, BriefcaseIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';
import { searchMetiers as apiSearchMetiers } from '../../services/api';

const MetierAutocomplete = ({ selectedMetier, onSelect }) => {
  const [query, setQuery] = useState('');
  const [metiers, setMetiers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetiers = async () => {
      setLoading(true);
      try {
        const data = await apiSearchMetiers(query);
        setMetiers(data);
      } catch (error) {
        console.error('Erreur recherche métiers:', error);
        // En cas d'erreur, garder les métiers précédents
      } finally {
        setLoading(false);
      }
    };

    if (query.length === 0) {
      // Charger les métiers populaires par défaut
      fetchMetiers();
    } else if (query.length >= 2) {
      // Debounce: attendre que l'utilisateur ait fini de taper
      const debounce = setTimeout(fetchMetiers, 300);
      return () => clearTimeout(debounce);
    }
  }, [query]);

  return (
    <div className="w-full">
      <Combobox value={selectedMetier} onChange={onSelect}>
        <div className="relative">
          <Combobox.Label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="h-5 w-5 text-ft-blue" />
              <span>Métier précis (Code ROME)</span>
              <span className="text-xs text-gray-500 font-normal">- Recherche ultra-ciblée</span>
            </div>
          </Combobox.Label>

          <div className="relative">
            <div className="relative">
              <Combobox.Input
                className="w-full rounded-md border-gray-300 py-2 pl-10 pr-10 shadow-sm focus:border-ft-blue focus:ring-ft-blue text-sm"
                placeholder="Ex: Développeur web, Data scientist, DevOps..."
                onChange={(e) => setQuery(e.target.value)}
                displayValue={(metier) => metier?.libelle || ''}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

              {loading && (
                <div className="absolute right-3 top-2.5">
                  <svg className="animate-spin h-5 w-5 text-ft-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}

              {selectedMetier && (
                <button
                  type="button"
                  onClick={() => onSelect(null)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
              {metiers.length === 0 && !loading ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  {query.length === 0 ? 'Tapez pour rechercher un métier' : 'Aucun métier trouvé'}
                </div>
              ) : (
                <>
                  {query.length === 0 && (
                    <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                      💡 Métiers populaires pour le développement
                    </div>
                  )}
                  {metiers.map((metier) => (
                    <Combobox.Option
                      key={metier.code}
                      value={metier}
                      className={({ active }) =>
                        `cursor-pointer select-none py-2 px-4 ${
                          active ? 'bg-ft-blue text-white' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ active, selected }) => (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`font-mono text-xs px-2 py-1 rounded flex-shrink-0 ${
                              active ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {metier.code}
                            </span>
                            <span className="text-sm truncate">{metier.libelle}</span>
                          </div>
                          {selected && (
                            <CheckIcon className="h-5 w-5 flex-shrink-0" />
                          )}
                        </div>
                      )}
                    </Combobox.Option>
                  ))}
                </>
              )}
            </Combobox.Options>
          </div>
        </div>
      </Combobox>

      {selectedMetier && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Recherche ciblée activée
              </p>
              <p className="text-xs text-green-700 mt-1">
                Métier : <strong>{selectedMetier.libelle}</strong> ({selectedMetier.code})
              </p>
              <p className="text-xs text-green-600 mt-1">
                ⚡ Vous verrez uniquement les offres correspondant exactement à ce métier
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetierAutocomplete;
