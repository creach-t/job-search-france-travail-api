import React from 'react';
import PropTypes from 'prop-types';
import { MapPin, Clock } from 'lucide-react';

const JobDetails = ({ contractType, location }) => {
  return (
    <div className="flex items-center gap-4 mb-4 text-gray-600">
      <div className="flex items-center gap-1">
        <Clock size={16} />
        <span>{contractType}</span>
      </div>
      <div className="flex items-center gap-1">
        <MapPin size={16} />
        <span>{location}</span>
      </div>
    </div>
  );
};

JobDetails.propTypes = {
  contractType: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired
};

export default JobDetails;