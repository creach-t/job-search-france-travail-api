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
  { value: 'MIS', label: 'Mission intérimaire' },
  { value: 'SAI', label: 'Travail saisonnier' },
  { value: 'FRA', label: 'Franchise' }
];

const webDevelopmentSkills = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'node', label: 'Node.js' },
  { value: 'express', label: 'Express' },
  { value: 'php', label: 'PHP' },
  { value: 'laravel', label: 'Laravel' },
  { value: 'symfony', label: 'Symfony' },
  { value: 'python', label: 'Python' },
  { value: 'django', label: 'Django' },
  { value: 'flask', label: 'Flask' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'rails', label: 'Ruby on Rails' },
  { value: 'java', label: 'Java' },
  { value: 'spring', label: 'Spring Boot' },
  { value: 'dotnet', label: '.NET' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sass', label: 'Sass' },
  { value: 'tailwind', label: 'Tailwind CSS' },
  { value: 'bootstrap', label: 'Bootstrap' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'rest', label: 'REST API' },
  { value: 'sql', label: 'SQL' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'docker', label: 'Docker' },
  { value: 'git', label: 'Git' },
  { value: 'aws', label: 'AWS' },
  { value: 'firebase', label: 'Firebase' },
  { value: 'azure', label: 'Azure' }
];

const SearchForm = ({ onSearch }) => {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('10');
  const [experience, setExperience] = useState('');
  const [contractType, setContractType] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [advancedSearch, setAdvancedSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Construire les mots-clés avec les compétences sélectionnées
    let finalKeywords = keywords;
    
    if (selectedSkills.length > 0) {
      const skillsKeywords = selectedSkills.map(skill => skill.label).join(',');
      finalKeywords = finalKeywords 
        ? `${finalKeywords},${skillsKeywords}` 
        : skillsKeywords;
    }
    
    // Ajouter automatiquement des mots-clés liés au développement web
    if (!finalKeywords.toLowerCase().includes('développeur') && 
        !finalKeywords.toLowerCase().includes('developer')) {
      finalKeywords = finalKeywords 
        ? `${finalKeywords},développeur web` 
        : 'développeur web';
    }
    
    onSearch({
      keywords: finalKeywords,
      location,
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
      // Sinon, on l'ajoute
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
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
              placeholder="Titre, technologie, compétence..."
            />
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
              <option value="50">50 km</option>
              <option value="100">100 km</option>
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
                Compétences techniques
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
