import React from 'react';
import PropTypes from 'prop-types';

const JobDescription = ({ description }) => {
  return (
    <div className="mb-4">
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

JobDescription.propTypes = {
  description: PropTypes.string.isRequired
};

export default JobDescription;