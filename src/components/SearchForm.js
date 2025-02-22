import { useState } from 'react';

// Données pour les listes déroulantes
const experienceOptions = [
  { value: '', label: 'Toutes' },
  { value: '1', label: 'Moins d\'un an' },
  { value: '2', label: 'De 1 à 3 ans' },
  { value: '3', label: 'Plus de 3 ans' }
];

const contractOptions = [
  { value: '', label: 'Tous' },
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'MIS', label: 'Mission intérimaire' }
];

// Réduire le nombre de compétences pour éviter les erreurs
const webDevelopmentSkills = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'node', label: 'Node.js' },
  { value: 'php', label: 'PHP' },
  { value: 'python', label: 'Python' }
];

const SearchForm = ({ onSearch }) => {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('10');
  const [experience, setExperience] = useState('');
  const [contractType, setContractType] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    
    // Vérifier les limites de taille pour éviter l'erreur 431
    if (keywords.length > 20) { // Réduit de 50 à 20
      setError('Les mots-clés sont trop longs (max 20 caractères). Veuillez réduire votre recherche.');
      return;
    }
    
    if (location.length > 20) { // Réduit de 50 à 20
      setError('La localisation est trop longue (max 20 caractères). Veuillez la simplifier.');
      return;
    }
    
    // Limiter le nombre de compétences sélectionnées
    if (selectedSkills.length > 2) { // Réduit de 3 à 2
      setError('Trop de compétences sélectionnées. Veuillez en choisir 2 maximum.');
      return;
    }
    
    // Construire les mots-clés avec les compétences sélectionnées
    let finalKeywords = keywords;
    
    if (selectedSkills.length > 0) {
      // Version simple: juste une compétence à la fois
      const skillsKeywords = selectedSkills[0].label;
      
      // Construire les mots-clés de manière ultra-minimaliste
      if (!finalKeywords) {
        finalKeywords = skillsKeywords;
      } else if ((finalKeywords + ',' + skillsKeywords).length <= 20) {
        finalKeywords = `${finalKeywords},${skillsKeywords}`;
      }
    }
    
    // Si aucun mot-clé n'est fourni, utiliser "dev" comme mot-clé par défaut
    finalKeywords = finalKeywords || 'dev';
    
    // S'assurer que les mots-clés ne dépassent pas 20 caractères
    finalKeywords = finalKeywords.substring(0, 20);
    
    onSearch({
      keywords: finalKeywords,
      location: location.substring(0, 20),
      distance: distance || '10',
      experience,
      contractType
    });
  };

  const handleSkillChange = (skill) => {
    if (selectedSkills.some(s => s.value === skill.value)) {
      // Si déjà sélectionnée, on la retire
      setSelectedSkills(selectedSkills.filter(s => s.value !== skill.value));
    } else {
      // Limiter le nombre de compétences à 2 maximum
      if (selectedSkills.length >= 2) {
        setError('Vous avez atteint le maximum de 2 compétences. Veuillez en désélectionner une avant d\'en ajouter une nouvelle.');
        return;
      }
      // Sinon, on l'ajoute
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSearch}>
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
              maxLength={20} // Réduit à 20
            />
            {keywords.length > 15 && ( // Avertissement plus tôt
              <p className="mt-1 text-xs text-orange-500">
                {20 - keywords.length} caractères restants
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Localisation
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ft-blue focus:ring-ft-blue sm:text-sm"
              placeholder="Ville, département..."
              maxLength={20} // Réduit à 20
            />
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
        
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setAdvancedSearch(!advancedSearch)}
            className="text-sm text-ft-blue hover:text-ft-darkblue focus:outline-none"
          >
            {advancedSearch ? '- Masquer les filtres avancés' : '+ Afficher les filtres avancés'}
          </button>
        </div>
        
        {advancedSearch && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                Expérience
              </label>
              <select
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ft-blue focus:ring-ft-blue sm:text-sm"
              >
                {experienceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="contractType" className="block text-sm font-medium text-gray-700">
                Type de contrat
              </label>
              <select
                id="contractType"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ft-blue focus:ring-ft-blue sm:text-sm"
              >
                {contractOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compétences techniques (2 maximum) {/* Réduit de 3 à 2 */}
              </label>
              <div className="flex flex-wrap gap-2">
                {webDevelopmentSkills.map(skill => (
                  <button
                    key={skill.value}
                    type="button"
                    onClick={() => handleSkillChange(skill)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      selectedSkills.some(s => s.value === skill.value)
                        ? 'bg-ft-blue text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {skill.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {selectedSkills.length}/2 compétences sélectionnées {/* Réduit de 3 à 2 */}
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ft-blue hover:bg-ft-darkblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ft-blue"
          >
            Rechercher
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;