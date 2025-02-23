import React from 'react';
import PropTypes from 'prop-types';

const JobHeader = ({ title, company, logo, publicationDate }) => {
  return (
    <div className="flex items-start space-x-4">
      {logo && (
        <img
          src={logo}
          alt={`${company} logo`}
          className="w-12 h-12 object-contain"
        />
      )}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
        <p className="text-sm text-gray-500">{company}</p>
        <p className="text-xs text-gray-400">Publié le {publicationDate}</p>
      </div>
    </div>
  );
};

JobHeader.propTypes = {
  title: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  logo: PropTypes.string,
  publicationDate: PropTypes.string.isRequired,
};

export default JobHeader;