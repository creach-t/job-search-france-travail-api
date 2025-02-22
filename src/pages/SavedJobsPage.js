import { useState, useEffect } from 'react';
import JobCard from '../components/JobCard';

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger les offres sauvegardées depuis le localStorage
    const loadSavedJobs = () => {
      const jobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setSavedJobs(jobs);
      setIsLoading(false);
    };

    loadSavedJobs();

    // Écouter les changements dans le localStorage (pour l'ajout/suppression d'offres)
    const handleStorageChange = () => {
      loadSavedJobs();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleClearAllJobs = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les offres sauvegardées ?')) {
      localStorage.setItem('savedJobs', '[]');
      setSavedJobs([]);
      
      // Déclencher un événement de stockage pour mettre à jour les autres composants
      window.dispatchEvent(new Event('storage'));
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

      {isLoading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-10 w-10 text-ft-blue mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-700">Chargement en cours...</p>
        </div>
      ) : (
        <>
          {savedJobs.length > 0 ? (
            <>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {savedJobs.length} {savedJobs.length === 1 ? 'offre sauvegardée' : 'offres sauvegardées'}
                </h2>
                <button
                  onClick={handleClearAllJobs}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Tout supprimer
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {savedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <svg className="h-16 w-16 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune offre sauvegardée</h3>
              <p className="mt-2 text-gray-500">
                Vous n'avez pas encore sauvegardé d'offres d'emploi.
              </p>
              <p className="mt-1 text-gray-500">
                Utilisez le bouton de sauvegarde sur les offres qui vous intéressent pour les retrouver ici.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedJobsPage;