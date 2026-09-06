import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDownIcon, InformationCircleIcon, CheckCircleIcon,
} from '@heroicons/react/20/solid';
import {
  CurrencyEuroIcon, BriefcaseIcon, MapPinIcon, UsersIcon, ClockIcon, DocumentTextIcon,
  BuildingOffice2Icon, ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { BarList, CrossTab, SalaryHistogram } from '../analysis/charts';
import { Donut } from '../charts';
import { useAllJobs } from '../../hooks/useAllJobs';
import { useFullSweep } from '../../hooks/useFullSweep';
import { analyzeJobs } from '../../utils/analytics';
import { exportCsv, exportReport } from '../../utils/exportData';
import { toBulkParams } from '../../utils/searchLabel';

const fmt = (n) => (n === null || n === undefined ? '—' : n.toLocaleString('fr-FR'));
const eur = (n) => (n === null || n === undefined ? '—' : `${n.toLocaleString('fr-FR')} €`);
const pctTxt = (n) => (n === null || n === undefined ? '—' : `${Math.round(n)} %`);

// Palettes d'accent par carte / KPI (icône + valeur)
const TINTS = {
  violet: { tile: 'from-violet-500 to-purple-600', text: 'text-violet-400' },
  emerald: { tile: 'from-emerald-500 to-teal-600', text: 'text-emerald-400' },
  amber: { tile: 'from-amber-500 to-orange-600', text: 'text-amber-400' },
  cyan: { tile: 'from-cyan-500 to-sky-600', text: 'text-cyan-300' },
  indigo: { tile: 'from-indigo-500 to-blue-600', text: 'text-indigo-400' },
  rose: { tile: 'from-rose-500 to-pink-600', text: 'text-rose-400' },
};

// ── KPI coloré ───────────────────────────────────────────────────────────────
const Kpi = ({ icon: Icon, tint = 'violet', label, value, hint }) => {
  const t = TINTS[tint];
  return (
    <div className="glass-card px-3.5 py-3 min-w-0">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`icon-tile h-7 w-7 shrink-0 text-white bg-gradient-to-br ${t.tile}`}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-[11px] font-medium text-ink-faint uppercase tracking-wide truncate">{label}</p>
      </div>
      <p className={`text-xl font-extrabold tabular-nums truncate ${t.text}`}>{value}</p>
      {hint && <p className="text-[11px] text-ink-muted truncate">{hint}</p>}
    </div>
  );
};

