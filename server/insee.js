/**
 * Enrichissement « entreprise » via l'API Recherche d'entreprises (data.gouv.fr).
 *
 * France Travail ne fournit ni SIRET ni SIREN dans les offres — seulement un nom
 * d'entreprise et un code postal. On raccorde donc les données SIRENE/INSEE par
 * recherche plein-texte (nom + code postal) sur :
 *   https://recherche-entreprises.api.gouv.fr/search
 *
 * API publique, sans clé, plafonnée à ~7 req/s/IP → on met en cache 24 h et on
 * limite la concurrence. Le matching étant approximatif (pas d'identifiant fort),
 * chaque résultat porte un `matchConfidence` (high | medium | low) pour rester
 * honnête côté UI.
 */

const axios = require('axios');

const SEARCH_URL = 'https://recherche-entreprises.api.gouv.fr/search';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 h
const MAX_CONCURRENT = 4;                  // marge sous la limite de 7 req/s

// ── Tables de référence INSEE ────────────────────────────────────────────────

// Tranches d'effectif salarié (INSEE)
const TRANCHE_EFFECTIF = {
  NN: 'Effectif non renseigné',
  '00': '0 salarié',
  '01': '1 ou 2 salariés',
  '02': '3 à 5 salariés',
  '03': '6 à 9 salariés',
  11: '10 à 19 salariés',
  12: '20 à 49 salariés',
  21: '50 à 99 salariés',
  22: '100 à 199 salariés',
  31: '200 à 249 salariés',
  32: '250 à 499 salariés',
  41: '500 à 999 salariés',
  42: '1 000 à 1 999 salariés',
  51: '2 000 à 4 999 salariés',
  52: '5 000 à 9 999 salariés',
  53: '10 000 salariés et plus',
};

// Sections NAF (niveau 1) — 21 sections A..U
const NAF_SECTIONS = {
  A: 'Agriculture, sylviculture et pêche',
  B: 'Industries extractives',
  C: 'Industrie manufacturière',
  D: 'Production et distribution d\'électricité, de gaz',
  E: 'Production/distribution d\'eau, assainissement, déchets',
  F: 'Construction',
  G: 'Commerce, réparation d\'automobiles et de motocycles',
  H: 'Transports et entreposage',
  I: 'Hébergement et restauration',
  J: 'Information et communication',
  K: 'Activités financières et d\'assurance',
  L: 'Activités immobilières',
  M: 'Activités spécialisées, scientifiques et techniques',
  N: 'Activités de services administratifs et de soutien',
  O: 'Administration publique',
  P: 'Enseignement',
  Q: 'Santé humaine et action sociale',
  R: 'Arts, spectacles et activités récréatives',
  S: 'Autres activités de services',
  T: 'Activités des ménages en tant qu\'employeurs',
  U: 'Activités extra-territoriales',
};

