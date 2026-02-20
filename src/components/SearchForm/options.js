// Données pour les listes déroulantes
export const experienceOptions = [
  { value: '', label: 'Toutes' },
  { value: '1', label: 'Moins d\'un an' },
  { value: '2', label: 'De 1 à 3 ans' },
  { value: '3', label: 'Plus de 3 ans' }
];

export const contractOptions = [
  { value: '', label: 'Tous' },
  { value: 'CDI', label: 'CDI' },
  { value: 'CDD', label: 'CDD' },
  { value: 'MIS', label: 'Mission intérimaire' }
];

// Options pour les nouveaux paramètres
export const qualificationOptions = [
  { value: '', label: 'Tous' },
  { value: '0', label: 'Non-cadre' },
  { value: '9', label: 'Cadre' }
];

export const workingHoursOptions = [
  { value: '', label: 'Tous' },
  { value: 'true', label: 'Temps plein' },
  { value: 'false', label: 'Temps partiel' }
];

// Réduire le nombre de compétences pour éviter les erreurs
export const webDevelopmentSkills = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'node', label: 'Node.js' },
  { value: 'php', label: 'PHP' },
  { value: 'python', label: 'Python' }
];

// Stacks technologiques par groupe
export const stackGroups = [
  {
    group: 'Frontend',
    options: [
      { value: 'React', label: 'React' },
      { value: 'Vue', label: 'Vue.js' },
      { value: 'Angular', label: 'Angular' },
      { value: 'Next.js', label: 'Next.js' },
      { value: 'TypeScript', label: 'TypeScript' },
    ],
  },
  {
    group: 'Backend',
    options: [
      { value: 'Node.js', label: 'Node.js' },
      { value: 'Python', label: 'Python' },
      { value: 'Java', label: 'Java' },
      { value: 'PHP', label: 'PHP' },
      { value: 'C#', label: 'C# / .NET' },
      { value: 'Go', label: 'Go / Golang' },
      { value: 'Rust', label: 'Rust' },
    ],
  },
  {
    group: 'Mobile',
    options: [
      { value: 'Flutter', label: 'Flutter' },
      { value: 'Swift', label: 'Swift / iOS' },
      { value: 'Kotlin', label: 'Kotlin / Android' },
    ],
  },
  {
    group: 'DevOps / Cloud',
    options: [
      { value: 'DevOps', label: 'DevOps' },
      { value: 'Docker', label: 'Docker / K8s' },
      { value: 'AWS', label: 'AWS' },
      { value: 'Azure', label: 'Azure' },
    ],
  },
];
