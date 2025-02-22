import { useState } from 'react';
import SearchForm from '../components/SearchForm';
import JobList from '../components/JobList';
import Spinner from '../components/ui/Spinner';
import Error from '../components/ui/Error';
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
            <Spinner text="Recherche en cours..." />
          ) : isError ? (
            <Error message={error?.message || "Une erreur s'est produite. Veuillez réessayer."} />
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {data?.resultats?.length
                    ? `${data.resultats.length} offres trouvées`
                    : 'Aucune offre trouvée'}
                </h2>
              </div>

              <JobList jobs={data?.resultats || []} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
