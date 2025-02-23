import React from 'react';
import PropTypes from 'prop-types';
import { webDevelopmentSkills } from '../../../../constants/searchOptions';

const SkillsSelector = ({ selectedSkills, onSkillChange, error }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Compétences techniques (2 maximum)
      </label>
      <div className="flex flex-wrap gap-2">
        {webDevelopmentSkills.map(skill => (
          <button
            key={skill.value}
            type="button"
            onClick={() => onSkillChange(skill)}
            className={`
              inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium
              ${selectedSkills.some(s => s.value === skill.value)
                ? 'bg-ft-blue text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
            `}
          >
            {skill.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {selectedSkills.length}/2 compétences sélectionnées
      </p>
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

SkillsSelector.propTypes = {
  selectedSkills: PropTypes.array.isRequired,
  onSkillChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default SkillsSelector;