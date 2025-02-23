import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchJobs } from '../services/api';
import JobCard from '../components/molecules/JobCard/JobCard';

const HomePage = () => {
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => searchJobs({})
  });

  const handleApply = (jobId) => {
    console.log('Postuler pour le job:', jobId);
  };

  const handleSave = (jobId) => {
    console.log('Sauvegarder le job:', jobId);
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  console.log('Jobs reçus:', jobs); // Pour le débogage

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Offres d'emploi</h1>
      <div className="grid gap-6">
        {Array.isArray(jobs) && jobs.map((job) => (
          <JobCard
            key={job.id}
            title={job.title}
            company={job.company}
            location={job.location}
            description={job.description}
            contractType={job.type}
            publicationDate={job.publicationDate || new Date().toISOString()}
            onApply={() => handleApply(job.id)}
            onSave={() => handleSave(job.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;