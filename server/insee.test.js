/**
 * Tests du matching entreprise (INSEE/SIRENE). Lancés avec le runner natif Node :
 *   node --test server/
 * Pas de dépendance de test (ni Jest) côté serveur.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeName, matchConfidence, normalizeCompany } = require('./insee');

test('normalizeName retire accents, ponctuation et suffixes juridiques', () => {
  assert.equal(normalizeName('Éléctro-Ménager SAS'), 'ELECTRO MENAGER');
  assert.equal(normalizeName('Société Générale'), 'GENERALE');
  assert.equal(normalizeName('  ACME   France  '), 'ACME');
});

test('normalizeName gère les entrées vides ou nulles', () => {
  assert.equal(normalizeName(''), '');
  assert.equal(normalizeName(null), '');
  assert.equal(normalizeName(undefined), '');
});

test('matchConfidence: nom identique + code postal exact => high', () => {
  const result = { nom_complet: 'CAPGEMINI', siege: { code_postal: '75015' } };
  assert.equal(matchConfidence('CAPGEMINI', result, '75015'), 'high');
});

test('matchConfidence: nom identique sans code postal => medium', () => {
  const result = { nom_complet: 'CAPGEMINI', siege: { code_postal: '69002' } };
  assert.equal(matchConfidence('CAPGEMINI', result, '75015'), 'medium');
});

test('matchConfidence: préfixe (troncature FT) reconnu', () => {
  const result = { nom_complet: 'ETABLISSEMENTS DURAND ET FILS', siege: { code_postal: '33000' } };
  // "ETABLISSEMENTS" est du bruit retiré → reste "DURAND ET FILS"
  assert.notEqual(matchConfidence('DURAND ET FILS', result, '33000'), 'low');
});

test('matchConfidence: noms totalement différents => low', () => {
  const result = { nom_complet: 'BOULANGERIE MARTIN', siege: { code_postal: '31000' } };
  assert.equal(matchConfidence('GARAGE LEFEBVRE', result, '75001'), 'low');
});

test('normalizeCompany renvoie null si pas de résultat', () => {
  assert.equal(normalizeCompany(null), null);
});

test('normalizeCompany expose les champs clés labellisés', () => {
  const raw = {
    siren: '123456789',
    nom_complet: 'ACME SAS',
    nom_raison_sociale: 'ACME',
    nature_juridique: '5710',
    etat_administratif: 'A',
    tranche_effectif_salarie: '21',
    siege: { siret: '12345678900011', code_postal: '75001', libelle_commune: 'PARIS' },
  };
  const out = normalizeCompany(raw, { nom: 'ACME', codePostal: '75001' });
  assert.equal(out.found, true);
  assert.equal(out.siren, '123456789');
  assert.equal(out.active, true);
  assert.equal(out.formeJuridique.libelle, 'Société par actions simplifiée (SAS)');
  assert.equal(out.effectif.libelle, '50 à 99 salariés');
  assert.equal(out.lienAnnuaire, 'https://annuaire-entreprises.data.gouv.fr/entreprise/123456789');
});
