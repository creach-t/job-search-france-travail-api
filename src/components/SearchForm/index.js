import { useState } from 'react';
import MainSearchFields from './MainSearchFields';
import AdvancedSearchFields from './AdvancedSearchFields';
import SearchButton from './SearchButton';
import { ChevronDownIcon, ChevronUpIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid';
import { useAppContext } from '../../context/AppContext';

const SearchForm = ({ onSearch, initialKeywords = '', initialContractType = '' }) => {
  const { isDevMode } = useAppContext();
  const [keywords, setKeywords] = useState(initialKeywords);
  const [selectedCommune, setSelectedCommune] = useState(null);
  const [distance, setDistance] = useState('10');
  const [experience, setExperience] = useState('');
  const [contractType, setContractType] = useState(initialContractType);
  const [qualification, setQualification] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [selectedMetier, setSelectedMetier] = useState(null);
  const [salaryMin, setSalaryMin] = useState('');
  const [stacks, setStacks] = useState([]); // multi-select
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Toggle d'un stack dans le tableau multi-select
  const handleStackToggle = (value) => {
    setStacks(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  // Compter les filtres avancés actifs
  const activeFiltersCount = [experience, contractType, qualification, workingHours, salaryMin, selectedMetier]
    .filter(Boolean).length + stacks.length;

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setIsSearching(true);

    if (keywords.length > 20) {
      setError('Les mots-clés sont trop longs (max 20 caractères).');
      setIsSearching(false);
      return;
    }

    // En DevMode sans stack : "développeur" garanti comme mot-clé de base
    const resolvedKeywords = stacks.length > 0
      ? undefined // les stacks fournissent leurs propres keywords
      : (keywords.trim()
          ? keywords.substring(0, 20)
          : (isDevMode ? 'développeur' : undefined));

    const searchParams = {
      keywords: resolvedKeywords,
      distance: distance !== undefined && distance !== '' ? distance : '10',
      experience,
      contractType,
    };

    if (selectedCommune) searchParams.location = selectedCommune.code;
    if (selectedMetier) searchParams.codeROME = selectedMetier.code;
    if (qualification) searchParams.qualification = qualification;
    if (workingHours) searchParams.workingHours = workingHours;
    if (salaryMin) searchParams.salaryMin = salaryMin;
    if (stacks.length > 0) searchParams.stacks = stacks; // multi-stack

    onSearch(searchParams);
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleCommuneSelect = (commune) => {
    setSelectedCommune(commune);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

      {error && (
        <div className="bg-red-50 border-b border-red-100 px-6 py-3 flex items-center gap-2 text-red-600 text-sm">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSearch}>
        {/* Zone principale */}
        <div className="p-6">
          <MainSearchFields
            keywords={keywords}
            setKeywords={setKeywords}
            onCommuneSelect={handleCommuneSelect}
            distance={distance}
            setDistance={setDistance}
          />
        </div>

        {/* Séparateur avec bouton filtres */}
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setAdvancedSearch(!advancedSearch)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-ft-blue transition-colors"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span>Filtres avancés</span>
            {activeFiltersCount > 0 && (
              <span className="bg-ft-blue text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {advancedSearch
              ? <ChevronUpIcon className="h-4 w-4 ml-1" />
              : <ChevronDownIcon className="h-4 w-4 ml-1" />
            }
          </button>
        </div>

        {/* Filtres avancés */}
        {advancedSearch && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <AdvancedSearchFields
              experience={experience}
              setExperience={setExperience}
              contractType={contractType}
              setContractType={setContractType}
              qualification={qualification}
              setQualification={setQualification}
              workingHours={workingHours}
              setWorkingHours={setWorkingHours}
              salaryMin={salaryMin}
              setSalaryMin={setSalaryMin}
              stacks={stacks}
              onStackToggle={handleStackToggle}
              selectedMetier={selectedMetier}
              onMetierSelect={setSelectedMetier}
            />
          </div>
        )}

        {/* Bouton recherche */}
        <div className="px-6 pb-6">
          <SearchButton isSearching={isSearching} />
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
