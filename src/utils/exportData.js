/**
 * Export des données d'analyse pour usage recherche / journalisme.
 * - CSV : une ligne par offre (données brutes aplaties), ouvrable dans Excel/LibreOffice.
 * - JSON : rapport d'agrégats + note méthodologique (couverture, biais d'échantillon).
 *
 * Les téléchargements sont générés côté client (Blob) et déclenchés par l'utilisateur.
 */

import { formatSalaryToMonthly, convertToAnnualSalary } from './salaryUtils';
import { departementLabel } from './departements';

const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const s = String(value).replace(/\r?\n/g, ' ').trim();
  return /[",;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const CSV_COLUMNS = [
  { header: 'id', get: (j) => j.id },
  { header: 'intitule', get: (j) => j.intitule },
  { header: 'entreprise', get: (j) => j.entreprise?.nom || '' },
  { header: 'commune', get: (j) => j.lieuTravail?.libelle || '' },
  { header: 'code_postal', get: (j) => j.lieuTravail?.codePostal || '' },
  { header: 'departement', get: (j) => departementLabel(j.lieuTravail?.codePostal) },
  { header: 'latitude', get: (j) => j.lieuTravail?.latitude ?? '' },
  { header: 'longitude', get: (j) => j.lieuTravail?.longitude ?? '' },
  { header: 'type_contrat', get: (j) => j.typeContratLibelle || j.typeContrat || '' },
  { header: 'nature_contrat', get: (j) => j.natureContrat || '' },
  { header: 'experience', get: (j) => j.experienceLibelle || '' },
  { header: 'qualification', get: (j) => j.qualificationLibelle || '' },
  { header: 'temps_travail', get: (j) => j.dureeTravailLibelleConverti || j.dureeTravailLibelle || '' },
  { header: 'rome_code', get: (j) => j.romeCode || '' },
  { header: 'rome_libelle', get: (j) => j.romeLibelle || '' },
  { header: 'appellation', get: (j) => j.appellationlibelle || '' },
  { header: 'secteur', get: (j) => j.secteurActiviteLibelle || '' },
  { header: 'alternance', get: (j) => (j.alternance ? 'oui' : 'non') },
  { header: 'nb_postes', get: (j) => j.nombrePostes ?? '' },
  { header: 'salaire_brut', get: (j) => j.salaire?.libelle || '' },
  { header: 'salaire_mensuel_estime', get: (j) => {
    const s = formatSalaryToMonthly(j.salaire);
    return s === 'Salaire non précisé' ? '' : s.replace(/\s?€.*/, '').replace(/\s/g, '');
  } },
  { header: 'salaire_annuel_estime', get: (j) => convertToAnnualSalary(j.salaire) ?? '' },
  { header: 'date_creation', get: (j) => j.dateCreation || '' },
  { header: 'date_actualisation', get: (j) => j.dateActualisation || '' },
];

/** Construit le contenu CSV (avec BOM UTF-8 pour Excel). */
export const jobsToCsv = (jobs) => {
  const header = CSV_COLUMNS.map((c) => c.header).join(';');
  const lines = jobs.map((j) => CSV_COLUMNS.map((c) => escapeCsv(c.get(j))).join(';'));
  return '﻿' + [header, ...lines].join('\r\n'); // BOM UTF-8 pour Excel
};

/** Rapport JSON : contexte, méthodologie, et agrégats calculés. */
export const buildReport = (report, searchLabel) => ({
  source: 'API France Travail (offres d\'emploi v2) — via DevJobs Analyse',
  genere_le: new Date().toISOString(),
  recherche: searchLabel,
  methodologie: {
    offres_analysees: report.meta.analyzed,
    total_annonce_api: report.meta.total,
    taux_couverture: Math.round(report.meta.coverage * 1000) / 10 + ' %',
    echantillon: report.meta.isSample,
    avertissement: report.meta.isSample
      ? "L'API France Travail plafonne à 1 150 offres par recherche. Cette analyse porte sur un échantillon des offres les plus récentes, non sur la population complète. Affinez la recherche (métier, zone, contrat) pour couvrir 100 % des résultats."
      : "Analyse portant sur l'intégralité des offres correspondant à la recherche.",
  },
  agregats: report,
});

/** Déclenche un téléchargement navigateur d'un texte. */
export const downloadText = (content, filename, mime = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const slug = (s) =>
  (s || 'analyse')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'analyse';

export const exportCsv = (jobs, searchLabel) =>
  downloadText(jobsToCsv(jobs), `ft-offres-${slug(searchLabel)}-${Date.now()}.csv`, 'text/csv;charset=utf-8');

export const exportReport = (report, searchLabel) =>
  downloadText(
    JSON.stringify(buildReport(report, searchLabel), null, 2),
    `ft-rapport-${slug(searchLabel)}-${Date.now()}.json`,
    'application/json;charset=utf-8'
  );
