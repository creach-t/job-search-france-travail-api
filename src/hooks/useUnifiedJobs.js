import { useMemo } from 'react';
import { useAllJobs } from './useAllJobs';
import { useMultiStackJobs } from './useMultiStackJobs';
import { useAdzunaJobs } from './useAdzunaJobs';
import { mergeOffers, countBySource } from '../domain/mergeOffers';
import { convertToAnnualSalary } from '../utils/salaryUtils';

const ADZUNA_PAGES = 3; // ~150 offres Adzuna pour le corpus fusionné

/**
 * Flux d'offres UNIFIÉ (France Travail + Adzuna) : un seul jeu d'offres trié par
 * date, dé-dupliqué inter-sources, sur lequel s'appuient Résultats, Analyse et Carte.
 *
 * Côté FT, on charge le corpus complet (jusqu'à 1 150) via useAllJobs, ou les
 * résultats multi-stack via useMultiStackJobs — pour pouvoir trier/analyser sur
 * l'ensemble. Adzuna est chargé sur quelques pages. Le filtre salaire s'applique
 * côté client sur le combiné.
 *
 * @param {Object} searchParams
 */
export const useUnifiedJobs = (searchParams) => {
  const stacks = searchParams?.stacks ?? [];
  const hasMultiStack = stacks.length > 0;
  const salaryMin = searchParams?.salaryMin ? parseInt(searchParams.salaryMin, 10) : null;

  // FT — multi-stack : baseParams sans keywords/stacks (chaque stack = 1 requête)
  const baseParamsForStack = useMemo(() => {
    if (!searchParams || !hasMultiStack) return null;
    const { keywords: _kw, stacks: _st, ...rest } = searchParams;
    return rest;
  }, [searchParams, hasMultiStack]);

  const multi = useMultiStackJobs(baseParamsForStack, stacks, hasMultiStack);
  const all = useAllJobs(!hasMultiStack ? searchParams : null, !hasMultiStack && !!searchParams);
  const adz = useAdzunaJobs(searchParams, { pages: ADZUNA_PAGES, enabled: !!searchParams });

  const ftJobs = hasMultiStack ? multi.allJobs : all.allJobs;
  const ftTotal = hasMultiStack ? multi.total : all.total;
  const ftLoading = hasMultiStack ? multi.isLoading : all.isLoading;
  const ftFetching = hasMultiStack ? multi.isFetching : all.isFetching;
  const ftError = hasMultiStack ? multi.isError : all.isError;

  // Fusion + filtre salaire client
  const jobs = useMemo(() => {
    let merged = mergeOffers([ftJobs, adz.adzunaJobs]); // FT prioritaire sur doublon
    if (salaryMin) {
      merged = merged.filter((o) => {
        const annual = convertToAnnualSalary(o.salaire);
        return annual !== null && annual >= salaryMin;
      });
    }
    return merged;
  }, [ftJobs, adz.adzunaJobs, salaryMin]);

  const counts = useMemo(() => countBySource(jobs), [jobs]);

  return {
    jobs,
    counts,                       // { 'france-travail': n, adzuna: m }
    ftTotal,                      // total réel FT (Content-Range)
    adzunaTotal: adz.total,       // total réel Adzuna
    adzunaConfigured: adz.configured,
    hasMultiStack,
    // FT pilote le chargement principal ; Adzuna enrichit ensuite
    isLoading: ftLoading,
    isFetching: ftFetching || adz.isFetching,
    isError: ftError,
    ftCapped: ftTotal !== null && ftTotal > 1150 && !hasMultiStack,
  };
};