// ── Pastille couverture (icône + info-bulle hover/touch) ─────────────────────
const CoverageBadge = ({ meta }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const exhaustive = !meta.isSample;
  const cov = Math.round(meta.coverage * 100);
  const Icon = exhaustive ? CheckCircleIcon : InformationCircleIcon;

  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0"
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold ${
          exhaustive ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
        <Icon className="h-4 w-4" />
        {exhaustive ? 'Exhaustif' : `${cov}%`}
      </button>
      {open && (
        <div className="cmd-panel cmd-pop absolute left-0 mt-2 z-30 w-64 p-3 text-xs text-ink-muted">
          {exhaustive ? (
            <p>Analyse <strong className="text-ink">exhaustive</strong> : les {fmt(meta.analyzed)} offres correspondant à la recherche sont toutes prises en compte.</p>
          ) : (
            <>
              <p><strong className="text-ink">{fmt(meta.analyzed)}</strong> offres analysées sur <strong className="text-ink">{fmt(meta.total)}</strong> ({cov}% de couverture).</p>
              <p className="mt-1.5 text-ink-faint">L'API plafonne à 1 150 offres/requête. Lance le balayage complet pour couvrir 100 %.</p>
              <div className="mt-2 h-1.5 rounded-full bg-amber-500/20 overflow-hidden"><div className="h-full rounded-full bg-amber-400" style={{ width: `${cov}%` }} /></div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── Carte dépliable (icône de dépliage en bas) ───────────────────────────────
const Card = ({ icon: Icon, tint = 'violet', title, subtitle, children, detail, className = '' }) => {
  const [open, setOpen] = useState(false);
  const t = TINTS[tint];
  return (
    <section className={`glass-card p-4 flex flex-col ${className}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`icon-tile h-8 w-8 shrink-0 text-white bg-gradient-to-br ${t.tile}`}>
          <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-ink truncate">{title}</h3>
          {subtitle && <p className="text-[11px] text-ink-faint truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-1">{children}</div>
      {detail && open && (
        <div className="mt-4 pt-4 border-t border-[rgb(var(--line)/0.12)] space-y-4 animate-fade-in">{detail}</div>
      )}
      {detail && (
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
          className="mt-3 self-center inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:opacity-80"
          title={open ? 'Réduire' : 'Plus de détails'}>
          {open ? 'Réduire' : 'Plus de détails'}
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    </section>
  );
};

// ── Barre de fourchette salariale ────────────────────────────────────────────
const SalaryRange = ({ s }) => {
  if (s.median == null) return <p className="text-xs text-ink-faint py-4 text-center">Aucun salaire exploitable.</p>;
  const lo = s.min ?? s.median, hi = s.max ?? s.median, span = hi - lo || 1;
  const pos = (v) => Math.min(100, Math.max(0, ((v - lo) / span) * 100));
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-emerald-400 tabular-nums">{eur(s.median)}</span>
        <span className="text-xs text-ink-faint">médian / mois brut</span>
      </div>
      <div className="relative mt-4 mb-1 h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,.25), rgba(34,211,238,.25))' }}>
        <div className="absolute top-0 bottom-0 rounded-full" style={{ left: `${pos(s.p25)}%`, width: `${Math.max(2, pos(s.p75) - pos(s.p25))}%`, background: 'linear-gradient(90deg, #10b981, #22D3EE)' }} />
        <div className="absolute rounded-full bg-white shadow" style={{ left: `calc(${pos(s.median)}% - 2px)`, width: 4, height: 18, top: -3 }} />
      </div>
      <div className="flex justify-between text-[10px] text-ink-faint tabular-nums">
        <span>{eur(s.min)}</span>
        <span className="text-ink-muted">P25 {eur(s.p25)} · P75 {eur(s.p75)}</span>
        <span>{eur(s.max)}</span>
      </div>
    </div>
  );
};

// ── Rythme de publication (agrégé par semaine, lisible) ──────────────────────
const WeeklyTrend = ({ rows }) => {
  const weeks = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const size = 5; // ~6 barres sur 30 jours
    const out = [];
    for (let i = 0; i < rows.length; i += size) {
      const chunk = rows.slice(i, i + size);
      const count = chunk.reduce((s, r) => s + r.count, 0);
      out.push({ count, start: chunk[0].date, end: chunk[chunk.length - 1].date });
    }
    return out;
  }, [rows]);
  const max = Math.max(...weeks.map((w) => w.count), 1);
  if (weeks.length === 0) return <p className="text-xs text-ink-faint py-6 text-center">Pas de dates exploitables</p>;
  const shortDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  return (
    <div>
      <div className="flex items-end justify-between gap-2 h-28">
        {weeks.map((w) => (
          <div key={w.start} className="flex-1 flex flex-col items-center justify-end h-full group">
            <span className="text-[10px] font-bold text-ink mb-1">{w.count}</span>
            <div className="w-full rounded-t-md transition-all" title={`${shortDate(w.start)} → ${shortDate(w.end)} : ${w.count}`}
              style={{ height: `${Math.max(4, (w.count / max) * 100)}%`, background: 'linear-gradient(to top, #6366f1, #22D3EE)' }} />
            <span className="text-[9px] text-ink-faint mt-1.5">{shortDate(w.start)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Export ──────────────────────────────────────────────────────────────────
const ExportBtns = ({ jobs, report, label }) => (
  <div className="flex items-center gap-2">
    <button onClick={() => exportCsv(jobs, label)} title="Exporter en CSV" className="glass-card glass-hover inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-ink-muted hover:text-accent">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      CSV
    </button>
    <button onClick={() => exportReport(report, label, jobs.length)} title="Exporter le rapport JSON" className="glass-card glass-hover inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-ink-muted hover:text-accent">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      JSON
    </button>
  </div>
);

const SweepBar = ({ sweep, onStart, onCancel, sampleTotal }) => {
  if (sweep.status === 'running') {
    const pctDone = sweep.total ? Math.min(100, Math.round((sweep.collected / sweep.total) * 100)) : null;
    return (
      <div className="glass-card px-3 py-2 text-xs flex items-center gap-2.5 flex-wrap">
        <span className="flex items-center gap-1.5 text-ink">
          <svg className="animate-spin h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {sweep.collected.toLocaleString('fr-FR')}{sweep.total ? ` / ${sweep.total.toLocaleString('fr-FR')}` : ''}
        </span>
        {pctDone !== null && <div className="flex-1 min-w-[80px] h-1.5 rounded-full bg-[rgb(var(--line)/0.2)] overflow-hidden"><div className="h-full rounded-full bg-accent-gradient" style={{ width: `${pctDone}%` }} /></div>}
        <button onClick={onCancel} className="font-semibold text-magenta hover:opacity-80">Annuler</button>
      </div>
    );
  }
  if (sweep.status === 'done' || sweep.status === 'cancelled') return null;
  return (
    <button onClick={onStart} className="glass-card glass-hover inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink hover:text-accent">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      Couverture 100 %{sampleTotal ? ` (~${sampleTotal.toLocaleString('fr-FR')})` : ''}
    </button>
  );
};

// ── Onglet Analyse ──────────────────────────────────────────────────────────
const AnalysisTab = ({ searchParams, label }) => {
  const bulkParams = useMemo(() => toBulkParams(searchParams), [searchParams]);
  const paramsKey = useMemo(() => JSON.stringify(bulkParams), [bulkParams]);
  const sweep = useFullSweep();
  const sweptKeyRef = useRef(null);

  useEffect(() => {
    sweep.cancel(); sweptKeyRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const { allJobs, total, isLoading, isError, loadedPages, totalApiPages } = useAllJobs(bulkParams, !!bulkParams);

  const usingSweep = sweptKeyRef.current === paramsKey && sweep.jobs.length > 0;
  const effectiveJobs = usingSweep ? sweep.jobs : allJobs;
  const effectiveTotal = usingSweep && sweep.total != null ? sweep.total : total;
  const startSweep = () => { sweptKeyRef.current = paramsKey; sweep.start(bulkParams); };

  const report = useMemo(() => analyzeJobs(effectiveJobs, effectiveTotal), [effectiveJobs, effectiveTotal]);
  const b = report.breakdowns;
  const hasResults = !isLoading && effectiveJobs.length > 0;

  const contractDonut = useMemo(() => (b?.contracts?.rows || []).slice(0, 5).map((r) => ({ label: r.label, value: r.count })), [b]);

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <svg className="animate-spin h-10 w-10 text-accent mx-auto mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        <p className="text-sm text-ink-muted">Agrégation des offres… {totalApiPages > 1 && <span className="text-ink-faint">({loadedPages}/{totalApiPages} lots)</span>}</p>
      </div>
    );
  }
  if (isError) return <div className="rounded-xl border border-magenta/30 bg-magenta/10 px-4 py-3 text-sm text-magenta">Une erreur s'est produite. Réessayez ou affinez la recherche.</div>;
  if (!hasResults) return <div className="glass-card text-center py-16"><p className="text-ink-muted">Aucune offre à analyser pour ces critères.</p></div>;

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-2.5">
        <CoverageBadge meta={report.meta} />
        {(report.meta.isSample || usingSweep) && <SweepBar sweep={sweep} onStart={startSweep} onCancel={sweep.cancel} sampleTotal={total} />}
        <div className="ml-auto"><ExportBtns jobs={effectiveJobs} report={report} label={label} /></div>
      </div>

      {/* KPIs colorés */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <Kpi icon={DocumentTextIcon} tint="violet" label="Offres" value={fmt(report.meta.total)} hint={`${fmt(report.meta.analyzed)} analysées`} />
        <Kpi icon={CurrencyEuroIcon} tint="emerald" label="Salaire médian" value={eur(report.salary.median)} hint="brut / mois" />
        <Kpi icon={CheckCircleIcon} tint="amber" label="Salaire affiché" value={pctTxt(report.salary.disclosedPct)} hint={`${fmt(report.salary.disclosed)} off.`} />
        <Kpi icon={BriefcaseIcon} tint="indigo" label="Postes" value={fmt(report.indicators.totalPostes)} hint="à pourvoir" />
        <Kpi icon={UsersIcon} tint="rose" label="Recruteurs" value={fmt(report.indicators.distinctRecruiters)} hint={`${pctTxt(report.indicators.anonymousPct)} anon.`} />
        <Kpi icon={ClockIcon} tint="cyan" label="≤ 7 jours" value={pctTxt(report.freshness.last7DaysPct)} hint={`${fmt(report.freshness.last24h)} en 24 h`} />
      </div>

      {/* Grille bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card icon={CurrencyEuroIcon} tint="emerald" title="Salaires" subtitle={`${fmt(report.salary.disclosed)} offres avec salaire`}
          className="md:col-span-2 xl:col-span-1"
          detail={<>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Distribution</p><SalaryHistogram histogram={report.salary.histogram} /></div>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Médian par contrat</p><CrossTab rows={report.crosstabs.salaryByContract} /></div>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Médian par expérience</p><CrossTab rows={report.crosstabs.salaryByExperience} /></div>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Médian par département</p><CrossTab rows={report.crosstabs.salaryByDepartement} /></div>
          </>}>
          <SalaryRange s={report.salary} />
        </Card>

        <Card icon={BriefcaseIcon} tint="violet" title="Contrats & profil" subtitle={`${b.contracts.distinct} type(s)`}
          detail={<>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Nature du contrat</p><BarList rows={b.natureContrat.rows} /></div>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Expérience requise</p><BarList rows={b.experience.rows} /></div>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Qualification</p><BarList rows={b.qualification.rows} /></div>
          </>}>
          {contractDonut.length > 0
            ? <Donut data={contractDonut} size={150} thickness={20} centerLabel="offres" centerValue={fmt(report.meta.analyzed)} />
            : <p className="text-xs text-ink-faint py-6 text-center">Aucune donnée de contrat</p>}
        </Card>

        <Card icon={MapPinIcon} tint="cyan" title="Géographie" subtitle={`${b.departements.distinct} département(s)`}
          detail={<>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Tous les départements</p><BarList rows={b.departements.rows} /></div>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Top communes</p><BarList rows={b.communes.rows} /></div>
          </>}>
          <BarList rows={b.departements.rows.slice(0, 5)} />
        </Card>

        <Card icon={BuildingOffice2Icon} tint="indigo" title="Métiers & secteurs" subtitle="Familles ROME les plus représentées"
          detail={<>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Intitulés de poste (appellations)</p><BarList rows={b.appellations.rows} /></div>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Secteurs d'activité</p><BarList rows={b.sectors.rows} /></div>
            <div><p className="text-xs font-semibold text-ink-muted mb-2">Principaux recruteurs</p><BarList rows={b.recruiters.rows} showPct={false} /></div>
          </>}>
          <BarList rows={b.romes.rows.slice(0, 5)} />
        </Card>

        <Card icon={ArrowTrendingUpIcon} tint="cyan" title="Rythme de publication"
          subtitle={`Âge médian ${report.freshness.medianDays ?? '—'} j · ${fmt(report.freshness.last24h)} en 24 h`}
          className="md:col-span-2 xl:col-span-1">
          <WeeklyTrend rows={report.trend?.rows} />
        </Card>
      </div>

      <p className="text-xs text-ink-faint leading-relaxed border-t border-[rgb(var(--line)/0.12)] pt-4">
        Source : API France Travail (offres d'emploi v2). Salaires estimés en brut mensuel à partir des libellés ;
        total réel via l'en-tête Content-Range. Au-delà de 1 150 offres, l'analyse porte sur un échantillon des plus récentes.
      </p>
    </div>
  );
};

export default AnalysisTab;
