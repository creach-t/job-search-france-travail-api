import JobCard from './JobCard';

const JobList = ({ jobs }) => {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="h-16 w-16 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune offre trouvée</h3>
        <p className="mt-2 text-gray-500">
          Essayez d'élargir votre recherche ou de modifier vos critères.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Compteur de résultats */}
      <div className="mb-6 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-ft-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{jobs.length}</span> offre{jobs.length > 1 ? 's' : ''} trouvée{jobs.length > 1 ? 's' : ''}
            </p>
          </div>
          {jobs.length === 20 && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
              Affichage limité à 20 résultats
            </span>
          )}
        </div>
      </div>

      {/* Grille des offres */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobList;
