import {
  MagnifyingGlassIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

// Navigation principale — l'app est centrée sur la recherche.
// Résultats · Analyse · Carte sont des onglets DANS la recherche (page /).
export const NAV_ITEMS = [
  { to: '/',        label: 'Recherche', icon: MagnifyingGlassIcon, end: true },
  { to: '/favoris', label: 'Favoris',   icon: HeartIcon, badgeKey: 'saved' },
];
