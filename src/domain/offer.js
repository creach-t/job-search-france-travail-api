/**
 * Modèle d'offre CANONIQUE de l'application.
 *
 * Toute l'UI (JobCard, JobDetailsPage, carte), l'analyse (utils/analytics.js) et
 * l'export consomment cette forme — jamais la forme brute d'une API externe.
 * Pour brancher une nouvelle source d'offres (Adzuna, APEC, EURES…), il suffit
 * d'écrire un adaptateur `(offre brute) -> Offer` dans `domain/adapters/` et de
 * l'enregistrer (voir `domain/adapters/index.js`). Aucun composant à toucher.
 *
 * Historiquement, cette forme est celle de l'API France Travail (offres v2) : on
 * la conserve comme contrat pour éviter une réécriture, et les autres sources
 * s'y conforment via leur adaptateur.
 *
 * @typedef {Object} OfferLocation
 * @property {string} [libelle]     - Libellé lisible (« 69 - LYON »)
 * @property {string} [commune]     - Nom de la commune
 * @property {string} [codePostal]  - Code postal (5 chiffres)
 * @property {number} [latitude]
 * @property {number} [longitude]
 *
 * @typedef {Object} OfferCompany
 * @property {string} [nom]
 * @property {string} [description]
 * @property {string} [logo]
 * @property {string} [url]
 *
 * @typedef {Object} OfferSalary
 * @property {string} [libelle]     - Ex: « Mensuel de 2500 Euros sur 12 mois » (parsé par salaryUtils)
 * @property {string} [commentaire]
 *
 * @typedef {Object} Offer
 * @property {string}  id                          - Identifiant unique (préfixé par la source si besoin)
 * @property {string}  source                      - Clé de la source (voir SOURCES)
 * @property {string}  [intitule]                  - Titre du poste
 * @property {string}  [description]
 * @property {OfferCompany}  [entreprise]
 * @property {OfferLocation} [lieuTravail]
 * @property {string}  [typeContratLibelle]        - Libellé du contrat (CDI, CDD…)
 * @property {string}  [natureContrat]
 * @property {string}  [experienceLibelle]
 * @property {string}  [qualificationLibelle]
 * @property {string}  [dureeTravailLibelleConverti] - « Temps plein » / « Temps partiel »
 * @property {string}  [romeCode]
 * @property {string}  [romeLibelle]
 * @property {string}  [appellationlibelle]
 * @property {string}  [secteurActiviteLibelle]
 * @property {boolean} [alternance]
 * @property {number|string} [nombrePostes]
 * @property {OfferSalary} [salaire]
 * @property {string}  [dateCreation]              - ISO 8601
 * @property {Object}  [contact]                   - urlPostulation, courriel, telephone, nom, commentaire…
 * @property {Object}  [raw]                       - (optionnel) charge brute de la source, pour les détails spécifiques
 */

/** Sources d'offres connues. Ajouter une clé ici en branchant une nouvelle API. */
export const SOURCES = {
  FRANCE_TRAVAIL: 'france-travail',
};

/**
 * Métadonnées d'affichage par source (badge de provenance).
 * `color` référence une entrée de la palette de SourceBadge.
 */
export const SOURCE_META = {
  [SOURCES.FRANCE_TRAVAIL]: {
    key: SOURCES.FRANCE_TRAVAIL,
    label: 'France Travail',
    short: 'FT',
    color: 'blue',
  },
};

/** Métadonnées d'une source, avec repli lisible si la source est inconnue. */
export const getSourceMeta = (source) =>
  SOURCE_META[source] || { key: source || 'inconnu', label: source || 'Source inconnue', short: '?', color: 'slate' };

/** Nombre de sources d'offres actuellement enregistrées (pour l'UI multi-sources). */
export const KNOWN_SOURCE_COUNT = Object.keys(SOURCE_META).length;
