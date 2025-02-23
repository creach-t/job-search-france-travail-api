import React from 'react';
import PropTypes from 'prop-types';

const JobCard = ({
  title,
  company,
  location,
  description,
  contractType,
  publicationDate,
  onApply,
  onSave
}) => {
  const formattedDate = new Date(publicationDate).toLocaleDateString('fr-FR');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600">{company}</p>
        <p className="text-sm text-gray-500">{formattedDate}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-700"><span className="font-medium">Type:</span> {contractType}</p>
        <p className="text-gray-700"><span className="font-medium">Lieu:</span> {location}</p>
      </div>

      <div className="mb-4">
        <p className="text-gray-700">{description}</p>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => onSave()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Sauvegarder
        </button>
        <button
          onClick={() => onApply()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Postuler
        </button>
      </div>
    </div>
  );
};

JobCard.propTypes = {
  title: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  contractType: PropTypes.string.isRequired,
  publicationDate: PropTypes.string.isRequired,
  onApply: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default JobCard;