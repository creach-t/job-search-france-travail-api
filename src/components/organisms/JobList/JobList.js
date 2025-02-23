import React from 'react';
import PropTypes from 'prop-types';

const JobList = ({ jobs, onJobSelect }) => {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div 
          key={job.id}
          className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onJobSelect(job)}
        >
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
          <p className="text-sm text-gray-500">{job.location}</p>
        </div>
      ))}
    </div>
  );
};

JobList.propTypes = {
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      company: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired
    })
  ).isRequired,
  onJobSelect: PropTypes.func.isRequired
};

export default JobList;