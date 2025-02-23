import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchJobs } from '../services/api';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Offres d'emploi</h1>
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
              <p className="text-gray-600">{job.company}</p>
              <p className="text-sm text-gray-500">
                {new Date(job.publicationDate).toLocaleDateString('fr-FR')}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">
                <span className="font-medium">Type:</span> {job.type}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Lieu:</span> {job.location}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{job.description}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleSave(job.id)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => handleApply(job.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Postuler
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;