// Catégories juridiques INSEE (niveau III) — sous-ensemble courant.
// Fallback lisible pour les codes non listés.
const NATURE_JURIDIQUE = {
  1000: 'Entrepreneur individuel',
  5202: 'Société en nom collectif',
  5306: 'Société en commandite simple',
  5308: 'Société en commandite par actions',
  5385: 'Société d\'exercice libéral en commandite par actions',
  5410: 'SARL nationale',
  5415: 'SARL d\'économie mixte',
  5426: 'SARL immobilière',
  5430: 'SARL de presse',
  5431: 'SARL d\'exercice libéral (SELARL)',
  5442: 'SARL d\'attribution',
  5451: 'SARL coopérative de construction',
  5453: 'SARL coopérative de consommation',
  5454: 'SARL coopérative artisanale',
  5455: 'SARL coopérative ouvrière (SCOP)',
  5458: 'SARL coopérative (agricole)',
  5459: 'SARL union de sociétés coopératives',
  5460: 'Autre SARL coopérative',
  5470: 'SARL de pharmacie',
  5485: 'SELARL',
  5498: 'SARL unipersonnelle (EURL)',
  5499: 'Société à responsabilité limitée (SARL)',
  5505: 'SA à participation ouvrière à conseil d\'administration',
  5510: 'SA nationale à conseil d\'administration',
  5515: 'SA d\'économie mixte à conseil d\'administration',
  5520: 'Fonds à conseil d\'administration',
  5522: 'SA d\'attribution à conseil d\'administration',
  5525: 'SA coopérative de construction à conseil d\'administration',
  5530: 'SA de HLM à conseil d\'administration',
  5531: 'SA coopérative de production (SCOP) à conseil d\'administration',
  5532: 'SA coopérative de consommation à conseil d\'administration',
  5542: 'SA d\'économie mixte à conseil d\'administration',
  5546: 'SA coopérative de commerçants-détaillants',
  5547: 'SA coopérative artisanale à CA',
  5548: 'SA coopérative (agricole) à CA',
  5551: 'SA union de sociétés coopératives à CA',
  5552: 'SA coopérative ouvrière (SCOP) à CA',
  5553: 'SA de crédit maritime mutuel à CA',
  5554: 'SA coopérative de banque populaire à CA',
  5555: 'Caisse d\'épargne et de prévoyance à CA',
  5558: 'SA coopérative d\'intérêt collectif (SCIC) à CA',
  5559: 'SA coopérative (autre) à CA',
  5560: 'Autre SA à conseil d\'administration',
  5585: 'SELAFA (à conseil d\'administration)',
  5599: 'SA à conseil d\'administration',
  5610: 'SA nationale à directoire',
  5620: 'Fonds à directoire',
  5630: 'SA de HLM à directoire',
  5670: 'SA coopérative de banque populaire à directoire',
  5685: 'SELAFA (à directoire)',
  5699: 'SA à directoire',
  5710: 'Société par actions simplifiée (SAS)',
  5720: 'Société par actions simplifiée unipersonnelle (SASU)',
  5785: 'Société d\'exercice libéral par actions simplifiée (SELAS)',
  5800: 'Société européenne',
  6100: 'Caisse d\'épargne et de prévoyance',
  6316: 'Coopérative d\'utilisation de matériel agricole (CUMA)',
  6317: 'Société coopérative agricole',
  6411: 'Société d\'assurance mutuelle',
  6532: 'Société civile immobilière (SCI)',
  6533: 'Société civile de moyens (SCM)',
  6534: 'Société civile immobilière de construction-vente',
  6540: 'Société civile',
  6541: 'Société civile de moyens',
  6543: 'Société civile immobilière',
  3110: 'Personne morale de droit étranger immatriculée au RCS',
  3120: 'Personne morale de droit étranger non immatriculée au RCS',
  4110: 'Établissement public national à caractère administratif',
  4120: 'Établissement public national à caractère administratif',
  4140: 'Établissement public national à caractère industriel ou commercial (EPIC)',
  4150: 'Établissement public national à caractère industriel ou commercial',
  7112: 'Autorité administrative indépendante',
  7150: 'Autre établissement public national administratif',
  7410: 'Groupement d\'intérêt public (GIP)',
  7470: 'Groupement de coopération sanitaire à gestion publique',
  8290: 'Autre organisme privé à financement public',
  7210: 'Commune',
  7220: 'Département',
  7230: 'Région',
  7312: 'Commune et commune nouvelle',
  7343: 'Communauté urbaine',
  7346: 'Communauté d\'agglomération',
  7348: 'Communauté de communes',
  7354: 'Établissement public local d\'enseignement',
  7361: 'Centre communal d\'action sociale (CCAS)',
  7379: 'Établissement public local (autre)',
  7381: 'Organisme consulaire',
  8110: 'Régime général de la Sécurité sociale',
  8210: 'Mutuelle',
  9210: 'Association non déclarée',
  9220: 'Association déclarée',
  9221: 'Association déclarée d\'insertion par l\'économique',
  9222: 'Association intermédiaire',
  9223: 'Groupement d\'employeurs',
  9224: 'Association d\'avocats à responsabilité professionnelle individuelle',
  9230: 'Association déclarée reconnue d\'utilité publique',
  9240: 'Congrégation',
  9260: 'Association de droit local (Alsace-Moselle)',
  9300: 'Fondation',
  9970: 'Groupement d\'intérêt économique (GIE)',
};

