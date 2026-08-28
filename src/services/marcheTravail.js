/**
 * Client de l'API « Marché du travail » (statistiques, tendances, tension).
 * Passe par le proxy serveur /api/marche-travail (scope + base configurés côté serveur).
 *
 * ⚠️ Les endpoints et la forme des payloads/réponses ci-dessous sont des VALEURS PAR
 * DÉFAUT à confirmer avec la « Documentation métier » (swagger) affichée sur la fiche
 * du produit dans francetravail.io. Tout est centralisé ici : un seul endroit à ajuster.
 * Tant que ce n'est pas confirmé/branché, le dashboard n'affiche AUCUN chiffre inventé —
 * il indique simplement « source à connecter ».
 */
import axios from 'axios';
import { API } from '../utils/constants';

const client = axios.create({ baseURL: API.BASE_URL, headers: { 'Content-Type': 'application/json' } });

/** Indique si le serveur a bien scope + base configurés. */
export const getMarketConfig = async () => {
  try {
    const { data } = await client.get('/marche-travail/config');
    return data; // { configured, hasScope, hasBase }
  } catch {
    return { configured: false, hasScope: false, hasBase: false };
  }
};

/** Appel générique du proxy. */
export const queryMarcheTravail = async (endpoint, payload = {}, method = 'POST') => {
  const { data } = await client.post('/marche-travail', { endpoint, method, payload });
  return data; // { data, total }
};

// ── Config des requêtes (À CONFIRMER via swagger portail) ─────────────────────
// Codes de territoire France Travail : 'NAT' (national), 'REG', 'DEP', 'BAS' (bassin).
export const MT = {
  // Base de payload commune : territoire + activité (métier ROME) éventuel
  baseSelection: ({ codeTypeTerritoire = 'NAT', codeTerritoire = 'FR', codeRome } = {}) => ({
    codeTypeTerritoire,
    codeTerritoire,
    ...(codeRome ? { codeTypeActivite: 'ROME', codeActivite: codeRome } : {}),
  }),

  // Endpoints (chemins relatifs à FT_STATS_BASE) — à ajuster selon le swagger.
  endpoints: {
    offresEnregistrees: '/offre-enregistree/stat',
    dynamiqueEmploi: '/dynamique-emploi/stat',
    difficultesRecrutement: '/difficulte-recrutement/stat',
    salairesProposes: '/salaire/stat',
  },
};

// ── Normaliseurs défensifs (tolèrent plusieurs formes de réponse) ─────────────

const asArray = (d) => (Array.isArray(d) ? d : Array.isArray(d?.listeValeursParPeriode) ? d.listeValeursParPeriode : Array.isArray(d?.resultats) ? d.resultats : []);

/** Extrait une série temporelle [{period, value}] d'une réponse. */
export const normalizeSeries = (resp) => {
  const rows = asArray(resp?.data ?? resp);
  return rows
    .map((r) => ({
      period: r.periode ?? r.date ?? r.trimestre ?? r.libellePeriode ?? '',
      value: Number(r.valeur ?? r.nombre ?? r.value ?? r.effectif ?? 0),
    }))
    .filter((r) => r.period !== '' && Number.isFinite(r.value));
};

/** Extrait une valeur scalaire (dernier point ou champ direct). */
export const normalizeScalar = (resp) => {
  const rows = asArray(resp?.data ?? resp);
  if (rows.length) {
    const last = rows[rows.length - 1];
    return Number(last.valeur ?? last.nombre ?? last.value ?? 0);
  }
  const d = resp?.data ?? resp;
  const v = d?.valeur ?? d?.indicateur ?? d?.value;
  return v != null ? Number(v) : null;
};

/** Croissance % entre les 2 derniers points d'une série. */
export const growthFromSeries = (series) => {
  if (series.length < 2) return null;
  const prev = series[series.length - 2].value;
  const last = series[series.length - 1].value;
  if (!prev) return null;
  return ((last - prev) / prev) * 100;
};
