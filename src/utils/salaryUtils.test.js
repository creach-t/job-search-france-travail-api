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
    // >= 18000 étiqueté Mensuel → en réalité annuel → ÷12 (décision sur la borne haute)
    expect(monthly('Mensuel de 25000 Euros à 30000 Euros')).toBe('2 083 – 2 500 € / mois brut');
    expect(convertToAnnualSalary({ libelle: 'Mensuel de 25000 Euros à 30000 Euros' })).toBe(25000);
    expect(monthly('Mensuel de 38000 Euros')).toBe('3 167 € / mois brut');
  });

  test('fourchette affichée min–max (plus seulement la borne basse)', () => {
    expect(monthly('Mensuel de 2600 Euros à 3000 Euros')).toBe('2 600 – 3 000 € / mois brut');
    expect(monthly('Annuel de 45000 Euros à 55000 Euros')).toBe('3 750 – 4 583 € / mois brut');
    // la borne basse reste la référence du filtre/analyse
    expect(convertToAnnualSalary({ libelle: 'Annuel de 45000 Euros à 55000 Euros' })).toBe(45000);
  });

  test('périodicité décidée sur la borne haute, appliquée aux deux bornes', () => {
    // 70000 en « Mensuel » = annuel mal étiqueté → les DEUX bornes ÷12
    expect(monthly('Mensuel de 50000 Euros à 70000 Euros')).toBe('4 167 – 5 833 € / mois brut');
    // borne haute fiable (≤ 10000) → mensuel conservé tel quel
    expect(monthly('Mensuel de 4000 Euros à 6000 Euros')).toBe('4 000 – 6 000 € / mois brut');
  });

  test('commentaire "- 13ème mois" n’est pas pris pour un montant', () => {
    expect(monthly('Horaire de 12.31 Euros - 13ème mois')).toBe('1 867 € / mois brut');
  });

  test('commentaire libre (sans libellé structuré) → jamais de montant inventé', () => {
    // Bug réel : "Salaire CCN 51" donnait 7 735 €/mois, "13ème mois" → 13 €/mois.
    expect(formatSalaryToMonthly({ commentaire: 'Salaire CCN 51' })).toBe('Salaire non précisé');
    expect(formatSalaryToMonthly({ commentaire: '13ème mois' })).toBe('Salaire non précisé');
    expect(formatSalaryToMonthly({ commentaire: 'Selon profil et expérience' })).toBe('Salaire non précisé');
    expect(convertToAnnualSalary({ commentaire: 'Salaire CCN 51' })).toBeNull();
  });

  test('un commentaire "annuel"/"un an" ne doit PAS basculer un Mensuel en annuel', () => {
    // Bug réel : "annuel" / "un an" dans le texte libre après " - " faisait ÷12.
    expect(monthly('Mensuel de 2600 Euros à 3000 Euros - Complément Indemnitaire Annuel'))
      .toBe('2 600 – 3 000 € / mois brut');
    expect(monthly('Mensuel de 3900 Euros à 4000 Euros - 13 ème mois après un an'))
      .toBe('3 900 – 4 000 € / mois brut');
    expect(monthly('Mensuel de 1950 Euros - prime annuelle')).toBe('1 950 € / mois brut');
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
