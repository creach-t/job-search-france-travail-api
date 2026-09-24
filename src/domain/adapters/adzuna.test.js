import { fromAdzuna, fromAdzunaList } from './adzuna';
import { normalizeOffers } from './index';
import { SOURCES } from '../offer';
import { convertToAnnualSalary, formatSalaryToMonthly } from '../../utils/salaryUtils';

const rawAdzuna = {
  id: '4200123',
  title: 'Développeur <strong>React</strong> H/F',
  description: 'Poste sympa',
  created: '2026-09-10T08:00:00Z',
  company: { display_name: 'ACME' },
  location: { display_name: 'Paris, Île-de-France', area: ['France', 'Île-de-France', 'Paris'] },
  latitude: 48.85,
  longitude: 2.35,
  contract_type: 'permanent',
  contract_time: 'full_time',
  category: { label: 'IT Jobs' },
  salary_min: 45000,
  salary_max: 55000,
  salary_is_predicted: '0',
  redirect_url: 'https://www.adzuna.fr/details/4200123',
};

describe('adapter Adzuna', () => {
  test('projette les champs sur le modèle Offer', () => {
    const o = fromAdzuna(rawAdzuna);
    expect(o.id).toBe('adzuna:4200123');
    expect(o.source).toBe(SOURCES.ADZUNA);
    expect(o.intitule).toBe('Développeur React H/F'); // balises retirées
    expect(o.entreprise.nom).toBe('ACME');
    expect(o.lieuTravail).toMatchObject({ commune: 'Paris', latitude: 48.85, longitude: 2.35 });
    expect(o.typeContratLibelle).toBe('CDI');
    expect(o.dureeTravailLibelleConverti).toBe('Temps plein');
    expect(o.secteurActiviteLibelle).toBe('IT Jobs');
    expect(o.contact.urlPostulation).toContain('adzuna');
    expect(o.raw).toBe(rawAdzuna);
  });

  test('salaire lisible par salaryUtils (annuel → mensuel)', () => {
    const o = fromAdzuna(rawAdzuna);
    expect(convertToAnnualSalary(o.salaire)).toBe(45000);
    // toLocaleString('fr-FR') sépare les milliers par une espace fine insécable
    // → on normalise les espaces avant comparaison.
    expect(formatSalaryToMonthly(o.salaire).replace(/\s/g, ' ')).toBe('3 750 € / mois brut');
  });

  test('salaire mensuel détecté sous le seuil (2500 → mensuel, pas annuel)', () => {
    const o = fromAdzuna({ id: '9', salary_min: 2500 });
    expect(o.salaire.libelle).toMatch(/^Mensuel de 2500/);
    expect(formatSalaryToMonthly(o.salaire).replace(/\s/g, ' ')).toBe('2 500 € / mois brut');
    expect(convertToAnnualSalary(o.salaire)).toBe(30000);
  });

  test('salaire annuel détecté au-dessus du seuil (45000 → annuel)', () => {
    const o = fromAdzuna({ id: '10', salary_min: 45000 });
    expect(o.salaire.libelle).toMatch(/^Annuel de 45000/);
    expect(convertToAnnualSalary(o.salaire)).toBe(45000);
  });

  test('montant aberrant (quelques euros) ignoré', () => {
    expect(fromAdzuna({ id: '11', salary_min: 48 }).salaire).toBeUndefined();
    expect(fromAdzuna({ id: '12', salary_min: 4 }).salaire).toBeUndefined();
  });

  test('gère les champs manquants sans planter', () => {
    const o = fromAdzuna({ id: '1' });
    expect(o.id).toBe('adzuna:1');
    expect(o.salaire).toBeUndefined();
    expect(o.contact).toBeUndefined();
    expect(fromAdzunaList(null)).toEqual([]);
  });

  test('normalizeOffers route bien vers l’adapter Adzuna', () => {
    const [o] = normalizeOffers([rawAdzuna], SOURCES.ADZUNA);
    expect(o.source).toBe(SOURCES.ADZUNA);
    expect(o.intitule).toBe('Développeur React H/F');
  });
});
