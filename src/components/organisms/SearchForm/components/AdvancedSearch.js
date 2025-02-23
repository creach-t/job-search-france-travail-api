import React from 'react';
import PropTypes from 'prop-types';
import Select from '../../../atoms/Select';
import FormField from '../../../molecules/FormField';
import SkillsSelector from './SkillsSelector';
import {
  experienceOptions,
  contractOptions,
  qualificationOptions,
  workingHoursOptions,
} from '../../../../constants/searchOptions';

const AdvancedSearch = ({
  experience,
  onExperienceChange,
  contractType,
  onContractTypeChange,
  qualification,
  onQualificationChange,
  workingHours,
  onWorkingHoursChange,
  selectedSkills,
  onSkillChange,
  error,
}) => {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField label="Expérience">
        <Select
          value={experience}
          onChange={onExperienceChange}
          options={experienceOptions}
        />
      </FormField>

      <FormField label="Type de contrat">
        <Select
          value={contractType}
          onChange={onContractTypeChange}
          options={contractOptions}
        />
      </FormField>

      <FormField label="Qualification">
        <Select
          value={qualification}
          onChange={onQualificationChange}
          options={qualificationOptions}
        />
      </FormField>

      <FormField label="Durée du travail">
        <Select
          value={workingHours}
          onChange={onWorkingHoursChange}
          options={workingHoursOptions}
        />
      </FormField>

      <div className="col-span-full">
        <SkillsSelector
          selectedSkills={selectedSkills}
          onSkillChange={onSkillChange}
          error={error}
        />
      </div>
    </div>
  );
};

AdvancedSearch.propTypes = {
  experience: PropTypes.string.isRequired,
  onExperienceChange: PropTypes.func.isRequired,
  contractType: PropTypes.string.isRequired,
  onContractTypeChange: PropTypes.func.isRequired,
  qualification: PropTypes.string.isRequired,
  onQualificationChange: PropTypes.func.isRequired,
  workingHours: PropTypes.string.isRequired,
  onWorkingHoursChange: PropTypes.func.isRequired,
  selectedSkills: PropTypes.array.isRequired,
  onSkillChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default AdvancedSearch;