import { useQuery } from '@tanstack/react-query';
import { searchJobs, getJobById } from '../services/api';

// Hook personnalisé pour rechercher des offres d'emploi
export const useSearchJobs = (searchParams) => {
  return useQuery(
    ['jobs', searchParams],
    () => searchJobs(searchParams),
    {
      // Ne pas exécuter la requête si searchParams est null (avant la première recherche)
      enabled: !!searchParams,
      // Conserver les données précédentes pendant le chargement
      keepPreviousData: true,
      // Durée de mise en cache des résultats (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Gestionnaire d'erreur
      onError: (error) => {
        console.error('Erreur lors de la recherche d\'emplois:', error);
      },
    }
  );
};

// Hook personnalisé pour récupérer les détails d'une offre d'emploi par son ID
export const useGetJobById = (jobId) => {
  return useQuery(
    ['job', jobId],
    () => getJobById(jobId),
    {
      // Désactiver si pas d'ID
      enabled: !!jobId,
      // Durée de mise en cache des résultats (10 minutes)
      staleTime: 10 * 60 * 1000,
      // Tentatives de réessai en cas d'échec
      retry: 1,
      // Utiliser la mise en cache locale pendant la navigation
      cacheTime: 30 * 60 * 1000, // 30 minutes
      // Gestionnaire d'erreur
      onError: (error) => {
        console.error(`Erreur lors de la récupération de l'offre ID ${jobId}:`, error);
      },
    }
  );
};
