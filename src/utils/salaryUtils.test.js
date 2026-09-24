import { formatSalaryToMonthly, convertToAnnualSalary } from './salaryUtils';

const monthly = (libelle) => formatSalaryToMonthly({ libelle }).replace(/\s/g, ' ');

describe('salaryUtils — périodicité', () => {
  test('mensuel réaliste conservé', () => {
    expect(monthly('Mensuel de 2500 Euros')).toBe('2 500 € / mois brut');
    expect(convertToAnnualSalary({ libelle: 'Mensuel de 2500 Euros' })).toBe(30000);
  });

  test('annuel correctement ramené au mois', () => {
    expect(monthly('Annuel de 45000 Euros')).toBe('3 750 € / mois brut');
    expect(convertToAnnualSalary({ libelle: 'Annuel de 45000 Euros' })).toBe(45000);
  });

  test('« Mensuel » avec montant annuel (mislabel FT) corrigé', () => {
    // >= 18000 étiqueté Mensuel → en réalité annuel → ÷12
    expect(monthly('Mensuel de 25000 Euros à 30000 Euros')).toBe('2 083 € / mois brut');
    expect(convertToAnnualSalary({ libelle: 'Mensuel de 25000 Euros à 30000 Euros' })).toBe(25000);
    expect(monthly('Mensuel de 38000 Euros')).toBe('3 167 € / mois brut');
  });

  test('« Mensuel » corrompu (10000–18000) → non précisé', () => {
    // Ni mensuel réaliste, ni annuel plausible (÷12 sous le SMIC) → ignoré
    expect(monthly('Mensuel de 11100 Euros à 14100 Euros')).toBe('Salaire non précisé');
    expect(convertToAnnualSalary({ libelle: 'Mensuel de 11100 Euros à 14100 Euros' })).toBeNull();
    expect(monthly('Mensuel de 10500 Euros à 12000 Euros')).toBe('Salaire non précisé');
  });

  test('horaire converti en mensuel', () => {
    expect(monthly('Horaire de 12.31 Euros - sur 13 mois')).toMatch(/€ \/ mois brut$/);
  });

  test('« Mensuel de X sur 12 mois » (total annuel) géré', () => {
    expect(monthly('Mensuel de 24000 Euros sur 12 mois')).toBe('2 000 € / mois brut');
  });
});
