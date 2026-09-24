/**
 * Client de l'API « Statistiques sur les offres et demandes d'emploi » (SODE).
 * Scope : offresetdemandesemploi api_stats-offres-demandes-emploiv1
 * Base  : https://api.francetravail.io/partenaire/stats-offres-demandes-emploi/v1
 *
 * Endpoint & payload confirmés depuis le swagger officiel :
 *   POST /indicateur/stat-offres
 *   { codeTypeTerritoire, codeTerritoire, codeTypeActivite, codeActivite,
 *     codeTypePeriode, codeTypeNomenclature }
 *
 * On demande la périodicité TRIMESTRE sans fixer de période → l'API renvoie la
 * SÉRIE des trimestres, d'où l'évolution réelle (calculée sur la série). Passe par
 * le proxy serveur /api/marche-travail. Aucun chiffre inventé.
 */
import axios from 'axios';
import { API } from '../utils/constants';

const client = axios.create({ baseURL: API.BASE_URL, headers: { 'Content-Type': 'application/json' } });

export const getMarketConfig = async () => {
  try {
    const { data } = await client.get(API.ENDPOINTS.MARCHE_TRAVAIL_CONFIG);
    return data;
  } catch {
    return { configured: false, hasScope: false, hasBase: false };
  }
};

export const queryMarcheTravail = async (endpoint, payload = {}) => {
  const { data } = await client.post(API.ENDPOINTS.MARCHE_TRAVAIL, { endpoint, method: 'POST', payload });
  return data?.data ?? data;
};

export const MT_ENDPOINTS = {
  statOffres: '/indicateur/stat-offres',
};

/**
 * Sélection (payload) confirmée par le swagger.
 * Territoire : NAT/FR, REG/<code>, DEP/<code>. Activité : CUMUL (tout) ou ROME/<code>.
 */
export const buildSelection = ({ codeTypeTerritoire = 'NAT', codeTerritoire = 'FR', codeRome } = {}) => ({
  codeTypeTerritoire,
  codeTerritoire,
  codeTypeActivite: codeRome ? 'ROME' : 'CUMUL',
  codeActivite: codeRome || 'CUMUL',
  codeTypePeriode: 'TRIMESTRE',
  codeTypeNomenclature: 'ORIGINEOFF',
});

const pctOf = (row, codeTypeCaract, codeCaract) => {
  const c = (row.listeValeurParCaract || []).find((x) => x.codeTypeCaract === codeTypeCaract && x.codeCaract === codeCaract);
  return c ? Number(c.pourcentage) : null;
};

/**
 * Parse la réponse stat-offres en série trimestrielle triée + dernier point.
 * @returns {{ series: Array<{period,codePeriode,value,cdiPct,cadrePct}>, latest, growthPct }|null}
 */
// La réponse SODE contient plusieurs séries par période (codeNomenclature) :
// PE / PE-CUMUL12MOIS / TOFF / TOFF-CUMUL12MOIS. On garde UNE série trimestrielle
// non cumulée, sinon les séries se mélangent (courbe en dents de scie, totaux faux).
// Préférence : TOFF (toutes offres) puis PE (offres France Travail).
const NOMENCLATURE_PREFERENCE = ['TOFF', 'PE'];

const pickNomenclature = (rows) => {
  if (!rows.some((r) => r.codeNomenclature)) return rows; // autre endpoint : rien à filtrer
  for (const nom of NOMENCLATURE_PREFERENCE) {
    const sub = rows.filter((r) => r.codeNomenclature === nom);
    if (sub.length) return sub;
  }
  // repli : la 1ʳᵉ nomenclature non cumulée rencontrée
  const first = rows.find((r) => r.codeNomenclature && !/CUMUL/i.test(r.codeNomenclature));
  return first ? rows.filter((r) => r.codeNomenclature === first.codeNomenclature) : rows;
};

export const parseStatSeries = (resp) => {
  const allRows = resp?.listeValeursParPeriode || (Array.isArray(resp) ? resp : []);
  if (!allRows.length) return null;
  const rows = pickNomenclature(allRows);

  const series = rows
    .map((r) => ({
      period: r.libPeriode || r.libPeriode || r.codePeriode || '',
      codePeriode: r.codePeriode || '',
      value: Number(r.valeurPrincipaleNombre) || 0,
      cdiPct: pctOf(r, 'TYPECTR', 'CDI'),
      cadrePct: pctOf(r, 'NIVQUAL', 'CADRE'),
    }))
    .filter((r) => r.value > 0 || r.period)
    .sort((a, b) => String(a.codePeriode).localeCompare(String(b.codePeriode)));

  if (!series.length) return null;
  const latest = series[series.length - 1];
  let growthPct = null;
  if (series.length >= 2) {
    const prev = series[series.length - 2].value;
    if (prev) growthPct = ((latest.value - prev) / prev) * 100;
  }
  return { series, latest, growthPct };
};
