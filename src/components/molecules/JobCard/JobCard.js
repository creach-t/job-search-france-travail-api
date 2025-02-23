import React from 'react';
import PropTypes from 'prop-types';
import JobHeader from '../JobHeader/JobHeader';
import JobDetails from '../JobDetails/JobDetails';
import JobDescription from '../JobDescription/JobDescription';
import JobActions from '../JobActions/JobActions';

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
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <JobHeader title={title} company={company} publicationDate={publicationDate} />
      <JobDetails contractType={contractType} location={location} />
      <JobDescription description={description} />
      <JobActions onApply={onApply} onSave={onSave} />
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