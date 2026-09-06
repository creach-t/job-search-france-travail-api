/**
 * Agrégation et recoupement des offres d'emploi France Travail.
 *
 * Toutes les fonctions sont PURES : elles prennent un tableau d'offres (telles que
 * renvoyées par /offres/search) et retournent des structures prêtes à afficher.
 * Aucune dépendance à React — testable isolément.
 *
 * ⚠️ Honnêteté statistique (usage journalistique) : l'API France Travail plafonne
 * à 1 150 offres récupérables par recherche. Quand le total réel dépasse ce seuil,
 * l'analyse porte sur un ÉCHANTILLON (les 1 150 offres les plus récentes), pas sur
 * la population complète. Le taux de couverture est calculé et exposé pour que ce
 * biais soit toujours affiché.
 */

import { convertToAnnualSalary } from './salaryUtils';
import { departementLabel } from './departements';

// ── Helpers génériques ───────────────────────────────────────────────────────

/** Compte les occurrences d'une clé et retourne un top trié [{label, count, pct}]. */
const topBy = (jobs, keyFn, { limit = 8, otherLabel = null } = {}) => {
  const counts = new Map();
  let assigned = 0;
  jobs.forEach((job) => {
    const key = keyFn(job);
    if (key === null || key === undefined || key === '') return;
    counts.set(key, (counts.get(key) || 0) + 1);
    assigned += 1;
  });

  const sorted = [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const total = jobs.length || 1;
  const top = sorted.slice(0, limit).map((r) => ({ ...r, pct: (r.count / total) * 100 }));

  // Regrouper le reste sous "Autres" si demandé
  if (otherLabel && sorted.length > limit) {
    const rest = sorted.slice(limit).reduce((s, r) => s + r.count, 0);
    if (rest > 0) top.push({ label: otherLabel, count: rest, pct: (rest / total) * 100, isOther: true });
  }

  return { rows: top, distinct: counts.size, assigned };
};

/** Médiane d'un tableau de nombres. */
const median = (nums) => {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
};

/** Quantile (0..1) d'un tableau de nombres. */
const quantile = (nums, q) => {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return s[base + 1] !== undefined
    ? Math.round(s[base] + rest * (s[base + 1] - s[base]))
    : s[base];
};

// ── Extracteurs de champs (défensifs) ────────────────────────────────────────

const monthlySalary = (job) => {
  const annual = convertToAnnualSalary(job.salaire);
  return annual ? Math.round(annual / 12) : null;
};

const ageInDays = (job) => {
  if (!job.dateCreation) return null;
  const d = Math.floor((Date.now() - new Date(job.dateCreation).getTime()) / 86400000);
  return Number.isFinite(d) && d >= 0 ? d : null;
};

// Temps plein / partiel à partir du libellé converti
const workTime = (job) => {
  const s = (job.dureeTravailLibelleConverti || '').toLowerCase();
  if (s.includes('partiel')) return 'Temps partiel';
  if (s.includes('plein')) return 'Temps plein';
  return null;
};

// ── Buckets de salaire mensuel brut (€) ──────────────────────────────────────

const SALARY_BUCKETS = [
  { label: '< 1 500 €', min: 0, max: 1500 },
  { label: '1 500 – 2 000 €', min: 1500, max: 2000 },
  { label: '2 000 – 2 500 €', min: 2000, max: 2500 },
  { label: '2 500 – 3 000 €', min: 2500, max: 3000 },
  { label: '3 000 – 4 000 €', min: 3000, max: 4000 },
  { label: '4 000 – 5 000 €', min: 4000, max: 5000 },
  { label: '5 000 € et +', min: 5000, max: Infinity },
];

// ── Analyse principale ───────────────────────────────────────────────────────

/**
 * @param {Array} jobs - offres analysées (échantillon récupéré)
 * @param {number|null} apiTotal - total réel annoncé par l'API (Content-Range)
 * @returns {Object} rapport complet
 */
export const analyzeJobs = (jobs = [], apiTotal = null) => {
  const analyzed = jobs.length;
  const total = apiTotal ?? analyzed;
  const coverage = total > 0 ? Math.min(1, analyzed / total) : 1;
  const isSample = total > analyzed;

  // ── Salaires ──
  const monthlyValues = jobs.map(monthlySalary).filter((v) => v !== null && v > 0);
  const withSalary = monthlyValues.length;
  const salaryHistogram = SALARY_BUCKETS.map((b) => {
    const count = monthlyValues.filter((v) => v >= b.min && v < b.max).length;
    return { label: b.label, count, pct: withSalary ? (count / withSalary) * 100 : 0 };
  });

  const salary = {
    disclosed: withSalary,
    disclosedPct: analyzed ? (withSalary / analyzed) * 100 : 0,
    median: median(monthlyValues),
    p25: quantile(monthlyValues, 0.25),
    p75: quantile(monthlyValues, 0.75),
    min: monthlyValues.length ? Math.min(...monthlyValues) : null,
    max: monthlyValues.length ? Math.max(...monthlyValues) : null,
    histogram: salaryHistogram,
  };

  // ── Ancienneté / fraîcheur ──
  const ages = jobs.map(ageInDays).filter((v) => v !== null);
  const freshness = {
    medianDays: median(ages),
    last7Days: ages.filter((d) => d <= 7).length,
    last7DaysPct: ages.length ? (ages.filter((d) => d <= 7).length / ages.length) * 100 : 0,
    last24h: ages.filter((d) => d < 1).length,
  };

  // Tendance : offres publiées par jour sur les 30 derniers jours
  const trend = buildTrend(jobs, 30);

  // ── Répartitions ──
  const contracts = topBy(jobs, (j) => j.typeContratLibelle || j.typeContrat, { limit: 8, otherLabel: 'Autres' });
  const natureContrat = topBy(jobs, (j) => j.natureContrat, { limit: 6, otherLabel: 'Autres' });
  const experience = topBy(jobs, (j) => j.experienceLibelle, { limit: 8, otherLabel: 'Autres' });
  const qualification = topBy(jobs, (j) => j.qualificationLibelle, { limit: 6 });
  const workingTime = topBy(jobs, workTime, { limit: 3 });
  const sectors = topBy(jobs, (j) => j.secteurActiviteLibelle, { limit: 10, otherLabel: 'Autres' });
  const romes = topBy(jobs, (j) => (j.romeLibelle ? `${j.romeLibelle}${j.romeCode ? ` · ${j.romeCode}` : ''}` : null), { limit: 10, otherLabel: 'Autres' });
  const appellations = topBy(jobs, (j) => j.appellationlibelle, { limit: 12, otherLabel: 'Autres' });

  // ── Géographie ──
  const departements = topBy(jobs, (j) => departementLabel(j.lieuTravail?.codePostal), { limit: 12, otherLabel: 'Autres' });
  const communes = topBy(jobs, (j) => j.lieuTravail?.libelle, { limit: 12, otherLabel: 'Autres' });

  // ── Recruteurs ──
  const namedJobs = jobs.filter((j) => j.entreprise?.nom);
  const anonymous = analyzed - namedJobs.length;
  const recruiters = topBy(jobs, (j) => j.entreprise?.nom, { limit: 15 });

  // ── Indicateurs binaires ──
  const alternanceCount = jobs.filter((j) => j.alternance === true).length;
  const totalPostes = jobs.reduce((s, j) => s + (parseInt(j.nombrePostes, 10) || 1), 0);

  // ── Recoupements (crosstabs) : salaire médian par dimension ──
  const salaryByContract = medianSalaryBy(jobs, (j) => j.typeContratLibelle || j.typeContrat);
  const salaryByExperience = medianSalaryBy(jobs, (j) => j.experienceLibelle);
  const salaryByQualification = medianSalaryBy(jobs, (j) => j.qualificationLibelle);
  const salaryByDepartement = medianSalaryBy(jobs, (j) => departementLabel(j.lieuTravail?.codePostal), 6);

  return {
    meta: { analyzed, total, coverage, isSample },
    salary,
    freshness,
    trend,
    breakdowns: {
      contracts, natureContrat, experience, qualification, workingTime,
      sectors, romes, appellations, departements, communes, recruiters,
    },
    indicators: {
      alternanceCount,
      alternancePct: analyzed ? (alternanceCount / analyzed) * 100 : 0,
      anonymous,
      anonymousPct: analyzed ? (anonymous / analyzed) * 100 : 0,
      distinctRecruiters: recruiters.distinct,
      distinctSectors: sectors.distinct,
      distinctCommunes: communes.distinct,
      totalPostes,
    },
    crosstabs: {
      salaryByContract,
      salaryByExperience,
      salaryByQualification,
      salaryByDepartement,
    },
  };
};

/** Salaire mensuel médian par valeur d'une dimension (recoupement). */
const medianSalaryBy = (jobs, keyFn, limit = 8) => {
  const groups = new Map();
  jobs.forEach((job) => {
    const key = keyFn(job);
    if (!key) return;
    const m = monthlySalary(job);
    if (m === null || m <= 0) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  });

  return [...groups.entries()]
    .map(([label, vals]) => ({ label, median: median(vals), count: vals.length }))
    .filter((r) => r.count >= 3) // seuil minimal pour une médiane crédible
    .sort((a, b) => b.median - a.median)
    .slice(0, limit);
};

/** Histogramme des publications par jour sur `days` derniers jours. */
const buildTrend = (jobs, days) => {
  const buckets = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  jobs.forEach((job) => {
    if (!job.dateCreation) return;
    const key = new Date(job.dateCreation).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1);
  });

  const rows = [...buckets.entries()].map(([date, count]) => ({ date, count }));
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0);
  return { rows, max };
};

// Exposé pour les tests / réutilisation
export const _internal = { topBy, median, quantile, medianSalaryBy, monthlySalary };
