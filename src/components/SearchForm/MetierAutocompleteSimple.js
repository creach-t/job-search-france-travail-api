import { useState } from 'react';

const MetierAutocompleteSimple = ({ selectedMetier, onSelect }) => {
  const [query, setQuery] = useState('');

  const METIERS_TEST = [
    { code: 'M1805', libelle: 'Études et développement informatique' },
    { code: 'M1806', libelle: 'Conseil et maîtrise d\'ouvrage SI' },
  ];

  return (
    <div className="w-full mt-6 p-4 bg-yellow-50 border-2 border-yellow-500 rounded">
      <h3 className="font-bold text-lg mb-2">🎓 TEST - Métier précis (Code ROME)</h3>
      <p className="text-sm text-gray-600 mb-3">Si vous voyez ceci, le composant fonctionne !</p>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tapez pour rechercher un métier..."
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />

      {query && (
        <div className="mt-2 bg-white border border-gray-200 rounded p-2">
          {METIERS_TEST.map(metier => (
            <div
              key={metier.code}
              onClick={() => onSelect(metier)}
              className="p-2 hover:bg-blue-50 cursor-pointer"
            >
              <strong>{metier.code}</strong> - {metier.libelle}
            </div>
          ))}
        </div>
      )}

      {selectedMetier && (
        <div className="mt-2 p-2 bg-green-100 rounded">
          ✅ Sélectionné : <strong>{selectedMetier.libelle}</strong>
        </div>
      )}
    </div>
  );
};

export default MetierAutocompleteSimple;
