import React from 'react';

const Tag = ({ color, text }) => {
  if (!text) return null;
  
  const bgColorClass = `bg-${color}-100`;
  const textColorClass = `text-${color}-800`;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${bgColorClass} ${textColorClass}`}>
      {text}
    </span>
  );
};

const JobTags = ({ typeContrat, dureeTravail, experience, qualification }) => {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Tag
        color="blue"
        text={typeContrat || 'Type de contrat non spécifié'}
      />
      {dureeTravail && (
        <Tag color="green" text={dureeTravail} />
      )}
      {experience && (
        <Tag color="purple" text={experience} />
      )}
      {qualification && (
        <Tag color="yellow" text={qualification} />
      )}
    </div>
  );
};

export default JobTags;
