/**
 * Projection géographique légère pour la carte SVG de France — SANS dépendance
 * externe (pas de d3, pas de tuiles/API). Projection équirectangulaire mise à
 * l'échelle par cos(latitude de référence) : les proportions de la France
 * métropolitaine restent correctes à cette échelle, pour un coût quasi nul.
 *
 * Le pipeline :
 *   1. `computeBounds(geojson)` → emprise géographique des départements.
 *   2. `createProjector(bounds, width, height, pad)` → objet capable de projeter
 *      un couple (lon, lat) en pixels du repère de base (zoom = 1) et de générer
 *      les `path` SVG des départements.
 *   3. `gridCluster(jobs, cellDeg)` → agrège les offres géolocalisées en cellules
 *      d'une grille dont la taille (en degrés) dépend du zoom → subdivision fluide
 *      région → département → commune.
 */

const LAT_REF = 46.6; // centre approximatif de la France métropolitaine
const K = Math.cos((LAT_REF * Math.PI) / 180); // ≈ 0.687 — compression en longitude

// ── Emprise géographique d'un FeatureCollection ──────────────────────────────
export function computeBounds(geojson) {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;

  const scanRing = (ring) => {
    for (let i = 0; i < ring.length; i++) {
      const lon = ring[i][0];
      const lat = ring[i][1];
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  };

  for (const f of geojson.features) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') g.coordinates.forEach(scanRing);
    else if (g.type === 'MultiPolygon') g.coordinates.forEach((p) => p.forEach(scanRing));
  }
  return { minLon, maxLon, minLat, maxLat };
}

// ── Projecteur (repère de base, zoom = 1) ────────────────────────────────────
export function createProjector(bounds, width, height, pad = 12) {
  const { minLon, maxLon, minLat, maxLat } = bounds;

  // Espace projeté (avant mise à l'échelle pixels)
  const xMin = minLon * K;
  const xMax = maxLon * K;
  const yMin = -maxLat; // l'axe y est inversé (nord en haut)
  const yMax = -minLat;

  const spanX = xMax - xMin || 1;
  const spanY = yMax - yMin || 1;

  const s = Math.min((width - 2 * pad) / spanX, (height - 2 * pad) / spanY);
  const drawnW = spanX * s;
  const drawnH = spanY * s;
  const ox = pad + (width - 2 * pad - drawnW) / 2;
  const oy = pad + (height - 2 * pad - drawnH) / 2;

  const toPixel = (lon, lat) => [ox + (lon * K - xMin) * s, oy + (-lat - yMin) * s];

  // Génère l'attribut `d` d'un path SVG pour une feature (Polygon/MultiPolygon)
  const pathFor = (feature) => {
    const g = feature.geometry;
    if (!g) return '';
    const ringToPath = (ring) => {
      let d = '';
      for (let i = 0; i < ring.length; i++) {
        const [px, py] = toPixel(ring[i][0], ring[i][1]);
        d += (i === 0 ? 'M' : 'L') + px.toFixed(1) + ' ' + py.toFixed(1);
      }
      return d + 'Z';
    };
    if (g.type === 'Polygon') return g.coordinates.map(ringToPath).join('');
    if (g.type === 'MultiPolygon') return g.coordinates.map((p) => p.map(ringToPath).join('')).join('');
    return '';
  };

  return { toPixel, pathFor, width, height };
}

/**
 * Taille de cellule (en degrés) en fonction du niveau de zoom.
 * z = 1  → ~0.85° (grosses grappes régionales)
 * z = 4  → ~0.21° (échelle agglomération / département)
 * z ≥ 10 → plancher ~0.06° (commune)
 */
export function cellDegForZoom(z) {
  return Math.min(1.1, Math.max(0.05, 0.85 / z));
}

/**
 * Agrège des offres géolocalisées en cellules d'une grille régulière.
 * @param {Array} jobs offres avec lieuTravail.latitude / .longitude
 * @param {number} cellDeg taille de cellule en degrés
 * @returns {Array} clusters { key, lat, lng, count, jobs, libelle }
 */
export function gridCluster(jobs, cellDeg) {
  const cells = new Map();
  for (const job of jobs) {
    const lt = job.lieuTravail;
    if (!lt || lt.latitude == null || lt.longitude == null) continue;
    const gx = Math.floor(lt.longitude / cellDeg);
    const gy = Math.floor(lt.latitude / cellDeg);
    const key = gx + ':' + gy;
    let cell = cells.get(key);
    if (!cell) {
      cell = { key, sumLat: 0, sumLng: 0, count: 0, jobs: [], labels: new Map() };
      cells.set(key, cell);
    }
    cell.sumLat += lt.latitude;
    cell.sumLng += lt.longitude;
    cell.count += 1;
    cell.jobs.push(job);
    // Mémoriser le libellé de commune dominant de la cellule
    const lib = lt.libelle || '';
    if (lib) cell.labels.set(lib, (cell.labels.get(lib) || 0) + 1);
  }

  const out = [];
  for (const cell of cells.values()) {
    // Libellé dominant de la cellule
    let libelle = '';
    let best = 0;
    for (const [lib, n] of cell.labels) {
      if (n > best) { best = n; libelle = lib; }
    }
    out.push({
      key: cell.key,
      lat: cell.sumLat / cell.count,
      lng: cell.sumLng / cell.count,
      count: cell.count,
      jobs: cell.jobs,
      libelle: libelle || '—',
    });
  }
  // Les plus gros clusters rendus en dernier (au-dessus)
  out.sort((a, b) => a.count - b.count);
  return out;
}
