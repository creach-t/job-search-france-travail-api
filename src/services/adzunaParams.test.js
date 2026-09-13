import { toAdzunaParams } from './adzunaParams';

describe('toAdzunaParams', () => {
  test('mot-clé + lieu (nom) + distance', () => {
    expect(toAdzunaParams({ keywords: 'développeur', locationLabel: 'Lyon', location: '69123', distance: '20' }))
      .toEqual({ what: 'développeur', where: 'Lyon', distance: '20' });
  });
  test('métier ROME → libellé en mot-clé', () => {
    expect(toAdzunaParams({ codeROME: 'M1805', codeROMELabel: 'Développement informatique' }))
      .toEqual({ what: 'Développement informatique' });
  });
  test('stacks → recherche OR', () => {
    expect(toAdzunaParams({ stacks: ['React', 'Vue'] })).toEqual({ what_or: 'React Vue' });
  });
  test('« sur place » (distance 0) ignorée, filtres transmis', () => {
    expect(toAdzunaParams({ keywords: 'dev', locationLabel: 'Paris', distance: '0', salaryMin: 45000, contractType: 'CDI', workingHours: 'true' }))
      .toEqual({ what: 'dev', where: 'Paris', salaryMin: 45000, contractType: 'CDI', workingHours: 'true' });
  });
  test('recherche vide → objet vide', () => {
    expect(toAdzunaParams({})).toEqual({});
  });
});
