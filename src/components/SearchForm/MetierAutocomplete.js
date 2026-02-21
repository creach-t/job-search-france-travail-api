import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';
import { searchMetiers as apiSearchMetiers } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const MetierAutocomplete = ({ selectedMetier, onSelect }) => {
  const { isDevMode } = useAppContext();
  const [query, setQuery] = useState('');
  const [metiers, setMetiers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetiers = async () => {
      setLoading(true);
      try {
        const data = await apiSearchMetiers(query);
        setMetiers(Array.isArray(data) ? data : []);
      } catch {
        // garder les métiers précédents en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    if (query.length === 0) {
      fetchMetiers();
    } else if (query.length >= 2) {
      const debounce = setTimeout(fetchMetiers, 300);
      return () => clearTimeout(debounce);
    }
  }, [query]);

  const inputClass = "w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-ft-blue focus:ring-1 focus:ring-ft-blue/30 focus:bg-white transition-colors";

  return (
    <Combobox value={selectedMetier} onChange={onSelect}>
      <div className="relative">
        <div className="relative">
          <Combobox.Input
            className={inputClass}
            placeholder={isDevMode ? 'Ex : Développeur web, DevOps…' : 'Ex : Boulanger, Comptable, Infirmier…'}
            onChange={(e) => setQuery(e.target.value)}
            displayValue={(metier) => metier?.libelle || ''}
          />
          <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />

          {loading && (
            <div className="absolute right-2.5 top-2.5">
              <svg className="animate-spin h-4 w-4 text-ft-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {selectedMetier && !loading && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              title="Effacer"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-gray-200 focus:outline-none text-sm">
          {metiers.length === 0 && !loading ? (
            <div className="px-4 py-2.5 text-xs text-gray-400">
              {query.length === 0 ? 'Tapez pour rechercher un métier' : 'Aucun métier trouvé'}
            </div>
          ) : (
            <>
              {query.length === 0 && (
                <div className="px-3 py-1.5 text-xs text-gray-400 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-ft-blue/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Métiers populaires
                </div>
              )}
              {metiers.map((metier) => (
                <Combobox.Option
                  key={metier.code}
                  value={metier}
                  className={({ active }) =>
                    `cursor-pointer select-none py-2 px-3 ${active ? 'bg-ft-blue text-white' : 'text-gray-900'}`
                  }
                >
                  {({ active, selected }) => (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`font-mono text-xs px-1.5 py-0.5 rounded shrink-0 ${
                          active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {metier.code}
                        </span>
                        <span className="text-sm truncate">{metier.libelle}</span>
                      </div>
                      {selected && <CheckIcon className="h-4 w-4 shrink-0" />}
                    </div>
                  )}
                </Combobox.Option>
              ))}
            </>
          )}
        </Combobox.Options>
      </div>

      {/* Chip de confirmation compact */}
      {selectedMetier && (
        <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-ft-blue/10 border border-ft-blue/20 text-xs text-ft-blue">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{selectedMetier.libelle}</span>
          <span className="font-mono opacity-60">{selectedMetier.code}</span>
          <span className="opacity-50">· ciblage exact</span>
        </div>
      )}
    </Combobox>
  );
};

export default MetierAutocomplete;
