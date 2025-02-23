import React from 'react';
import PropTypes from 'prop-types';

const JobDescription = ({ description, isExpanded, onToggle }) => {
  return (
    <div className="mt-4">
      <div className="relative">
        <div
          className={`prose prose-sm text-gray-500 ${!isExpanded ? 'max-h-24 overflow-hidden' : ''}`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      <button
        onClick={onToggle}
        className="mt-2 text-sm text-ft-blue hover:text-ft-darkblue focus:outline-none"
      >
        {isExpanded ? 'Voir moins' : 'Voir plus'}
      </button>
    </div>
  );
};

JobDescription.propTypes = {
  description: PropTypes.string.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default JobDescription;