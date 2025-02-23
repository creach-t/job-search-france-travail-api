import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import BasicSearch from './components/BasicSearch';
import AdvancedSearch from './components/AdvancedSearch';

const SearchForm = ({ onSearch }) => {
  const [keywords, setKeywords] = useState('');
  const [selectedCommune, setSelectedCommune] = useState(null);
  const [distance, setDistance] = useState('10');
  const [experience, setExperience] = useState('');
  const [contractType, setContractType] = useState('');
  const [qualification, setQualification] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setIsSearching(true);

    if (keywords.length > 20) {
      setError('Les mots-clés sont trop longs (max 20 caractères). Veuillez réduire votre recherche.');
      setIsSearching(false);
      return;
    }

    if (selectedSkills.length > 2) {
      setError('Trop de compétences sélectionnées. Veuillez en choisir 2 maximum.');
      setIsSearching(false);
      return;
    }

    let finalKeywords = keywords;

    if (selectedSkills.length > 0) {
      const skillsKeywords = selectedSkills[0].label;
      if (!finalKeywords) {
        finalKeywords = skillsKeywords;
      } else if ((finalKeywords + ',' + skillsKeywords).length <= 20) {
        finalKeywords = `${finalKeywords},${skillsKeywords}`;
      }
    }

    finalKeywords = finalKeywords || 'dev';
    finalKeywords = finalKeywords.substring(0, 20);

    const searchParams = {
      keywords: finalKeywords,
      distance: distance || '10',
      experience,
      contractType,
      ...(selectedCommune && { location: selectedCommune.code }),
      ...(qualification && { qualification }),
      ...(workingHours && { workingHours }),
    };

    onSearch(searchParams);
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleSkillChange = (skill) => {
    if (selectedSkills.some(s => s.value === skill.value)) {
      setSelectedSkills(selectedSkills.filter(s => s.value !== skill.value));
    } else if (selectedSkills.length < 2) {
      setSelectedSkills([...selectedSkills, skill]);
    } else {
      setError('Vous avez atteint le maximum de 2 compétences.');
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
        <BasicSearch
          keywords={keywords}
          onKeywordsChange={(e) => setKeywords(e.target.value)}
          selectedCommune={selectedCommune}
          onCommuneSelect={setSelectedCommune}
          distance={distance}
          onDistanceChange={(e) => setDistance(e.target.value)}
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
          <AdvancedSearch
            experience={experience}
            onExperienceChange={(e) => setExperience(e.target.value)}
            contractType={contractType}
            onContractTypeChange={(e) => setContractType(e.target.value)}
            qualification={qualification}
            onQualificationChange={(e) => setQualification(e.target.value)}
            workingHours={workingHours}
            onWorkingHoursChange={(e) => setWorkingHours(e.target.value)}
            selectedSkills={selectedSkills}
            onSkillChange={handleSkillChange}
            error={error}
          />
        )}

        <div className="mt-6">
          <Button
            type="submit"
            isLoading={isSearching}
            disabled={isSearching}
            fullWidth
          >
            Rechercher
          </Button>
        </div>
      </form>
    </div>
  );
};

SearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchForm;