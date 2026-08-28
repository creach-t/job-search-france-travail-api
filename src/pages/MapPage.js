import React, { useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAllJobs } from '../hooks/useAllJobs';
import { ROUTES } from '../utils/constants';

// ── Super-cluster (groupe de villes au niveau pays/région) ──────────────────
// Affiché quand plusieurs villes proches sont regroupées en dézoom
const createSuperClusterIcon = (cluster) => {
  const count = cluster.getChildCount();
  const size = count >= 15 ? 52 : count >= 7 ? 44 : 36;
  return L.divIcon({
    html: `<div style="background:rgba(10,118,246,0.82);color:white;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);">${count}</div>`,
    className: '',
    iconSize: L.point(size, size),
  });
};

// ── Bulle de ville ───────────────────────────────────────────────────────────
// Taille et couleur proportionnelles à la densité d'offres dans cette ville
const createCityIcon = (count, maxCount) => {
  const ratio = maxCount > 1 ? count / maxCount : 0;
  const size  = Math.round(28 + ratio * 22); // 28 → 50 px
  const bg =
    ratio < 0.15 ? '#60a5fa'  // bleu clair  — peu d'offres
    : ratio < 0.35 ? '#2563eb' // bleu         — quelques offres
    : ratio < 0.6  ? '#4f46e5' // indigo        — densité moyenne
    : ratio < 0.85 ? '#ea580c' // orange        — forte densité
    : '#dc2626';                // rouge         — zone très dense
  const half = size / 2;
  return L.divIcon({
    html: `<div style="background:${bg};color:white;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${size > 38 ? 12 : 10}px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer;">${count > 999 ? '999+' : count}</div>`,
    className: '',
    iconSize: L.point(size, size),
    iconAnchor: L.point(half, half),
    popupAnchor: L.point(0, -(half + 6)),
  });
};

