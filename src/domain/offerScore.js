/**
 * Score de complétude d'une offre (Offer) : plus une offre porte d'informations
 * utiles au candidat, plus son score est élevé → elle est mise en avant.
 *
 * Pur, sans dépendance → testable et réutilisable (tri des résultats).
 * Les poids reflètent l'importance perçue côté candidat (salaire et description
 * pèsent le plus). Robuste aux champs absents, quelle que soit la source.
 */
const len = (s) => (typeof s === 'string' ? s.trim().length : 0);
const arr = (a) => (Array.isArray(a) ? a.length : 0);

export const offerScore = (o) => {
  if (!o || typeof o !== 'object') return 0;
  let s = 0;

  // Salaire renseigné — signal fort
  if (o.salaire && (o.salaire.libelle || o.salaire.commentaire)) s += 3;

  // Description (profondeur)
  const d = len(o.description);
  if (d >= 400) s += 2;
  else if (d >= 100) s += 1;
  else if (d > 0) s += 0.5;

  // Entreprise
  if (len(o.entreprise?.nom)) s += 1;
  if (o.entreprise?.logo || len(o.entreprise?.description) || o.entreprise?.url) s += 1;

  // Localisation (précision)
  if (len(o.lieuTravail?.libelle)) s += 0.5;
  if (len(o.lieuTravail?.codePostal)) s += 0.5;
  if (o.lieuTravail?.latitude != null && o.lieuTravail?.longitude != null) s += 0.5;

  // Contrat / conditions
  if (len(o.typeContratLibelle)) s += 1;
  if (len(o.experienceLibelle)) s += 0.5;
  if (len(o.qualificationLibelle)) s += 0.5;
  if (len(o.dureeTravailLibelleConverti)) s += 0.5;
  if (len(o.secteurActiviteLibelle)) s += 0.5;

  // Profil détaillé (surtout offres France Travail)
  if (arr(o.competences)) s += 1;
  if (arr(o.formations)) s += 0.5;
  if (arr(o.qualitesProfessionnelles)) s += 0.5;

  // Candidature actionnable
  if (o.contact && (o.contact.urlPostulation || o.contact.courriel || o.contact.telephone)) s += 1;

  // Métier référencé (ROME / appellation)
  if (len(o.romeCode) || len(o.appellationlibelle)) s += 0.5;

  return s;
};
