import { useQuery } from '@tanstack/react-query';
import {
  getMarketConfig, queryMarcheTravail, MT,
  normalizeSeries, normalizeScalar, growthFromSeries,
} from '../services/marcheTravail';

/**
 * Tendances réelles issues de l'API « Marché du travail » (trimestriel, source FT/DARES).
 * Résilient : si l'API n'est pas configurée ou répond mal, on renvoie configured/erreur
 * plutôt que d'inventer des chiffres.
 *
 * @param {Object} scope - { codeRome?, codeTypeTerritoire?, codeTerritoire? }
 */
export const useMarketTrends = (scope = {}) => {
  const cfg = useQuery({
    queryKey: ['mt-config'],
    queryFn: getMarketConfig,
    staleTime: 60 * 60 * 1000,
  });

  const configured = cfg.data?.configured === true;

  const q = useQuery({
    queryKey: ['mt-trends', scope],
    enabled: configured,
    staleTime: 6 * 60 * 60 * 1000, // données trimestrielles → cache long
    retry: 0,
    queryFn: async () => {
      const selection = MT.baseSelection(scope);

      const [offres, dyn, tension] = await Promise.allSettled([
        queryMarcheTravail(MT.endpoints.offresEnregistrees, selection),
        queryMarcheTravail(MT.endpoints.dynamiqueEmploi, selection),
        queryMarcheTravail(MT.endpoints.difficultesRecrutement, selection),
      ]);

      const trend = offres.status === 'fulfilled' ? normalizeSeries(offres.value) : [];
      const growthPct = trend.length
        ? growthFromSeries(trend)
        : (dyn.status === 'fulfilled' ? normalizeScalar(dyn.value) : null);
      const tensionValue = tension.status === 'fulfilled' ? normalizeScalar(tension.value) : null;

      // Si absolument rien n'a pu être extrait, on considère l'appel comme non exploitable
      const anything = trend.length || growthPct != null || tensionValue != null;
      if (!anything) {
        const firstErr = [offres, dyn, tension].find((r) => r.status === 'rejected');
        throw new Error(firstErr?.reason?.response?.data?.message || 'Réponse Marché du travail non exploitable (vérifier endpoints/swagger)');
      }

      return { trend, growthPct, tensionValue };
    },
  });

  return {
    configured,
    hasScope: cfg.data?.hasScope,
    hasBase: cfg.data?.hasBase,
    isLoading: configured && q.isLoading,
    isError: q.isError,
    error: q.error,
    trend: q.data?.trend ?? [],
    growthPct: q.data?.growthPct ?? null,
    tensionValue: q.data?.tensionValue ?? null,
    source: 'Offres enregistrées — France Travail / DARES (trimestriel)',
  };
};
