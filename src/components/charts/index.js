/**
 * Graphes SVG lumineux, sans dépendance externe. Theme-aware (clair/sombre).
 * Règles dataviz : identité jamais par la couleur seule (légende + libellés),
 * texte en tokens neutres, séries uniques en une teinte.
 */
import React, { useId } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { categoricalColors, OTHER_COLOR, ACCENTS } from './palette';

const fmt = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString('fr-FR'));

// ── Donut catégoriel ─────────────────────────────────────────────────────────
export const Donut = ({ data = [], size = 176, thickness = 22, centerLabel, centerValue }) => {
  const { isDark } = useTheme();
  const colors = categoricalColors(isDark);
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const gap = total > 0 ? Math.min(0.02 * c, 3) : 0; // petit espace entre segments

  let offset = 0;
  const segments = data.map((d, i) => {
    const frac = total > 0 ? d.value / total : 0;
    const len = Math.max(0, frac * c - gap);
    const seg = {
      color: d.isOther ? (isDark ? OTHER_COLOR.dark : OTHER_COLOR.light) : (d.color || colors[i % colors.length]),
      dash: `${len} ${c - len}`,
      offset: -offset,
      pct: total > 0 ? (d.value / total) * 100 : 0,
      ...d,
    };
    offset += frac * c;
    return seg;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Répartition par catégorie">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line) / 0.12)" strokeWidth={thickness} />
            {segments.map((s, i) => (
              <circle
                key={i}
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={s.color} strokeWidth={thickness}
                strokeDasharray={s.dash} strokeDashoffset={s.offset} strokeLinecap="butt"
              >
                <title>{`${s.label} : ${fmt(s.value)} (${Math.round(s.pct)} %)`}</title>
              </circle>
            ))}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold text-ink">{centerValue ?? fmt(total)}</span>
          {centerLabel && <span className="text-[11px] text-ink-faint">{centerLabel}</span>}
        </div>
      </div>

      {/* Légende (identité = pastille + texte, jamais couleur seule) */}
      <ul className="flex-1 w-full space-y-1.5 min-w-0">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: s.color }} aria-hidden="true" />
            <span className="flex-1 truncate text-ink-muted" title={s.label}>{s.label}</span>
            <span className="tabular-nums text-ink font-semibold">{Math.round(s.pct)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── Sparkline (série unique, KPI) ────────────────────────────────────────────
export const Sparkline = ({ values = [], width = 120, height = 36, color = ACCENTS.violet }) => {
  const gid = useId();
  if (!values.length) return <svg width={width} height={height} aria-hidden="true" />;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : width;
  const pts = values.map((v, i) => [i * step, height - ((v - min) / span) * (height - 4) - 2]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={`sl-s-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={ACCENTS.violet} />
          <stop offset="100%" stopColor={ACCENTS.cyan} />
        </linearGradient>
        <linearGradient id={`sl-a-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sl-a-${gid})`} />
      <path d={line} fill="none" stroke={`url(#sl-s-${gid})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
    </svg>
  );
};

// ── MiniArea (série unique avec axe, ex. courbe de fraîcheur) ─────────────────
export const MiniArea = ({ points = [], height = 150 }) => {
  const gid = useId();
  if (points.length < 2) return <div className="text-sm text-ink-faint py-8 text-center">Données indisponibles</div>;
  const width = 480;
  const max = Math.max(...points.map((p) => p.value), 1);
  const step = width / (points.length - 1);
  const xy = points.map((p, i) => [i * step, height - (p.value / max) * (height - 24) - 8]);
  const line = xy.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + 22}`} className="w-full min-w-[320px]" role="img" aria-label="Courbe">
        <defs>
          <linearGradient id={`ma-s-${gid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={ACCENTS.violet} />
            <stop offset="60%" stopColor={ACCENTS.electric} />
            <stop offset="100%" stopColor={ACCENTS.cyan} />
          </linearGradient>
          <linearGradient id={`ma-a-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENTS.violet} stopOpacity="0.35" />
            <stop offset="100%" stopColor={ACCENTS.violet} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#ma-a-${gid})`} />
        <path d={line} fill="none" stroke={`url(#ma-s-${gid})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 6px ${ACCENTS.violet}90)` }} />
        {xy.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="3.5" fill={ACCENTS.cyan} style={{ filter: `drop-shadow(0 0 5px ${ACCENTS.cyan})` }}>
              <title>{`${points[i].label} : ${fmt(points[i].value)}`}</title>
            </circle>
            <text x={p[0]} y={height + 16} textAnchor="middle" className="fill-[rgb(var(--ink-faint))]" fontSize="11">
              {points[i].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// ── RankBars (magnitude, série unique) ───────────────────────────────────────
export const RankBars = ({ rows = [], showValue = true, emptyLabel = 'Aucune donnée', numbered = false }) => {
  if (!rows.length) return <p className="text-sm text-ink-faint py-6 text-center">{emptyLabel}</p>;
  const max = Math.max(...rows.map((r) => r.value || 0), 1);

  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={`${r.label}-${i}`} className="flex items-center gap-3">
          {numbered && (
            <span className="shrink-0 w-5 text-center text-xs font-bold text-ink-faint tabular-nums">{i + 1}</span>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-sm text-ink-muted truncate" title={r.label}>{r.label}</span>
              {showValue && <span className="text-sm font-semibold text-ink tabular-nums shrink-0">{fmt(r.value)}</span>}
            </div>
            <div className="h-2 rounded-full bg-[rgb(var(--line)/0.15)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(3, ((r.value || 0) / max) * 100)}%`,
                  background: `linear-gradient(90deg, ${ACCENTS.violet}, ${ACCENTS.cyan})`,
                  boxShadow: `0 0 10px -2px ${ACCENTS.violet}`,
                }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export const chartFmt = fmt;
