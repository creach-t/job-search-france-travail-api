import React from 'react';
import { 
  experienceOptions, 
  contractOptions, 
  qualificationOptions,
  workingHoursOptions,
  webDevelopmentSkills 
} from './options';

const AdvancedSearchFields = ({ 
  experience, 
  setExperience, 
  contractType, 
  setContractType,
  qualification,
  setQualification,
  workingHours,
  setWorkingHours,
  selectedSkills,
  handleSkillChange,
  error
}) => {
  return (
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
      
      {/* Nouveaux champs ajoutés */}
      <div>
        <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">
          Qualification
        </label>
        <select
          id="qualification"
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ft-blue focus:ring-ft-blue sm:text-sm"
        >
          {qualificationOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700">
          Durée du travail
        </label>
        <select
          id="workingHours"
          value={workingHours}
          onChange={(e) => setWorkingHours(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ft-blue focus:ring-ft-blue sm:text-sm"
        >
          {workingHoursOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="col-span-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Compétences techniques (2 maximum)
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
          {selectedSkills.length}/2 compétences sélectionnées
        </p>
      </div>
    </div>
  );
};

export default AdvancedSearchFields;
