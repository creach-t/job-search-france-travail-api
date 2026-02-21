import { useAppContext } from '../context/AppContext';
import JobCard from '../components/JobCard';

const SavedJobsPage = () => {
  const { savedJobs, removeJob, clearSavedJobs } = useAppContext();

  const handleClearAllJobs = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les offres sauvegardées ?')) {
      clearSavedJobs();
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Vos offres sauvegardées
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Retrouvez ici toutes les offres d'emploi que vous avez sauvegardées
        </p>
      </div>

      {savedJobs.length > 0 ? (
        <>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {savedJobs.length} {savedJobs.length === 1 ? 'offre sauvegardée' : 'offres sauvegardées'}
            </h2>
            <button
              onClick={handleClearAllJobs}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Tout supprimer
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onRemove={() => removeJob(job.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <svg className="h-14 w-14 text-gray-300 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune offre sauvegardée</h3>
          <p className="mt-2 text-sm text-gray-500">
            Utilisez l'icône de marque-page sur les offres qui vous intéressent pour les retrouver ici.
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
