import { analyzeJobs } from './analytics';
import { departementFromCodePostal, departementLabel } from './departements';

const mkJob = (over = {}) => ({
  id: Math.random().toString(36).slice(2),
  intitule: 'Poste',
  entreprise: { nom: 'ACME' },
  lieuTravail: { libelle: '69 - LYON', codePostal: '69003' },
  typeContratLibelle: 'Contrat à durée indéterminée',
  natureContrat: 'Contrat travail',
  experienceLibelle: 'Débutant accepté',
  qualificationLibelle: 'Employé qualifié',
  dureeTravailLibelleConverti: 'Temps plein',
  romeCode: 'M1805',
  romeLibelle: 'Études et développement informatique',
  appellationlibelle: 'Développeur / Développeuse web',
  secteurActiviteLibelle: 'Programmation informatique',
  alternance: false,
  nombrePostes: 1,
  salaire: { libelle: 'Mensuel de 2500 Euros sur 12 mois' },
  dateCreation: new Date().toISOString(),
  ...over,
});

describe('departements', () => {
  test('déduit le bon code département', () => {
    expect(departementFromCodePostal('69003')).toBe('69');
    expect(departementFromCodePostal('75015')).toBe('75');
    expect(departementFromCodePostal('20000')).toBe('2A'); // Ajaccio
    expect(departementFromCodePostal('20200')).toBe('2B'); // Bastia
    expect(departementFromCodePostal('97400')).toBe('974'); // La Réunion
    expect(departementFromCodePostal('')).toBeNull();
  });
  test('libellé lisible', () => {
    expect(departementLabel('69003')).toBe('Rhône (69)');
    expect(departementLabel(null)).toBe('Non précisé');
  });
});

describe('analyzeJobs', () => {
  test('calcule la couverture et signale un échantillon', () => {
    const jobs = Array.from({ length: 1150 }, () => mkJob());
    const r = analyzeJobs(jobs, 5000);
    expect(r.meta.analyzed).toBe(1150);
    expect(r.meta.total).toBe(5000);
    expect(r.meta.isSample).toBe(true);
    expect(r.meta.coverage).toBeCloseTo(0.23, 2);
  });

  test('analyse exhaustive quand total <= échantillon', () => {
    const jobs = Array.from({ length: 40 }, () => mkJob());
    const r = analyzeJobs(jobs, 40);
    expect(r.meta.isSample).toBe(false);
    expect(r.meta.coverage).toBe(1);
  });

  test('statistiques de salaire (médiane, quartiles, taux affiché)', () => {
    const jobs = [
      mkJob({ salaire: { libelle: 'Mensuel de 2000 Euros sur 12 mois' } }),
      mkJob({ salaire: { libelle: 'Mensuel de 2500 Euros sur 12 mois' } }),
      mkJob({ salaire: { libelle: 'Mensuel de 3000 Euros sur 12 mois' } }),
      mkJob({ salaire: null }), // non renseigné
    ];
    const r = analyzeJobs(jobs, 4);
    expect(r.salary.disclosed).toBe(3);
    expect(r.salary.disclosedPct).toBeCloseTo(75, 0);
    expect(r.salary.median).toBe(2500);
    expect(r.salary.min).toBe(2000);
    expect(r.salary.max).toBe(3000);
  });

  test('répartitions et distincts', () => {
    const jobs = [
      mkJob({ typeContratLibelle: 'CDI', entreprise: { nom: 'A' } }),
      mkJob({ typeContratLibelle: 'CDI', entreprise: { nom: 'B' } }),
      mkJob({ typeContratLibelle: 'CDD', entreprise: { nom: 'A' } }),
    ];
    const r = analyzeJobs(jobs, 3);
    const cdi = r.breakdowns.contracts.rows.find((x) => x.label === 'CDI');
    expect(cdi.count).toBe(2);
    expect(cdi.pct).toBeCloseTo(66.7, 1);
    expect(r.indicators.distinctRecruiters).toBe(2);
  });

  test('recoupement salaire × contrat (seuil 3 offres)', () => {
    const jobs = [
      ...Array.from({ length: 3 }, () => mkJob({ typeContratLibelle: 'CDI', salaire: { libelle: 'Mensuel de 3000 Euros sur 12 mois' } })),
      ...Array.from({ length: 3 }, () => mkJob({ typeContratLibelle: 'CDD', salaire: { libelle: 'Mensuel de 2000 Euros sur 12 mois' } })),
      mkJob({ typeContratLibelle: 'MIS', salaire: { libelle: 'Mensuel de 5000 Euros sur 12 mois' } }), // 1 seule → exclue
    ];
    const r = analyzeJobs(jobs, 7);
    const labels = r.crosstabs.salaryByContract.map((x) => x.label);
    expect(labels).toContain('CDI');
    expect(labels).toContain('CDD');
    expect(labels).not.toContain('MIS'); // sous le seuil de 3
    const cdi = r.crosstabs.salaryByContract.find((x) => x.label === 'CDI');
    expect(cdi.median).toBe(3000);
  });

  test('indicateurs alternance et postes cumulés', () => {
    const jobs = [
      mkJob({ alternance: true, nombrePostes: 2 }),
      mkJob({ alternance: false, nombrePostes: 3 }),
    ];
    const r = analyzeJobs(jobs, 2);
    expect(r.indicators.alternanceCount).toBe(1);
    expect(r.indicators.alternancePct).toBe(50);
    expect(r.indicators.totalPostes).toBe(5);
  });

  test('ne plante pas sur des offres vides / champs manquants', () => {
    const r = analyzeJobs([{ id: '1' }, {}], 2);
    expect(r.meta.analyzed).toBe(2);
    expect(r.salary.median).toBeNull();
    expect(r.breakdowns.contracts.rows).toHaveLength(0);
  });
});
