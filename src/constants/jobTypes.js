export const JOB_TYPES = {
  CDI: 'CDI',
  CDD: 'CDD',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Stage',
  APPRENTICESHIP: 'Alternance'
};

export const getJobTypeLabel = (type) => {
  return JOB_TYPES[type] || type;
};

export const JOB_TYPE_VARIANTS = {
  [JOB_TYPES.CDI]: 'success',
  [JOB_TYPES.CDD]: 'info',
  [JOB_TYPES.FREELANCE]: 'warning',
  [JOB_TYPES.INTERNSHIP]: 'info',
  [JOB_TYPES.APPRENTICESHIP]: 'info'
};