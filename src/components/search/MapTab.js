import React, { useMemo, useCallback } from 'react';
import FranceClusterMap from './map/FranceClusterMap';
import { useAllJobs } from '../../hooks/useAllJobs';
import { useAppContext } from '../../context/AppContext';
import { toBulkParams, searchLabel } from '../../utils/searchLabel';

// Onglet Carte — clusters de la recherche courante sur un fond SVG (sans API externe)
const MapTab = ({ searchParams, onSwitchToResults }) => {
  const { homeSearchParams, updateHomeSearchParams } = useAppContext();
  const bulkParams = useMemo(() => toBulkParams(searchParams), [searchParams]);

  const { allJobs, total, isLoading, isFetching, loadedPages, totalApiPages } =
    useAllJobs(bulkParams, !!bulkParams);

  const summary = useMemo(() => searchLabel(searchParams) || 'Tous métiers', [searchParams]);

  // Clic sur un cluster → cible la commune et bascule sur les résultats
  const handleViewCity = useCallback((city, distance) => {
    updateHomeSearchParams({
      ...homeSearchParams,
      ...(city?.commune
        ? {
            location: city.commune,
            locationLabel: city.libelle,
            ...(distance !== null ? { distance } : {}),
          }
        : {}),
    });
    onSwitchToResults();
  }, [homeSearchParams, updateHomeSearchParams, onSwitchToResults]);

  return (
    <FranceClusterMap
      jobs={allJobs}
      total={total}
      isLoading={isLoading}
      isFetching={isFetching}
      loadedPages={loadedPages}
      totalApiPages={totalApiPages}
      searchSummary={summary}
      onViewCity={handleViewCity}
    />
  );
};

export default MapTab;
