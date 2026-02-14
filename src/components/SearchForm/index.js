import { useState } from 'react';
import MainSearchFields from './MainSearchFields';
import AdvancedSearchFields from './AdvancedSearchFields';
import SearchButton from './SearchButton';
import MetierAutocomplete from './MetierAutocomplete';

const SearchForm = ({ onSearch }) => {
  const [keywords, setKeywords] = useState('');
  const [selectedCommune, setSelectedCommune] = useState(null);
  const [distance, setDistance] = useState('10');
  const [experience, setExperience] = useState('');
  const [contractType, setContractType] = useState('');
  const [qualification, setQualification] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedMetier, setSelectedMetier] = useState(null);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setIsSearching(true);
    
    // Vérifier les limites de taille pour éviter l'erreur 431
    if (keywords.length > 20) {
      setError('Les mots-clés sont trop longs (max 20 caractères). Veuillez réduire votre recherche.');
      setIsSearching(false);
      return;
    }
    
    // Limiter le nombre de compétences sélectionnées
    if (selectedSkills.length > 2) {
      setError('Trop de compétences sélectionnées. Veuillez en choisir 2 maximum.');
      setIsSearching(false);
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

    // S'assurer que les mots-clés ne dépassent pas 20 caractères (si présents)
    if (finalKeywords) {
      finalKeywords = finalKeywords.substring(0, 20);
    }

    // Construire les paramètres de recherche
    const searchParams = {
      keywords: finalKeywords,
      distance: distance || '10',
      experience,
      contractType
    };

    // Ajouter le code INSEE de la commune si disponible, sinon mettre null
    if (selectedCommune) {
      searchParams.location = selectedCommune.code; // Code INSEE pour l'API France Travail
    }

    // Ajouter le code ROME si un métier est sélectionné
    if (selectedMetier) {
      searchParams.codeROME = selectedMetier.code;
    }

    // Ajouter les nouveaux paramètres s'ils sont sélectionnés
    if (qualification) {
      searchParams.qualification = qualification;
    }

    if (workingHours) {
      searchParams.workingHours = workingHours;
    }
    
    // Appeler la fonction de recherche passée en props
    onSearch(searchParams);
    
    // Réinitialiser l'état de recherche après un court délai
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const handleCommuneSelect = (commune) => {
    setSelectedCommune(commune);
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
        <MainSearchFields
          keywords={keywords}
          setKeywords={setKeywords}
          onCommuneSelect={handleCommuneSelect}
          distance={distance}
          setDistance={setDistance}
        />

        {/* Recherche par métier (Code ROME) */}
        <MetierAutocomplete
          selectedMetier={selectedMetier}
          onSelect={setSelectedMetier}
        />

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
          <AdvancedSearchFields
            experience={experience}
            setExperience={setExperience}
            contractType={contractType}
            setContractType={setContractType}
            qualification={qualification}
            setQualification={setQualification}
            workingHours={workingHours}
            setWorkingHours={setWorkingHours}
            selectedSkills={selectedSkills}
            handleSkillChange={handleSkillChange}
            error={error}
          />
        )}
        
        <SearchButton isSearching={isSearching} />
      </form>
    </div>
  );
};

export default SearchForm;