// ── Spinner léger barre de statut ────────────────────────────────────────────
const SmallSpinner = () => (
  <svg className="animate-spin h-3.5 w-3.5 text-ft-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// ── Popup ville ──────────────────────────────────────────────────────────────
// Composant pur, reçoit city + callback onView(city, distance)
const CityPopup = ({ city, onView }) => (
  <div style={{ minWidth: 240, maxWidth: 280 }}>
    {/* En-tête */}
    <div className="flex items-center justify-between mb-2">
      <span className="font-bold text-gray-900 text-sm">{city.libelle}</span>
      <span className="text-xs bg-ft-blue text-white px-2 py-0.5 rounded-full ml-2 shrink-0">
        {city.jobs.length} offre{city.jobs.length > 1 ? 's' : ''}
      </span>
    </div>

    {/* Aperçu des 3 premières offres */}
    <div className="mb-3">
      {city.jobs.slice(0, 3).map((job) => (
        <div key={job.id} className="border-t border-gray-100 py-1.5">
          <p className="text-xs font-medium text-gray-800 leading-snug" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
            {job.intitule}
          </p>
          {job.entreprise?.nom && (
            <p className="text-xs text-gray-400 truncate">{job.entreprise.nom}</p>
          )}
        </div>
      ))}
      {city.jobs.length > 3 && (
        <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">
          + {city.jobs.length - 3} autre{city.jobs.length - 3 > 1 ? 's' : ''} offre{city.jobs.length - 3 > 1 ? 's' : ''}
        </p>
      )}
    </div>

    {/* Actions */}
    <div className="border-t border-gray-100 pt-2 space-y-2">
      <button
        onClick={() => onView(city, null)}
        className="w-full text-left text-xs font-semibold text-ft-blue hover:text-ft-darkblue transition-colors"
      >
        Voir {city.jobs.length > 1 ? `les ${city.jobs.length} offres` : "l'offre"} à {city.libelle} →
      </button>
      {city.commune && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-gray-400 shrink-0">Élargir à</span>
          {['10', '30', '50'].map((d) => (
            <button
              key={d}
              onClick={() => onView(city, d)}
              className="text-xs px-2 py-0.5 rounded-full border border-gray-200 hover:border-ft-blue hover:text-ft-blue transition-colors"
            >
              {d} km
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ── Page principale ──────────────────────────────────────────────────────────
const MapPage = () => {
  const { homeSearchParams, updateHomeSearchParams } = useAppContext();
  const navigate = useNavigate();

  // Convertit les stacks en keywords pour useAllJobs
  const mapParams = useMemo(() => {
    if (!homeSearchParams) return null;
    const { stacks, keywords, ...rest } = homeSearchParams;
    return stacks?.length > 0 ? { ...rest, keywords: stacks.join(' ') } : homeSearchParams;
  }, [homeSearchParams]);

  const { allJobs, total, isLoading, isFetching, loadedPages, totalApiPages } =
    useAllJobs(mapParams, !!mapParams);

  // Filtrer les offres géolocalisées
  const jobsWithCoords = useMemo(
    () => allJobs.filter((j) => j.lieuTravail?.latitude && j.lieuTravail?.longitude),
    [allJobs]
  );

  // ── Agréger par ville (même lat/lng = même commune) ──────────────────────
  const cityMarkers = useMemo(() => {
    const map = new Map();
    jobsWithCoords.forEach((job) => {
      const key = `${job.lieuTravail.latitude},${job.lieuTravail.longitude}`;
      if (!map.has(key)) {
        map.set(key, {
          lat: job.lieuTravail.latitude,
          lng: job.lieuTravail.longitude,
          libelle: job.lieuTravail.libelle || '—',
          commune: job.lieuTravail.commune,
          jobs: [],
        });
      }
      map.get(key).jobs.push(job);
    });
    return Array.from(map.values());
  }, [jobsWithCoords]);

  // Valeur max pour le calcul de couleur/taille des bulles
  const maxCityCount = useMemo(
    () => cityMarkers.reduce((m, c) => Math.max(m, c.jobs.length), 1),
    [cityMarkers]
  );

  // Pré-calculer les icônes (évite de recréer L.divIcon à chaque render)
  const cityMarkersWithIcons = useMemo(
    () => cityMarkers.map((city) => ({ ...city, icon: createCityIcon(city.jobs.length, maxCityCount) })),
    [cityMarkers, maxCityCount]
  );

  // Clic sur "Voir les offres" → mise à jour searchParams + navigation accueil
  const handleViewCity = useCallback(
    (city, distance) => {
      updateHomeSearchParams({
        ...homeSearchParams,
        ...(city.commune
          ? {
              location: city.commune,
              locationLabel: city.libelle,
              // null = garder la distance actuelle de la recherche
              // valeur fournie = forcer un rayon précis (boutons "Élargir à")
              ...(distance !== null ? { distance } : {}),
            }
          : {}),
      });
      navigate(ROUTES.HOME);
    },
    [homeSearchParams, updateHomeSearchParams, navigate]
  );

  // Résumé de la recherche pour la barre de statut
  const searchSummary = useMemo(() => {
    if (!homeSearchParams) return null;
    const { keywords, stacks, location, locationLabel, distance } = homeSearchParams;
    const parts = [];
    if (stacks?.length > 0) parts.push(stacks.join(', '));
    else if (keywords) parts.push(`"${keywords}"`);
    if (location) {
      const city = locationLabel || location;
      const dist = distance === '0' ? 'lieu exact' : distance ? `${distance} km` : '';
      parts.push(dist ? `${city} · ${dist}` : city);
    }
    return parts.join(' — ') || 'Tous métiers';
  }, [homeSearchParams]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>

      {/* ── Barre de statut ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 text-sm z-10 min-h-[40px]">
        {homeSearchParams ? (
          <>
            <span className="font-medium text-gray-700 truncate" title={searchSummary}>
              {searchSummary}
            </span>
            {isFetching && (
              <span className="flex items-center gap-1.5 text-ft-blue text-xs shrink-0">
                <SmallSpinner />
                {loadedPages}/{totalApiPages}
              </span>
            )}
            {!isLoading && cityMarkers.length > 0 && (
              <span className="ml-auto text-xs text-gray-400 shrink-0 whitespace-nowrap">
                <span className="font-semibold text-gray-700">{cityMarkers.length}</span> ville{cityMarkers.length > 1 ? 's' : ''}
                {' · '}
                <span className="font-semibold text-gray-700">{jobsWithCoords.length.toLocaleString('fr-FR')}</span> offre{jobsWithCoords.length > 1 ? 's' : ''}
                {total && total > allJobs.length && (
                  <span className="text-gray-300"> / {total.toLocaleString('fr-FR')}</span>
                )}
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-500">
            Lancez une recherche depuis{' '}
            <Link to={ROUTES.HOME} className="text-ft-blue hover:underline font-medium">
              l'accueil
            </Link>{' '}
            pour afficher les offres sur la carte.
          </span>
        )}
      </div>

      {/* ── Carte ───────────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <MapContainer
          center={[46.5, 2.5]}
          zoom={6}
          maxZoom={12}
          style={{ height: '100%', width: '100%' }}
          preferCanvas
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Les villes clustèrent entre elles jusqu'au zoom 10 */}
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createSuperClusterIcon}
            disableClusteringAtZoom={10}
            spiderfyOnMaxZoom={false}
            showCoverageOnHover={false}
            maxClusterRadius={60}
          >
            {cityMarkersWithIcons.map((city) => (
              <Marker
                key={`${city.lat},${city.lng}`}
                position={[city.lat, city.lng]}
                icon={city.icon}
              >
                <Popup maxWidth={300} closeButton={false}>
                  <CityPopup city={city} onView={handleViewCity} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Overlay chargement initial */}
        {isLoading && mapParams && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1000]">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-10 w-10 text-ft-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-600">Chargement des offres…</p>
            </div>
          </div>
        )}

        {/* État vide — pas de recherche active */}
        {!mapParams && (
          <div className="absolute inset-0 bg-ft-gray flex items-center justify-center z-[1000]">
            <div className="text-center px-6">
              <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-gray-500 mb-4">Aucune recherche active</p>
              <Link
                to={ROUTES.HOME}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-ft-blue text-white text-sm font-medium hover:bg-ft-darkblue transition-colors"
              >
                Lancer une recherche
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
