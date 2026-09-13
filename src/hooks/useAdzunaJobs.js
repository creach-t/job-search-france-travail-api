import { useQuery } from '@tanstack/react-query';
import { getAdzunaConfig, searchAdzunaJobs } from '../services/adzunaService';

/**
 * Offres Adzuna (source additionnelle), normalisées en Offer[].
 * Se gate sur la configuration serveur (clés présentes) : si non configurée,
 * `configured=false` et aucune requête n'est lancée → l'app reste 100 % FT.
 *
 * @param {Object} searchParams - paramètres de recherche de l'app
 * @param {{page?:number, resultsPerPage?:number, enabled?:boolean}} opts
 */
export const useAdzunaJobs = (searchParams, { page = 1, resultsPerPage = 50, enabled = false } = {}) => {
  const cfg = useQuery(['adzuna-config'], getAdzunaConfig, {
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const configured = cfg.data?.configured === true;

  const q = useQuery(
    ['adzuna-jobs', searchParams, page, resultsPerPage],
    () => searchAdzunaJobs(searchParams, { page, resultsPerPage }),
    {
      enabled: Boolean(enabled && configured && searchParams),
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      retry: 0,
      refetchOnWindowFocus: false,
    }
  );

  return {
    configured,
    adzunaJobs: q.data?.resultats ?? [],
    total: q.data?.total ?? null,
    isLoading: Boolean(enabled && configured && q.isLoading),
    isFetching: q.isFetching,
    isError: q.isError,
  };
};
