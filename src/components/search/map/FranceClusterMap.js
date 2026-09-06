import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import franceGeo from '../../../assets/france-departements.json';
import {
  computeBounds, createProjector, cellDegForZoom, gridCluster,
} from '../../../utils/geoProjection';
import { departementFromCodePostal, DEPARTEMENTS } from '../../../utils/departements';

const W = 760;
const H = 760;
const PAD = 18;
const Z_MIN = 1;
const Z_MAX = 40;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const densityColor = (ratio) =>
  ratio < 0.15 ? '#60a5fa'
  : ratio < 0.35 ? '#3b82f6'
  : ratio < 0.6 ? '#6366f1'
  : ratio < 0.85 ? '#f59e0b'
  : '#ef4444';

const SmallSpinner = () => (
  <svg className="animate-spin h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const FranceClusterMap = ({
  jobs, total, isLoading, isFetching, loadedPages, totalApiPages, searchSummary, onViewCity,
}) => {
  const svgRef = useRef(null);
  const [view, setView] = useState({ z: 1, tx: 0, ty: 0 });
  const [animate, setAnimate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [interacting, setInteracting] = useState(false); // zoom/pan actif → gooey off (perf)
  const dragRef = useRef(null);
  const idleRef = useRef(null);
  const rafRef = useRef(null);
  const pendingWheel = useRef(null);

  // Projecteur + chemins des départements (une seule fois)
  const { projector, deptPaths, metroBounds } = useMemo(() => {
    const bounds = computeBounds(franceGeo);
    const proj = createProjector(bounds, W, H, PAD);
    const paths = franceGeo.features.map((f) => ({ code: f.properties.code, nom: f.properties.nom, d: proj.pathFor(f) }));
    const metro = {
      minLon: bounds.minLon - 1, maxLon: bounds.maxLon + 1,
      minLat: bounds.minLat - 1, maxLat: bounds.maxLat + 1,
    };
    return { projector: proj, deptPaths: paths, metroBounds: metro };
  }, []);

  // Métropole / outre-mer
  const { metroJobs, overseas } = useMemo(() => {
    const metro = [];
    const over = new Map();
    for (const job of jobs) {
      const lt = job.lieuTravail;
      if (!lt || lt.latitude == null || lt.longitude == null) continue;
      const inMetro =
        lt.longitude >= metroBounds.minLon && lt.longitude <= metroBounds.maxLon &&
        lt.latitude >= metroBounds.minLat && lt.latitude <= metroBounds.maxLat;
      if (inMetro) metro.push(job);
      else {
        const code = departementFromCodePostal(lt.codePostal);
        const key = code && DEPARTEMENTS[code] ? code : 'ETR';
        const label = key === 'ETR' ? 'Étranger / autre' : DEPARTEMENTS[code];
        const cur = over.get(key) || { count: 0, label };
        cur.count += 1;
        over.set(key, cur);
      }
    }
    return { metroJobs: metro, overseas: [...over.values()].sort((a, b) => b.count - a.count) };
  }, [jobs, metroBounds]);

  // Clustering + séparation — par palier de zoom
  const zoomBucket = Math.max(1, Math.round(view.z * 2) / 2);
  const invZ = 1 / zoomBucket; // contre-échelle discrète → bulles stables entre paliers
  const { clusters, maxCount } = useMemo(() => {
    const cellDeg = cellDegForZoom(zoomBucket);
    const raw = gridCluster(metroJobs, cellDeg).map((c) => {
      const [cx, cy] = projector.toPixel(c.lng, c.lat);
      return { ...c, cx, cy };
    });
    const max = raw.reduce((m, c) => Math.max(m, c.count), 1);
    const rOf = (count) => 8 + Math.sqrt(count / max) * 24;
    const s = zoomBucket;
    // léger chevauchement autorisé (facteur 0.78) → le filtre gooey crée la « tension de surface »
    const nodes = raw.map((c) => ({ ref: c, x: c.cx * s, y: c.cy * s, r: rOf(c.count) }));
    for (let it = 0; it < 12; it++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const min = (a.r + b.r) * 0.78;
          if (dist < min) {
            const push = (min - dist) / 2, ux = dx / dist, uy = dy / dist;
            a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push;
          }
        }
      }
    }
    const out = nodes.map((n) => ({ ...n.ref, r: rOf(n.ref.count), dcx: n.x / s, dcy: n.y / s }))
      .sort((a, b) => a.count - b.count);
    return { clusters: out, maxCount: max };
  }, [metroJobs, zoomBucket, projector]);

  // ── Interaction : marquer actif puis retomber en « idle » (réactive le gooey) ──
  const markInteracting = useCallback(() => {
    setInteracting(true);
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => setInteracting(false), 220);
  }, []);

  const toViewBox = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const loc = pt.matrixTransform(ctm.inverse());
    return { x: loc.x, y: loc.y };
  }, []);

  const clampPan = useCallback((tx, ty, z) => ({
    tx: clamp(tx, (1 - z) * W, 0), ty: clamp(ty, (1 - z) * H, 0),
  }), []);

  // ── Zoom molette throttlé en rAF (fluide) ──
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const apply = () => {
      rafRef.current = null;
      const w = pendingWheel.current; pendingWheel.current = null;
      if (!w) return;
      setView((v) => {
        const loc = toViewBox(w.clientX, w.clientY);
        const factor = Math.exp(-w.deltaY * 0.0015);
        const z = clamp(v.z * factor, Z_MIN, Z_MAX);
        const bx = (loc.x - v.tx) / v.z;
        const by = (loc.y - v.ty) / v.z;
        const { tx, ty } = clampPan(loc.x - bx * z, loc.y - by * z, z);
        return { z, tx, ty };
      });
    };
    const onWheel = (e) => {
      e.preventDefault();
      setAnimate(false);
      markInteracting();
      const prev = pendingWheel.current;
      pendingWheel.current = { clientX: e.clientX, clientY: e.clientY, deltaY: (prev ? prev.deltaY : 0) + e.deltaY };
      if (!rafRef.current) rafRef.current = requestAnimationFrame(apply);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      svg.removeEventListener('wheel', onWheel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [toViewBox, clampPan, markInteracting]);

  // ── Pan ──
  const onPointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setAnimate(false);
    dragRef.current = { last: toViewBox(e.clientX, e.clientY), moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    markInteracting();
    const loc = toViewBox(e.clientX, e.clientY);
    const dx = loc.x - d.last.x, dy = loc.y - d.last.y;
    if (Math.abs(dx) + Math.abs(dy) > 0.5) d.moved = true;
    d.last = loc;
    setView((v) => { const { tx, ty } = clampPan(v.tx + dx, v.ty + dy, v.z); return { ...v, tx, ty }; });
  };
  const onPointerUp = (e) => {
    const d = dragRef.current;
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    if (d && !d.moved) setSelected(null);
  };

  const zoomBy = (factor) => {
    setAnimate(true); markInteracting();
    setView((v) => {
      const z = clamp(v.z * factor, Z_MIN, Z_MAX);
      const cx = W / 2, cy = H / 2;
      const bx = (cx - v.tx) / v.z, by = (cy - v.ty) / v.z;
      const { tx, ty } = clampPan(cx - bx * z, cy - by * z, z);
      return { z, tx, ty };
    });
  };
  const resetView = () => { setAnimate(true); setSelected(null); setView({ z: 1, tx: 0, ty: 0 }); };

  const handleBubbleClick = useCallback((e, cluster) => {
    e.stopPropagation();
    setSelected((cur) => (cur && cur.key === cluster.key ? null : cluster));
  }, []);

  const gooStd = (6 / zoomBucket).toFixed(2); // blur constant à l'écran (~6px)

  // ── Layers mémoïsés (le zoom continu ne re-rend que la transform) ──
  const landLayer = useMemo(() => (
    <g>
      {deptPaths.map((dp) => (
        <path key={dp.code} d={dp.d}
          className={`map-dept ${hovered === dp.code ? 'map-dept--hover' : ''}`}
          vectorEffect="non-scaling-stroke"
          onMouseEnter={() => setHovered(dp.code)}
          onMouseLeave={() => setHovered((h) => (h === dp.code ? null : h))}>
          <title>{dp.nom}</title>
        </path>
      ))}
    </g>
  ), [deptPaths, hovered]);

  // Couche « liquide » : corps colorés, fusionnés par le filtre gooey au repos
  const bodiesLayer = useMemo(() => (
    <g className="map-bubbles" filter={interacting ? undefined : 'url(#goo)'}>
      {clusters.map((c) => {
        const r = c.r * invZ;
        const color = densityColor(c.count / maxCount);
        return <circle key={c.key} cx={c.dcx} cy={c.dcy} r={r} fill={color} fillOpacity="0.82" />;
      })}
    </g>
  ), [clusters, maxCount, invZ, interacting]);

  // Couche nette : rim + reflet + texte + zone de clic (hors filtre)
  const overlayLayer = useMemo(() => (
    <g>
      {clusters.map((c) => {
        const r = c.r * invZ;
        const color = densityColor(c.count / maxCount);
        const isSel = selected && selected.key === c.key;
        const fontSize = clamp(r * 0.7, 8 * invZ, 15 * invZ);
        return (
          <g key={c.key} transform={`translate(${c.dcx} ${c.dcy})`} className="map-bubble"
            style={{ color }} onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()} onClick={(e) => handleBubbleClick(e, c)}>
            <g className="map-bubble-inner">
              {isSel && <circle r={r + 5 * invZ} fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth={2 * invZ} />}
              <circle r={r} fill="transparent" />
              <circle r={r} fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth={1.2 * invZ} />
              <circle r={r} fill="url(#bubbleGloss)" />
              <text textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fontWeight="700" fill="#ffffff"
                style={{ pointerEvents: 'none', paintOrder: 'stroke' }} stroke="#0b0714" strokeOpacity="0.4" strokeWidth={0.8 * invZ}>
                {c.count > 999 ? '999+' : c.count}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  ), [clusters, maxCount, invZ, selected, handleBubbleClick]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl glass-card" style={{ height: 'calc(100vh - 11rem)', minHeight: 460 }}>
      {/* Barre de statut */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center gap-3 px-4 py-2 text-sm border-b border-[rgb(var(--line)/0.12)] bg-[var(--glass-bg-strong)] backdrop-blur-xl">
        <span className="font-medium text-ink truncate" title={searchSummary}>{searchSummary}</span>
        {isFetching && <span className="flex items-center gap-1.5 text-accent text-xs shrink-0"><SmallSpinner />{loadedPages}/{totalApiPages}</span>}
        {!isLoading && clusters.length > 0 && (
          <span className="ml-auto text-xs text-ink-faint shrink-0 whitespace-nowrap">
            <span className="font-semibold text-ink">{clusters.length}</span> zone{clusters.length > 1 ? 's' : ''}
            {' · '}<span className="font-semibold text-ink">{metroJobs.length.toLocaleString('fr-FR')}</span> localisée{metroJobs.length > 1 ? 's' : ''}
            {total && total > jobs.length && <span className="text-ink-faint"> / {total.toLocaleString('fr-FR')}</span>}
          </span>
        )}
      </div>

      {/* Carte SVG */}
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full touch-none select-none"
        style={{ cursor: dragRef.current ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        <defs>
          <radialGradient id="bubbleGloss" cx="34%" cy="26%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="landFill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={H}>
            <stop offset="0%" className="map-land-a" />
            <stop offset="100%" className="map-land-b" />
          </linearGradient>
          {/* Effet « goutte » (métaballes) : les corps proches se fondent avec tension de surface */}
          <filter id="goo" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooStd} result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
            <feBlend in="goo" in2="goo" />
          </filter>
        </defs>

        <g transform={`translate(${view.tx} ${view.ty}) scale(${view.z})`}
          style={animate ? { transition: 'transform 0.28s cubic-bezier(0.22,1,0.36,1)' } : undefined}>
          {landLayer}
          {bodiesLayer}
          {overlayLayer}
        </g>
      </svg>

      {/* Contrôles zoom */}
      <div className="absolute right-3 top-14 z-20 flex flex-col gap-1.5">
        <button onClick={() => zoomBy(1.6)} aria-label="Zoomer" className="glass-card glass-hover h-9 w-9 flex items-center justify-center text-ink hover:text-accent text-lg font-bold">+</button>
        <button onClick={() => zoomBy(1 / 1.6)} aria-label="Dézoomer" className="glass-card glass-hover h-9 w-9 flex items-center justify-center text-ink hover:text-accent text-lg font-bold">−</button>
        <button onClick={resetView} aria-label="Réinitialiser" className="glass-card glass-hover h-9 w-9 flex items-center justify-center text-ink hover:text-accent">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Légende densité */}
      <div className="absolute left-3 bottom-3 z-20 glass-card px-3 py-2 text-xs">
        <p className="text-ink-faint mb-1.5 font-medium">Densité d'offres</p>
        <div className="flex items-center gap-1.5">
          {['#60a5fa', '#3b82f6', '#6366f1', '#f59e0b', '#ef4444'].map((c, i) => (
            <span key={c} className="rounded-full" style={{ background: c, width: 10 + i * 1.5, height: 10 + i * 1.5 }} />
          ))}
          <span className="ml-1 text-ink-muted">faible → forte</span>
        </div>
      </div>

      {/* Encart outre-mer */}
      {overseas.length > 0 && (
        <div className="absolute right-3 bottom-3 z-20 glass-card px-3 py-2 text-xs max-w-[180px]">
          <p className="text-ink-faint mb-1.5 font-medium">Outre-mer & autres</p>
          <ul className="space-y-1">
            {overseas.slice(0, 5).map((o) => (
              <li key={o.label} className="flex items-center justify-between gap-2">
                <span className="text-ink-muted truncate">{o.label}</span>
                <span className="font-semibold text-ink tabular-nums shrink-0">{o.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected && <ClusterPopover cluster={selected} onClose={() => setSelected(null)} onViewCity={onViewCity} />}

      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--app-bg)]/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-ink-muted">Chargement des offres…</p>
          </div>
        </div>
      )}

      {!isLoading && metroJobs.length === 0 && overseas.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <p className="text-ink-muted text-sm">Aucune offre géolocalisée pour cette recherche.</p>
        </div>
      )}
    </div>
  );
};

// ── Popover d'un cluster ────────────────────────────────────────────────────
const ClusterPopover = ({ cluster, onClose, onViewCity }) => {
  const sample = cluster.jobs.slice(0, 3);
  const commune = cluster.jobs[0]?.lieuTravail?.commune;
  return (
    <div className="absolute left-1/2 top-1/2 z-30 w-72 -translate-x-1/2 -translate-y-1/2 cmd-panel p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-ink text-sm truncate">{cluster.libelle}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs bg-accent-gradient text-white px-2 py-0.5 rounded-full">{cluster.count} offre{cluster.count > 1 ? 's' : ''}</span>
          <button onClick={onClose} aria-label="Fermer" className="text-ink-faint hover:text-ink">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
      <div className="mb-3">
        {sample.map((job) => (
          <div key={job.id} className="border-t border-[rgb(var(--line)/0.12)] py-1.5">
            <p className="text-xs font-medium text-ink leading-snug line-clamp-1">{job.intitule}</p>
            {job.entreprise?.nom && <p className="text-xs text-ink-faint truncate">{job.entreprise.nom}</p>}
          </div>
        ))}
        {cluster.count > 3 && (
          <p className="text-xs text-ink-faint pt-1 border-t border-[rgb(var(--line)/0.12)]">
            + {cluster.count - 3} autre{cluster.count - 3 > 1 ? 's' : ''} offre{cluster.count - 3 > 1 ? 's' : ''}
          </p>
        )}
      </div>
      <div className="border-t border-[rgb(var(--line)/0.12)] pt-2 space-y-2">
        <button onClick={() => onViewCity(commune ? { commune, libelle: cluster.libelle } : null, null)}
          className="w-full text-left text-xs font-semibold text-accent hover:opacity-80 transition-opacity">
          Voir {cluster.count > 1 ? `les ${cluster.count} offres` : "l'offre"} à {cluster.libelle} →
        </button>
        {commune && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-ink-faint shrink-0">Élargir à</span>
            {['10', '30', '50'].map((d) => (
              <button key={d} onClick={() => onViewCity({ commune, libelle: cluster.libelle }, d)}
                className="text-xs px-2 py-0.5 rounded-full border border-[rgb(var(--line)/0.3)] hover:border-accent hover:text-accent transition-colors">{d} km</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FranceClusterMap;
