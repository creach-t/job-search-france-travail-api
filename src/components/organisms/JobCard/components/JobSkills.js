import React from 'react';
import PropTypes from 'prop-types';

const JobSkills = ({ skills }) => {
  if (!skills?.length) return null;
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-900">Compétences requises</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

JobSkills.propTypes = {
  skills: PropTypes.arrayOf(PropTypes.string)
};

export default JobSkills;