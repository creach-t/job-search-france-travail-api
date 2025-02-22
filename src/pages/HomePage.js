import { useState } from 'react';
import SearchForm from '../components/SearchForm';
import JobCard from '../components/JobCard';
import { useSearchJobs } from '../hooks/useJobs';

const HomePage = () => {
  const [searchParams, setSearchParams] = useState(null);
  const { data, isLoading, isError, error } = useSearchJobs(searchParams);
  
  const handleSearch = (params) => {
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Trouvez votre prochain emploi de développeur web
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Recherchez parmi les offres d'emploi disponibles en France
        </p>
      </div>

      <div className="mb-8">
        <SearchForm onSearch={handleSearch} />
      </div>

      {searchParams && (
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-10 w-10 text-ft-blue mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-700">Recherche en cours...</p>
            </div>
          ) : isError ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Erreur lors de la recherche: {error?.message || "Une erreur s'est produite. Veuillez réessayer."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {data?.resultats?.length
                    ? `${data.resultats.length} offres trouvées`
                    : 'Aucune offre trouvée'}
                </h2>
              </div>

              {data?.resultats?.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {data.resultats.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="h-16 w-16 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune offre trouvée</h3>
                  <p className="mt-2 text-gray-500">
                    Essayez d'élargir votre recherche ou de modifier vos critères.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;