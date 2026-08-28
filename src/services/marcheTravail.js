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
    const { data } = await client.get('/marche-travail/config');
    return data;
  } catch {
    return { configured: false, hasScope: false, hasBase: false };
  }
};

export const queryMarcheTravail = async (endpoint, payload = {}) => {
  const { data } = await client.post('/marche-travail', { endpoint, method: 'POST', payload });
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
export const parseStatSeries = (resp) => {
  const rows = resp?.listeValeursParPeriode || (Array.isArray(resp) ? resp : []);
  if (!rows.length) return null;

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
