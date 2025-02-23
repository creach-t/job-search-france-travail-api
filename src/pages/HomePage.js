import React, { useState } from 'react';
import { useJobSearch, useSaveJob, useApplyToJob } from '../hooks/useJobs';
import JobCard from '../components/molecules/JobCard/JobCard';
import { toast } from 'react-hot-toast';

const HomePage = () => {
  const [searchParams] = useState({});
  
  const { 
    data: jobs = [], 
    isLoading, 
    error 
  } = useJobSearch(searchParams);

  const { mutate: saveJob, isLoading: isSaving } = useSaveJob();
  const { mutate: applyToJob, isLoading: isApplying } = useApplyToJob();

  const handleSave = async (jobId) => {
    try {
      await saveJob(jobId);
      toast.success('Offre sauvegardée avec succès');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await applyToJob(jobId);
      toast.success('Candidature envoyée avec succès');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Une erreur est survenue lors du chargement des offres.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Offres d'emploi</h1>
        <p className="mt-2 text-gray-600">{jobs.length} offres disponibles</p>
      </header>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucune offre disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApply}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default HomePage;