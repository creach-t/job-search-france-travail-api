import { useQuery, useQueries } from '@tanstack/react-query';
import { getAdzunaConfig, searchAdzunaJobs } from '../services/adzunaService';

/**
 * Offres Adzuna (source additionnelle), normalisées en Offer[].
 * Se gate sur la configuration serveur (clés présentes) : si non configurée,
 * `configured=false` et aucune requête n'est lancée → l'app reste 100 % FT.
 *
 * `pages` charge plusieurs pages Adzuna en parallèle (corpus pour le flux unifié).
 *
 * @param {Object} searchParams - paramètres de recherche de l'app
 * @param {{pages?:number, resultsPerPage?:number, enabled?:boolean}} opts
 */
export const useAdzunaJobs = (searchParams, { pages = 1, resultsPerPage = 50, enabled = false } = {}) => {
  const cfg = useQuery(['adzuna-config'], getAdzunaConfig, {
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const configured = cfg.data?.configured === true;
  const run = Boolean(enabled && configured && searchParams);

  const queries = useQueries({
    queries: run
      ? Array.from({ length: pages }, (_, i) => ({
          queryKey: ['adzuna-jobs', searchParams, i + 1, resultsPerPage],
          queryFn: () => searchAdzunaJobs(searchParams, { page: i + 1, resultsPerPage }),
          staleTime: 5 * 60 * 1000,
          retry: 0,
          keepPreviousData: true,
          refetchOnWindowFocus: false,
        }))
      : [],
  });

  // Fusion des pages + dé-dup par id
  const seen = new Set();
  const adzunaJobs = [];
  queries.forEach((q) => (q.data?.resultats ?? []).forEach((o) => {
    if (o && o.id && !seen.has(o.id)) { seen.add(o.id); adzunaJobs.push(o); }
  }));

  return {
    configured,
    adzunaJobs,
    total: queries[0]?.data?.total ?? null,
    isLoading: run && queries.some((q) => q.isLoading),
    isFetching: queries.some((q) => q.isFetching),
    isError: queries.some((q) => q.isError),
  };
};
