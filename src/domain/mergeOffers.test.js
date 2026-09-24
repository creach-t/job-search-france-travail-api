import { mergeOffers, dedupeKey, countBySource } from './mergeOffers';
import { SOURCES } from './offer';

const ft = (over = {}) => ({ source: SOURCES.FRANCE_TRAVAIL, intitule: 'Dev', entreprise: { nom: 'ACME' }, dateCreation: '2026-09-10T00:00:00Z', ...over });
const az = (over = {}) => ({ source: SOURCES.ADZUNA, intitule: 'Dev', entreprise: { nom: 'ACME' }, dateCreation: '2026-09-12T00:00:00Z', ...over });

describe('mergeOffers', () => {
  test('dé-duplique inter-sources et garde la première (FT prioritaire)', () => {
    const merged = mergeOffers([[ft({ id: 'ft1' })], [az({ id: 'az1' })]]);
    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe(SOURCES.FRANCE_TRAVAIL); // FT gardé sur doublon
  });

  test('conserve les offres distinctes des deux sources', () => {
    const merged = mergeOffers([
      [ft({ id: 'ft1', intitule: 'Backend', entreprise: { nom: 'A' } })],
      [az({ id: 'az1', intitule: 'Frontend', entreprise: { nom: 'B' } })],
    ]);
    expect(merged).toHaveLength(2);
  });

  test('trie par date décroissante, sans-date en dernier', () => {
    const merged = mergeOffers([[
      ft({ id: '1', intitule: 'A', dateCreation: '2026-01-01T00:00:00Z' }),
      ft({ id: '2', intitule: 'B', dateCreation: '2026-09-01T00:00:00Z' }),
      ft({ id: '3', intitule: 'C', dateCreation: undefined }),
    ]]);
    expect(merged.map((o) => o.intitule)).toEqual(['B', 'A', 'C']);
  });

  test('dedupeKey insensible à la casse et aux espaces', () => {
    expect(dedupeKey({ intitule: '  Dev  Web ', entreprise: { nom: 'ACME' } }))
      .toBe(dedupeKey({ intitule: 'dev web', entreprise: { nom: 'acme' } }));
  });

  test('countBySource', () => {
    const merged = mergeOffers([[ft({ id: '1', intitule: 'A' })], [az({ id: '2', intitule: 'B' })]]);
    expect(countBySource(merged)).toEqual({ [SOURCES.FRANCE_TRAVAIL]: 1, [SOURCES.ADZUNA]: 1 });
  });

  test('robuste aux entrées vides/nulles', () => {
    expect(mergeOffers([null, [null], []])).toEqual([]);
    expect(mergeOffers()).toEqual([]);
  });
});
