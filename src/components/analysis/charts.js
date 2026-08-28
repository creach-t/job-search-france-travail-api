/**
 * Primitives visuelles de l'analyse — présentationnelles, sans état.
 * Theme-aware (tokens ink/glass) pour cohérence avec le reste de l'app.
 */
import React from 'react';

const fmt = (n) => (n === null || n === undefined ? '—' : n.toLocaleString('fr-FR'));
const pct = (n) => (n === null || n === undefined ? '—' : `${Math.round(n)} %`);

const BAR = 'linear-gradient(90deg, #8B5CF6, #22D3EE)';

// ── Carte de section ─────────────────────────────────────────────────────────
export const SectionCard = ({ title, subtitle, right, children, className = '' }) => (
  <section className={`glass-card p-5 ${className}`}>
    {(title || right) && (
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          {title && <h3 className="text-sm font-bold text-ink">{title}</h3>}
          {subtitle && <p className="text-xs text-ink-faint mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

// ── Indicateur clé (KPI) ─────────────────────────────────────────────────────
export const StatCard = ({ label, value, hint }) => (
  <div className="glass-card p-4">
    <p className="text-xs font-medium text-ink-faint uppercase tracking-wide">{label}</p>
    <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">{value}</p>
    {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
  </div>
);

// ── Liste de barres horizontales (répartition) ───────────────────────────────
export const BarList = ({ rows, max, valueKey = 'count', showPct = true, emptyLabel = 'Aucune donnée' }) => {
  if (!rows || rows.length === 0) {
    return <p className="text-xs text-ink-faint py-4 text-center">{emptyLabel}</p>;
  }
  const localMax = max ?? Math.max(...rows.map((r) => r[valueKey]), 1);

  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={`${r.label}-${i}`}>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className={`text-xs truncate ${r.isOther ? 'text-ink-faint italic' : 'text-ink-muted'}`} title={r.label}>
              {r.label}
            </span>
            <span className="text-xs font-semibold text-ink shrink-0 tabular-nums">
              {fmt(r[valueKey])}
              {showPct && r.pct !== undefined && <span className="text-ink-faint font-normal"> · {pct(r.pct)}</span>}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[rgb(var(--line)/0.15)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max(2, (r[valueKey] / localMax) * 100)}%`, background: r.isOther ? 'rgb(var(--ink-faint))' : BAR }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

// ── Recoupement : salaire médian par dimension ───────────────────────────────
export const CrossTab = ({ rows, unit = '€/mois', emptyLabel = 'Pas assez de données salariales' }) => {
  if (!rows || rows.length === 0) {
    return <p className="text-xs text-ink-faint py-4 text-center">{emptyLabel}</p>;
  }
  const max = Math.max(...rows.map((r) => r.median), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={`${r.label}-${i}`}>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-xs text-ink-muted truncate" title={r.label}>{r.label}</span>
            <span className="text-xs font-bold text-emerald-400 shrink-0 tabular-nums">
              {fmt(r.median)} {unit}
              <span className="text-ink-faint font-normal"> · {r.count} off.</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-[rgb(var(--line)/0.15)] overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.max(3, (r.median / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

// ── Histogramme de salaire (colonnes verticales) ─────────────────────────────
export const SalaryHistogram = ({ histogram }) => {
  const max = Math.max(...histogram.map((b) => b.count), 1);
  const hasData = histogram.some((b) => b.count > 0);
  if (!hasData) return <p className="text-xs text-ink-faint py-6 text-center">Aucun salaire exploitable</p>;

  return (
    <div className="flex items-end justify-between gap-1.5 h-40 pt-2">
      {histogram.map((b, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
          <span className="text-[10px] font-semibold text-ink-muted mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {b.count}
          </span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{ height: `${(b.count / max) * 100}%`, minHeight: b.count > 0 ? '3px' : '0', background: 'linear-gradient(to top, #8B5CF6, #22D3EE)' }}
            title={`${b.label} : ${b.count} offre${b.count > 1 ? 's' : ''}`}
          />
          <span className="text-[9px] text-ink-faint mt-1.5 text-center leading-tight h-6">{b.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Tendance : mini-graphe des publications par jour ─────────────────────────
export const TrendChart = ({ trend }) => {
  const { rows, max } = trend;
  if (!rows || rows.length === 0 || max === 0) {
    return <p className="text-xs text-ink-faint py-6 text-center">Pas de dates de publication exploitables</p>;
  }
  return (
    <div>
      <div className="flex items-end gap-[3px] h-28">
        {rows.map((r) => {
          const d = new Date(r.date);
          return (
            <div
              key={r.date}
              className="flex-1 rounded-t transition-colors"
              style={{ height: `${Math.max(2, (r.count / max) * 100)}%`, background: 'linear-gradient(to top, #8B5CF6, #22D3EE)' }}
              title={`${d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} : ${r.count} offre${r.count > 1 ? 's' : ''}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-ink-faint">
        <span>{new Date(rows[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
        <span>Publications / jour (30 j)</span>
        <span>{new Date(rows[rows.length - 1].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  );
};

// ── Bandeau de couverture (honnêteté statistique) ────────────────────────────
export const CoverageBanner = ({ meta }) => {
  const coveragePct = Math.round(meta.coverage * 100);
  if (!meta.isSample) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Analyse <strong>exhaustive</strong> : les {fmt(meta.analyzed)} offres correspondant à la recherche sont toutes prises en compte.
        </span>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <div className="flex items-start gap-2">
        <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p>
            Échantillon : <strong>{fmt(meta.analyzed)}</strong> offres analysées sur <strong>{fmt(meta.total)}</strong> annoncées
            par l'API (<strong>{coveragePct} %</strong> de couverture).
          </p>
          <p className="text-xs text-amber-300/80 mt-1">
            Le plafond API est de 1 150 offres/requête. Lance le balayage complet pour couvrir 100 %.
          </p>
          <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-amber-500/20 overflow-hidden">
            <div className="h-full rounded-full bg-amber-400" style={{ width: `${coveragePct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const helpers = { fmt, pct };
