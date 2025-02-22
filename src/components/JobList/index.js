import React from 'react';
import JobCard from '../JobCard';
import NoResults from './NoResults';

const JobList = ({ jobs }) => {
  if (!jobs || jobs.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};

export default JobList;
