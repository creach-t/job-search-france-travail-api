import React, { useState } from 'react';
import PropTypes from 'prop-types';
import JobHeader from './components/JobHeader';
import JobDetails from './components/JobDetails';
import JobDescription from './components/JobDescription';
import JobSkills from './components/JobSkills';
import JobActions from './components/JobActions';

const JobCard = ({
  title,
  company,
  logo,
  publicationDate,
  contractType,
  location,
  salary,
  workingHours,
  description,
  skills,
  onApply,
  onSave,
  isSaved
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <JobHeader
        title={title}
        company={company}
        logo={logo}
        publicationDate={publicationDate}
      />
      
      <JobDetails
        contractType={contractType}
        location={location}
        salary={salary}
        workingHours={workingHours}
      />
      
      <JobDescription
        description={description}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />
      
      <JobSkills skills={skills} />
      
      <JobActions
        onApply={onApply}
        onSave={onSave}
        isSaved={isSaved}
      />
    </div>
  );
};

JobCard.propTypes = {
  title: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  logo: PropTypes.string,
  publicationDate: PropTypes.string.isRequired,
  contractType: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  salary: PropTypes.string,
  workingHours: PropTypes.string,
  description: PropTypes.string.isRequired,
  skills: PropTypes.arrayOf(PropTypes.string),
  onApply: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaved: PropTypes.bool
};

export default JobCard;