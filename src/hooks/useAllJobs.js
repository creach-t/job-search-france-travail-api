import { useQueries } from '@tanstack/react-query';
import { searchJobs } from '../services/api';
import { DEFAULTS } from '../utils/constants';

const API_PAGE_SIZE = 150; // Taille max par appel API
const MAX_API_PAGES = Math.ceil(DEFAULTS.MAX_TOTAL / API_PAGE_SIZE); // 8 pages

/**
 * Charge toutes les pages disponibles en parallèle pour permettre
 * un filtrage côté client complet (ex: filtre salaire).
 * Retourne tous les résultats fusionnés + état de chargement global.
 */
export const useAllJobs = (searchParams, enabled = false) => {
  // On lance d'abord la page 0 pour connaître le total réel
  const firstPageQuery = useQueries({
    queries: enabled && searchParams ? [{
      queryKey: ['all-jobs', searchParams, 0],
      queryFn: () => searchJobs(searchParams, 0, API_PAGE_SIZE),
      staleTime: 5 * 60 * 1000,
      enabled: !!searchParams && enabled,
    }] : [],
  });

  const firstPage = firstPageQuery[0];
  const total = firstPage?.data?.total ?? null;
  const apiPageCount = total !== null
    ? Math.min(Math.ceil(Math.min(total, DEFAULTS.MAX_TOTAL) / API_PAGE_SIZE), MAX_API_PAGES)
    : 0;

  // Charger les pages suivantes une fois qu'on connaît le total
  const remainingQueries = useQueries({
    queries: enabled && searchParams && apiPageCount > 1
      ? Array.from({ length: apiPageCount - 1 }, (_, i) => ({
          queryKey: ['all-jobs', searchParams, i + 1],
          queryFn: () => searchJobs(searchParams, i + 1, API_PAGE_SIZE),
          staleTime: 5 * 60 * 1000,
          enabled: !!firstPage?.data, // Seulement après avoir la page 0
        }))
      : [],
  });

  const allQueries = firstPageQuery.concat(remainingQueries);
  const isLoading = allQueries.some(q => q.isLoading || q.isFetching);
  const isError = allQueries.some(q => q.isError);
  const loadedCount = allQueries.filter(q => q.isSuccess).length;
  const totalApiPages = apiPageCount || 1;

  // Fusionner tous les résultats
  const allJobs = allQueries
    .filter(q => q.isSuccess && q.data?.resultats)
    .flatMap(q => q.data.resultats);

  return {
    allJobs,
    total,
    isLoading: firstPage?.isLoading ?? true,
    isFetching: isLoading,
    isError,
    loadedPages: loadedCount,
    totalApiPages,
  };
};
