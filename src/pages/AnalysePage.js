import React, { useMemo, useState } from 'react';
import AnalyseControls from '../components/analysis/AnalyseControls';
import {
  SectionCard, StatCard, BarList, CrossTab, SalaryHistogram, TrendChart, CoverageBanner,
} from '../components/analysis/charts';
import { useAllJobs } from '../hooks/useAllJobs';
import { analyzeJobs } from '../utils/analytics';
import { exportCsv, exportReport } from '../utils/exportData';

const fmt = (n) => (n === null || n === undefined ? '—' : n.toLocaleString('fr-FR'));
const eur = (n) => (n === null || n === undefined ? '—' : `${n.toLocaleString('fr-FR')} €`);
const pctTxt = (n) => (n === null || n === undefined ? '—' : `${Math.round(n)} %`);

// ── Export ───────────────────────────────────────────────────────────────────
const ExportBar = ({ jobs, report, searchLabel }) => (
  <div className="flex flex-wrap items-center gap-3">
    <span className="text-xs text-gray-400">Exporter&nbsp;:</span>
    <button
      onClick={() => exportCsv(jobs, searchLabel)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:border-ft-blue hover:text-ft-blue transition-colors"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      CSV ({fmt(jobs.length)} offres)
    </button>
    <button
      onClick={() => exportReport(report, searchLabel, jobs.length)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:border-ft-blue hover:text-ft-blue transition-colors"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Rapport JSON
    </button>
  </div>
);

const AnalysePage = () => {
  const [params, setParams] = useState(null);
  const [searchLabel, setSearchLabel] = useState('');

  const handleAnalyze = (p, label) => {
    setParams(p);
    setSearchLabel(label);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { allJobs, total, isLoading, isFetching, isError, loadedPages, totalApiPages } =
    useAllJobs(params, !!params);

  const report = useMemo(() => analyzeJobs(allJobs, total), [allJobs, total]);
  const b = report.breakdowns;
  const hasResults = params && !isLoading && allJobs.length > 0;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-ft-blue bg-ft-blue/10 px-1.5 py-0.5 rounded">DATA</span>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Analyse du marché de l'emploi</h1>
        </div>
        <p className="text-sm text-gray-500 max-w-3xl">
          Agrégez et recoupez les offres France Travail — salaires, contrats, géographie, secteurs, recruteurs —
          pour la recherche et le journalisme de données. Tous secteurs, tous métiers.
        </p>
      </div>

      <div className="mb-6">
        <AnalyseControls onAnalyze={handleAnalyze} isFetching={isFetching && isLoading} />
      </div>

      {/* État initial */}
      {!params && (
        <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-gray-300">
          <svg className="mx-auto h-14 w-14 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="text-gray-500">Choisissez un métier, une zone ou un type de contrat, puis lancez l'analyse.</p>
        </div>
      )}

      {/* Chargement */}
      {params && isLoading && (
        <div className="text-center py-16">
          <svg className="animate-spin h-10 w-10 text-ft-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-600">
            Agrégation des offres… {totalApiPages > 1 && <span className="text-gray-400">({loadedPages}/{totalApiPages} lots)</span>}
          </p>
        </div>
      )}

      {/* Erreur */}
      {params && isError && !isLoading && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Une erreur s'est produite lors de la récupération des offres. Réessayez ou affinez la recherche.
        </div>
      )}

      {/* Aucun résultat */}
      {params && !isLoading && !isError && allJobs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500">Aucune offre ne correspond à ces critères.</p>
        </div>
      )}

      {/* ── Résultats ─────────────────────────────────────────────────────── */}
      {hasResults && (
        <div className="space-y-5">
          {/* Barre titre + export */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate" title={searchLabel}>{searchLabel}</h2>
              {isFetching && !isLoading && (
                <svg className="animate-spin h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </div>
            <ExportBar jobs={allJobs} report={report} searchLabel={searchLabel} />
          </div>

          {/* Bandeau couverture */}
          <CoverageBanner meta={report.meta} />

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Offres (total réel)" value={fmt(report.meta.total)} hint={`${fmt(report.meta.analyzed)} analysées`} />
            <StatCard label="Salaire médian" value={eur(report.salary.median)} hint="brut / mois estimé" accent="green" />
            <StatCard label="Salaire affiché" value={pctTxt(report.salary.disclosedPct)} hint={`${fmt(report.salary.disclosed)} offres`} accent="amber" />
            <StatCard label="Postes à pourvoir" value={fmt(report.indicators.totalPostes)} hint="cumul déclaré" accent="indigo" />
            <StatCard label="Recruteurs distincts" value={fmt(report.indicators.distinctRecruiters)} hint={`${pctTxt(report.indicators.anonymousPct)} anonymes`} accent="gray" />
            <StatCard label="Offres récentes" value={pctTxt(report.freshness.last7DaysPct)} hint="publiées ≤ 7 jours" />
            <StatCard label="Alternance" value={pctTxt(report.indicators.alternancePct)} hint={`${fmt(report.indicators.alternanceCount)} offres`} accent="indigo" />
            <StatCard label="Secteurs / communes" value={`${fmt(report.indicators.distinctSectors)} / ${fmt(report.indicators.distinctCommunes)}`} hint="diversité" accent="gray" />
          </div>

          {/* Salaire : histogramme + fourchette */}
          <SectionCard
            title="Distribution des salaires"
            subtitle={`Fourchette interquartile : ${eur(report.salary.p25)} → ${eur(report.salary.p75)} · min ${eur(report.salary.min)} · max ${eur(report.salary.max)}`}
          >
            <SalaryHistogram histogram={report.salary.histogram} />
          </SectionCard>

          {/* Recoupements salaire */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="Salaire médian par type de contrat" subtitle="Recoupement salaire × contrat">
              <CrossTab rows={report.crosstabs.salaryByContract} />
            </SectionCard>
            <SectionCard title="Salaire médian par expérience" subtitle="Recoupement salaire × expérience">
              <CrossTab rows={report.crosstabs.salaryByExperience} />
            </SectionCard>
            <SectionCard title="Salaire médian par qualification" subtitle="Cadre vs non-cadre">
              <CrossTab rows={report.crosstabs.salaryByQualification} />
            </SectionCard>
            <SectionCard title="Salaire médian par département" subtitle="Top territoires (≥ 3 offres salariées)">
              <CrossTab rows={report.crosstabs.salaryByDepartement} />
            </SectionCard>
          </div>

          {/* Répartitions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="Types de contrat" subtitle={`${b.contracts.distinct} type(s)`}>
              <BarList rows={b.contracts.rows} color="blue" />
            </SectionCard>
            <SectionCard title="Nature du contrat" subtitle="Contrat, apprentissage, aidé…">
              <BarList rows={b.natureContrat.rows} color="indigo" />
            </SectionCard>
            <SectionCard title="Expérience requise">
              <BarList rows={b.experience.rows} color="indigo" />
            </SectionCard>
            <SectionCard title="Qualification">
              <BarList rows={b.qualification.rows} color="slate" />
            </SectionCard>
          </div>

          {/* Géographie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="Répartition par département" subtitle={`${b.departements.distinct} département(s)`}>
              <BarList rows={b.departements.rows} color="blue" />
            </SectionCard>
            <SectionCard title="Top communes" subtitle={`${b.communes.distinct} commune(s)`}>
              <BarList rows={b.communes.rows} color="blue" />
            </SectionCard>
          </div>

          {/* Métiers / secteurs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="Secteurs d'activité" subtitle={`${b.sectors.distinct} secteur(s)`}>
              <BarList rows={b.sectors.rows} color="green" />
            </SectionCard>
            <SectionCard title="Familles de métiers (ROME)" subtitle="Codes ROME les plus représentés">
              <BarList rows={b.romes.rows} color="indigo" />
            </SectionCard>
            <SectionCard title="Intitulés de poste (appellations)" subtitle="Appellations ROME précises">
              <BarList rows={b.appellations.rows} color="slate" />
            </SectionCard>
            <SectionCard title="Principaux recruteurs" subtitle={`${b.recruiters.distinct} employeurs nommés`}>
              <BarList rows={b.recruiters.rows} color="blue" showPct={false} />
            </SectionCard>
          </div>

          {/* Tendance temporelle */}
          <SectionCard
            title="Rythme de publication"
            subtitle={`Âge médian des offres : ${report.freshness.medianDays ?? '—'} j · ${fmt(report.freshness.last24h)} publiée(s) dans les dernières 24 h`}
          >
            <TrendChart trend={report.trend} />
          </SectionCard>

          {/* Note méthodo bas de page */}
          <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
            Source : API France Travail (offres d'emploi v2). Les salaires sont estimés en brut mensuel à partir des libellés
            (horaire/mensuel/annuel normalisés) ; toutes les offres ne renseignent pas de salaire. Le total réel est fourni par
            l'API (en-tête Content-Range) ; au-delà de 1 150 offres, l'analyse porte sur un échantillon des plus récentes.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalysePage;
