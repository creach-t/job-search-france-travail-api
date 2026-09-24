import { offerScore } from './offerScore';

describe('offerScore', () => {
  test('une offre riche score plus qu\'une offre pauvre', () => {
    const riche = {
      salaire: { libelle: 'Annuel de 45000 Euros' },
      description: 'x'.repeat(500),
      entreprise: { nom: 'ACME', url: 'https://acme.fr' },
      lieuTravail: { libelle: 'Lyon', codePostal: '69003', latitude: 45, longitude: 4 },
      typeContratLibelle: 'CDI',
      experienceLibelle: '2 ans',
      qualificationLibelle: 'Cadre',
      dureeTravailLibelleConverti: 'Temps plein',
      secteurActiviteLibelle: 'Info',
      competences: [{ libelle: 'React' }],
      contact: { urlPostulation: 'https://x' },
      romeCode: 'M1805',
    };
    const pauvre = { intitule: 'Dev', lieuTravail: { libelle: 'Paris' } };
    expect(offerScore(riche)).toBeGreaterThan(offerScore(pauvre));
  });

  test('le salaire augmente le score', () => {
    const sans = { entreprise: { nom: 'A' } };
    const avec = { entreprise: { nom: 'A' }, salaire: { libelle: 'Mensuel de 2500 Euros' } };
    expect(offerScore(avec)).toBeGreaterThan(offerScore(sans));
  });

  test('robuste aux entrées vides', () => {
    expect(offerScore(null)).toBe(0);
    expect(offerScore({})).toBe(0);
    expect(offerScore(undefined)).toBe(0);
  });

  test('trie correctement une liste', () => {
    const a = { intitule: 'a' };
    const b = { intitule: 'b', salaire: { libelle: 'Mensuel de 2000 Euros' }, description: 'x'.repeat(120) };
    const sorted = [a, b].sort((x, y) => offerScore(y) - offerScore(x));
    expect(sorted[0]).toBe(b);
  });
});
