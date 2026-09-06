import { useQuery } from '@tanstack/react-query';
import {
  getMarketConfig, queryMarcheTravail, MT_ENDPOINTS, buildSelection, parseStatSeries,
} from '../services/marcheTravail';

/**
 * Tendances RÉELLES issues de l'API SODE (offres & demandes d'emploi), source FT/DARES.
 * Une requête (/indicateur/stat-offres, périodicité TRIMESTRE) → série trimestrielle,
 * évolution calculée sur la série. Résilient : configured=false / isError, jamais de faux.
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
    staleTime: 6 * 60 * 60 * 1000,
    retry: 0,
    queryFn: async () => {
      const sel = buildSelection(scope);
      let raw;
      try {
        raw = await queryMarcheTravail(MT_ENDPOINTS.statOffres, sel);
      } catch (err) {
        const d = err?.response?.data;
        throw new Error(`HTTP ${d?.status || err?.response?.status || '?'} — ${JSON.stringify(d?.detail || d?.message || err.message).slice(0, 200)}`);
      }
      const parsed = parseStatSeries(raw);
      if (!parsed) {
        // eslint-disable-next-line no-console
        console.warn('[SODE] réponse non parsée:', raw);
        const keys = raw && typeof raw === 'object' ? Object.keys(raw).join(',') : typeof raw;
        throw new Error(`Réponse 200 mais non parsée (clés: ${keys})`);
      }
      return parsed;
    },
  });

  return {
    configured,
    hasScope: cfg.data?.hasScope,
    hasBase: cfg.data?.hasBase,
    isLoading: configured && q.isLoading,
    isError: q.isError,
    error: q.error,
    series: q.data?.series ?? [],
    latest: q.data?.latest ?? null,
    growthPct: q.data?.growthPct ?? null,
    source: 'France Travail / DARES — Statistiques offres & demandes d’emploi',
  };
};