const CATEGORIE_LABELS = {
  PME: 'PME (petite ou moyenne entreprise)',
  ETI: 'ETI (entreprise de taille intermédiaire)',
  GE: 'Grande entreprise',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const stripAccents = (s) =>
  (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');

// Suffixes juridiques et bruits fréquents à retirer pour comparer les noms
const NAME_NOISE = /\b(SAS|SASU|SARL|EURL|SA|SNC|SCOP|SCIC|SCI|SELARL|SELAS|EI|EIRL|ETS|ETABLISSEMENTS?|STE|SOCIETE|GROUPE|GROUP|FRANCE|INTERNATIONAL|HOLDING|CIE|COMPAGNIE)\b/g;

const normalizeName = (s) =>
  stripAccents(s)
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(NAME_NOISE, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Évalue la confiance du raccord nom FT ↔ résultat SIRENE.
 * FT tronque parfois le nom (~40 car.) → on gère le préfixe.
 */
function matchConfidence(ftNom, result, ftCp) {
  const a = normalizeName(ftNom);
  const b = normalizeName(result.nom_complet || result.nom_raison_sociale);
  const cpOk = ftCp && result.siege?.code_postal === String(ftCp);

  if (!a || !b) return 'low';
  if (a === b) return cpOk ? 'high' : 'medium';
  // préfixe (troncature FT) ou inclusion
  if (b.startsWith(a) || a.startsWith(b) || b.includes(a) || a.includes(b)) {
    return cpOk ? 'high' : 'medium';
  }
  // chevauchement de tokens significatifs
  const ta = new Set(a.split(' ').filter((t) => t.length > 2));
  const tb = new Set(b.split(' ').filter((t) => t.length > 2));
  const common = [...ta].filter((t) => tb.has(t)).length;
  if (common >= 2 || (common >= 1 && cpOk)) return cpOk ? 'medium' : 'low';
  return 'low';
}

function labelNature(code) {
  if (code == null) return null;
  return NATURE_JURIDIQUE[code] || `Forme juridique (code ${code})`;
}

function computeAge(dateCreation) {
  if (!dateCreation) return null;
  const d = new Date(dateCreation);
  if (Number.isNaN(d.getTime())) return null;
  const years = Math.floor((Date.now() - d.getTime()) / (365.25 * 86400000));
  return years >= 0 ? years : null;
}

/**
 * Transforme un résultat brut de l'API en objet compact et labellisé.
 */
function normalizeCompany(result, { nom, codePostal } = {}) {
  if (!result) return null;
  const siege = result.siege || {};
  const naf = result.activite_principale || siege.activite_principale || null;
  const section = result.section_activite_principale || null;

  const dirigeants = (result.dirigeants || [])
    .map((d) => ({
      nom: d.type_dirigeant === 'personne morale'
        ? d.denomination
        : [d.prenoms, d.nom].filter(Boolean).join(' ').trim() || d.denomination,
      qualite: d.qualite || null,
    }))
    .filter((d) => d.nom)
    .slice(0, 4);

  const c = result.complements || {};

  return {
    found: true,
    matchConfidence: matchConfidence(nom, result, codePostal),
    siren: result.siren || null,
    siret: siege.siret || null,
    nom: result.nom_complet || result.nom_raison_sociale || null,
    raisonSociale: result.nom_raison_sociale || null,
    sigle: result.sigle || null,
    nomCommercial: siege.nom_commercial || null,
    formeJuridique: result.nature_juridique
      ? { code: result.nature_juridique, libelle: labelNature(result.nature_juridique) }
      : null,
    activite: naf
      ? { code: naf, section, sectionLibelle: section ? NAF_SECTIONS[section] || null : null }
      : null,
    effectif: result.tranche_effectif_salarie
      ? {
          code: result.tranche_effectif_salarie,
          libelle: TRANCHE_EFFECTIF[result.tranche_effectif_salarie] || null,
          annee: result.annee_tranche_effectif_salarie || null,
        }
      : null,
    categorie: result.categorie_entreprise || null,
    categorieLibelle: result.categorie_entreprise
      ? CATEGORIE_LABELS[result.categorie_entreprise] || result.categorie_entreprise
      : null,
    dateCreation: result.date_creation || null,
    ageAnnees: computeAge(result.date_creation),
    etatAdministratif: result.etat_administratif || null,
    active: result.etat_administratif === 'A',
    adresse: siege.adresse || null,
    codePostal: siege.code_postal || null,
    commune: siege.libelle_commune || null,
    departement: siege.departement || null,
    coordonnees: siege.latitude && siege.longitude
      ? { lat: parseFloat(siege.latitude), lng: parseFloat(siege.longitude) }
      : null,
    dirigeants,
    conventionsCollectives: result.complements?.liste_idcc || result.siege?.liste_idcc || [],
    nombreEtablissements: result.nombre_etablissements || null,
    nombreEtablissementsOuverts: result.nombre_etablissements_ouverts || null,
    labels: {
      ess: !!c.est_ess,
      qualiopi: !!c.est_qualiopi,
      organismeFormation: !!c.est_organisme_formation,
      rge: !!c.est_rge,
      societeMission: !!c.est_societe_mission,
      association: !!c.est_association,
      servicePublic: !!c.est_service_public,
      bio: !!c.est_bio,
    },
    lienAnnuaire: result.siren
      ? `https://annuaire-entreprises.data.gouv.fr/entreprise/${result.siren}`
      : null,
  };
}

// ── Cache mémoire + limiteur de concurrence ──────────────────────────────────

const cache = new Map(); // key -> { value, expiry }

function cacheGet(key) {
  const hit = cache.get(key);
  if (hit && hit.expiry > Date.now()) return hit.value;
  if (hit) cache.delete(key);
  return undefined;
}
function cacheSet(key, value) {
  cache.set(key, { value, expiry: Date.now() + CACHE_TTL_MS });
}

let active = 0;
const waiters = [];
function acquire() {
  if (active < MAX_CONCURRENT) { active += 1; return Promise.resolve(); }
  return new Promise((resolve) => waiters.push(resolve));
}
function release() {
  active -= 1;
  const next = waiters.shift();
  if (next) { active += 1; next(); }
}

/**
 * Recherche une entreprise par nom (+ code postal optionnel) et renvoie le
 * meilleur résultat normalisé, ou { found:false }.
 */
async function lookupCompany({ nom, codePostal } = {}) {
  const cleanNom = (nom || '').trim();
  if (cleanNom.length < 2) return { found: false, reason: 'nom manquant' };

  const cp = (codePostal || '').toString().trim().slice(0, 5);
  const key = `${normalizeName(cleanNom)}|${cp}`;
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;

  await acquire();
  try {
    // Une requête (avec repli sans code postal si le filtre CP ne donne rien)
    const runQuery = async (q) => {
      const params = { q, page: 1, per_page: 3 };
      if (cp && /^\d{5}$/.test(cp)) params.code_postal = cp;
      const { data } = await axios.get(SEARCH_URL, { params, timeout: 8000 });
      let out = data?.results || [];
      if (out.length === 0 && params.code_postal) {
        const retry = await axios.get(SEARCH_URL, { params: { q, page: 1, per_page: 3 }, timeout: 8000 });
        out = retry.data?.results || [];
      }
      return out;
    };

    let results = await runQuery(cleanNom);

    // Repli « troncature France Travail » : les noms sont coupés vers 40 caractères,
    // parfois en plein mot ("...POUR L EX") → on retire le dernier mot et on réessaie.
    if (results.length === 0 && cleanNom.length >= 28 && cleanNom.includes(' ')) {
      const shorter = cleanNom.replace(/\s+\S+$/, '').trim();
      if (shorter.length >= 4) results = await runQuery(shorter);
    }

    if (results.length === 0) {
      const miss = { found: false };
      cacheSet(key, miss);
      return miss;
    }

    // Meilleur candidat : on privilégie le code postal exact puis l'état actif
    const scored = results
      .map((r) => ({ r, conf: matchConfidence(cleanNom, r, cp) }))
      .sort((a, b) => {
        const rank = { high: 3, medium: 2, low: 1 };
        return (rank[b.conf] - rank[a.conf])
          || ((b.r.etat_administratif === 'A') - (a.r.etat_administratif === 'A'));
      });

    const best = normalizeCompany(scored[0].r, { nom: cleanNom, codePostal: cp });
    cacheSet(key, best);
    return best;
  } catch (err) {
    // Ne pas mettre en cache les erreurs réseau (transitoires)
    return { found: false, error: err.response?.status || err.code || 'network' };
  } finally {
    release();
  }
}

module.exports = {
  lookupCompany,
  normalizeCompany,
  normalizeName,
  matchConfidence,
  _refs: { TRANCHE_EFFECTIF, NAF_SECTIONS, NATURE_JURIDIQUE, CATEGORIE_LABELS },
};
