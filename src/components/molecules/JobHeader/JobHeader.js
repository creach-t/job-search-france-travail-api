import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const JobHeader = ({ title, company, publicationDate }) => {
  const formattedDate = formatDistanceToNow(new Date(publicationDate), {
    addSuffix: true,
    locale: fr
  });

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <div className="flex items-center justify-between mt-2">
        <span className="text-gray-600">{company}</span>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>
    </div>
  );
};

JobHeader.propTypes = {
  title: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  publicationDate: PropTypes.string.isRequired
};

export default JobHeader;