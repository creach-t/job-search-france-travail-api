# `domain/` — Modèle d'offre canonique & sources multiples

Cette couche isole le reste de l'application des formats propres à chaque API
d'offres d'emploi. **Tout le front (cartes, détails, carte, analyse, export) ne
consomme que le modèle `Offer`** décrit dans [`offer.js`](./offer.js) — jamais la
forme brute d'une API.

## Ajouter une nouvelle source d'offres (ex. Adzuna, APEC, EURES)

1. **Écrire l'adaptateur** — `domain/adapters/adzuna.js` :

   ```js
   import { SOURCES } from '../offer';

   export const fromAdzuna = (raw) => ({
     id: `adzuna:${raw.id}`,
     source: SOURCES.ADZUNA,
     intitule: raw.title,
     description: raw.description,
     entreprise: { nom: raw.company?.display_name },
     lieuTravail: {
       libelle: raw.location?.display_name,
       latitude: raw.latitude,
       longitude: raw.longitude,
     },
     typeContratLibelle: raw.contract_type,
     salaire: raw.salary_min ? { libelle: `Annuel de ${raw.salary_min} Euros` } : undefined,
     dateCreation: raw.created,
     raw, // charge brute conservée pour les détails spécifiques
   });
   ```

2. **Déclarer la source** dans [`offer.js`](./offer.js) : ajouter la clé à
   `SOURCES` et une entrée `SOURCE_META` (label + couleur du badge).

3. **Enregistrer l'adaptateur** dans [`adapters/index.js`](./adapters/index.js)
   (dans `ADAPTERS`, ou via `registerAdapter(SOURCES.ADZUNA, { one: fromAdzuna })`).

4. **Brancher le service** : côté client, `normalizeOffers(data, SOURCES.ADZUNA)`
   au retour de l'API ; côté serveur, ajouter la route proxy correspondante.

5. **Fusionner** les listes de plusieurs sources et dédupliquer par `id` (les ids
   sont préfixés par la source) avant de passer à l'analyse ou à l'affichage.

Aucun composant d'UI ni `utils/analytics.js` n'a besoin d'être modifié : ils
travaillent sur `Offer[]`, quelle qu'en soit la provenance. Le `SourceBadge`
affiche automatiquement la provenance dès qu'il existe plus d'une source.

## Enrichissement (INSEE/SIRENE, et au-delà)

L'enrichissement « entreprise » suit le même esprit : le serveur raccorde les
données publiques (voir `server/insee.js`) et le front les agrège
(`utils/analytics.js#aggregateInseeCompanies`). Pour ajouter un enrichisseur
(avis employeurs, grille salariale externe…), exposer une route serveur dédiée et
un service/hook côté client, puis agréger dans l'onglet Analyse.
