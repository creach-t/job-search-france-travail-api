import React, { useMemo, useCallback } from 'react';
import FranceClusterMap from './map/FranceClusterMap';
import { useUnifiedJobs } from '../../hooks/useUnifiedJobs';
import { useAppContext } from '../../context/AppContext';
import { toBulkParams, searchLabel } from '../../utils/searchLabel';

// Onglet Carte — clusters de la recherche courante (flux unifié FT + Adzuna) sur un fond SVG
const MapTab = ({ searchParams, onSwitchToResults }) => {
  const { homeSearchParams, updateHomeSearchParams } = useAppContext();
  const bulkParams = useMemo(() => toBulkParams(searchParams), [searchParams]);

  const { jobs: allJobs, ftTotal, adzunaTotal, isLoading, isFetching } = useUnifiedJobs(bulkParams);
  const total = (ftTotal || 0) + (adzunaTotal || 0);

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
      loadedPages={1}
      totalApiPages={1}
      searchSummary={summary}
      onViewCity={handleViewCity}
    />
  );
};

export default MapTab;
