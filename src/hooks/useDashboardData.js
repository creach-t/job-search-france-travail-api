import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { countJobs } from '../services/api';
import {
  ROME_GRANDS_DOMAINES, REGIONS, CONTRAT_FACETS, FRESHNESS_WINDOWS, POPULAR_METIERS,
} from '../services/facets';

const COUNT_CACHE = { staleTime: 30 * 60 * 1000, gcTime: 60 * 60 * 1000, retry: 1 };

/**
 * Construit la liste des « comptages » à effectuer pour un périmètre donné.
 * Chaque comptage est 1 requête bon marché (range 0-1 → total exact).
 * scope = filtres de base (ex: {} pour national, ou {codeROME, region…}).
 */
const buildSpecs = (scope) => {
  const specs = [];
  specs.push({ group: 'total', id: 'total', label: 'Total', params: { ...scope } });

  FRESHNESS_WINDOWS.forEach((d) =>
    specs.push({ group: 'freshness', id: `fresh-${d}`, code: d, label: `${d} j`, params: { ...scope, publieeDepuis: d } }));

  ROME_GRANDS_DOMAINES.forEach((g) =>
    specs.push({ group: 'category', id: `cat-${g.code}`, code: g.code, label: g.label, params: { ...scope, grandDomaine: g.code } }));

  CONTRAT_FACETS.forEach((c) =>
    specs.push({ group: 'contract', id: `ct-${c.code}`, code: c.code, label: c.label, params: { ...scope, contractType: c.code } }));

  POPULAR_METIERS.forEach((m) =>
    specs.push({ group: 'metier', id: `rome-${m.code}`, code: m.code, label: m.label, params: { ...scope, codeROME: m.code } }));

  REGIONS.forEach((r) =>
    specs.push({ group: 'region', id: `reg-${r.code}`, code: r.code, label: r.label, params: { ...scope, region: r.code } }));

  return specs;
};

/**
 * Dashboard « quota-aware » : compte exact par facette, rendu progressif (chaque
 * cellule se remplit dès que sa requête répond), avec cache long.
 * @param {Object} scope - filtres de base (périmètre du dashboard)
 */
export const useDashboardData = (scope = {}) => {
  const specs = useMemo(() => buildSpecs(scope), [scope]);

  const results = useQueries({
    queries: specs.map((s) => ({
      queryKey: ['count', s.params],
      queryFn: () => countJobs(s.params),
      ...COUNT_CACHE,
    })),
  });

  return useMemo(() => {
    const get = (i) => (results[i]?.isSuccess ? results[i].data : null);
    const pick = (group) =>
      specs
        .map((s, i) => ({ ...s, total: get(i), loading: results[i]?.isLoading }))
        .filter((s) => s.group === group);

    const totalSpec = specs.findIndex((s) => s.group === 'total');
    const total = get(totalSpec);

    // Fraîcheur : counts cumulés par fenêtre → convertis en tranches lisibles
    const freshRows = pick('freshness').sort((a, b) => a.code - b.code); // 1,3,7,14,31
    const freshness = {
      last1: freshRows.find((r) => r.code === 1)?.total ?? null,
      last7: freshRows.find((r) => r.code === 7)?.total ?? null,
      last31: freshRows.find((r) => r.code === 31)?.total ?? null,
      // Courbe cumulée (nb d'offres ouvertes publiées depuis X jours)
      curve: freshRows.map((r) => ({ label: `${r.code} j`, days: r.code, value: r.total ?? 0 })),
    };

    const categories = pick('category')
      .map((r) => ({ code: r.code, label: r.label, total: r.total ?? 0 }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total);

    const contracts = pick('contract')
      .map((r) => ({ code: r.code, label: r.label, total: r.total ?? 0 }))
      .sort((a, b) => b.total - a.total);

    const metiers = pick('metier')
      .map((r) => ({ code: r.code, label: r.label, total: r.total ?? 0 }))
      .sort((a, b) => b.total - a.total);

    const regions = pick('region')
      .map((r) => ({ code: r.code, label: r.label, total: r.total ?? 0 }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total);

    const loadedCount = results.filter((r) => r.isSuccess).length;
    const totalCount = specs.length;

    return {
      total,
      freshness,
      categories,
      contracts,
      metiers,
      regions,
      // total encore null tant que la 1re requête n'a pas répondu
      isLoading: total === null && loadedCount === 0,
      isError: results.some((r) => r.isError),
      loadedCount,
      totalCount,
      progress: totalCount ? loadedCount / totalCount : 0,
    };
  }, [results, specs]);
};
