import React from 'react';
import PropTypes from 'prop-types';

const JobDetails = ({ contractType, location, salary, workingHours }) => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900">Type de contrat</h3>
        <p className="mt-1 text-sm text-gray-500">{contractType}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-900">Localisation</h3>
        <p className="mt-1 text-sm text-gray-500">{location}</p>
      </div>
      {salary && (
        <div>
          <h3 className="text-sm font-medium text-gray-900">Salaire</h3>
          <p className="mt-1 text-sm text-gray-500">{salary}</p>
        </div>
      )}
      {workingHours && (
        <div>
          <h3 className="text-sm font-medium text-gray-900">Horaires</h3>
          <p className="mt-1 text-sm text-gray-500">{workingHours}</p>
        </div>
      )}
    </div>
  );
};

JobDetails.propTypes = {
  contractType: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  salary: PropTypes.string,
  workingHours: PropTypes.string
};

export default JobDetails;