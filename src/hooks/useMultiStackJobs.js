import { useQueries } from '@tanstack/react-query';
import { searchJobs } from '../services/api';

const STACK_PAGE_SIZE = 150; // max résultats par stack

/**
 * Lance une recherche parallèle pour chaque stack sélectionné,
 * combine les résultats et déduplique par ID d'offre.
 *
 * @param {Object} baseParams  - Paramètres de base (sans keywords)
 * @param {string[]} stacks    - Tableau de stacks (ex: ['React', 'Vue'])
 * @param {boolean} enabled    - Activer les requêtes
 */
export const useMultiStackJobs = (baseParams, stacks = [], enabled = false) => {
  const shouldRun = enabled && !!baseParams && stacks.length > 0;

  const queries = useQueries({
    queries: shouldRun
      ? stacks.map(stack => ({
          queryKey: ['stack-jobs', baseParams, stack, STACK_PAGE_SIZE],
          queryFn: () => searchJobs({ ...baseParams, keywords: stack }, 0, STACK_PAGE_SIZE),
          staleTime: 5 * 60 * 1000,
          enabled: true,
        }))
      : [],
  });

  const isLoading  = queries.length > 0 && queries.every(q => q.isLoading);
  const isFetching = queries.some(q => q.isFetching);
  const isError    = queries.some(q => q.isError);
  const loadedCount = queries.filter(q => q.isSuccess).length;

  // Fusion + déduplication par id d'offre
  const seenIds = new Set();
  const allJobs = [];
  queries.forEach(q => {
    (q.data?.resultats ?? []).forEach(job => {
      if (!seenIds.has(job.id)) {
        seenIds.add(job.id);
        allJobs.push(job);
      }
    });
  });

  // Détail des totaux API par stack (pour affichage)
  const totalsPerStack = stacks.map((stack, i) => ({
    stack,
    apiTotal: queries[i]?.data?.total ?? null,
    fetched:  queries[i]?.data?.resultats?.length ?? 0,
  }));

  return {
    allJobs,
    total: allJobs.length,
    totalsPerStack,
    isLoading,
    isFetching,
    isError,
    loadedCount,
    queryCount: stacks.length,
  };
};
