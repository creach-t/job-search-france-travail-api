import {
  Squares2X2Icon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  MapIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

// Navigation principale — l'app est un tableau de bord du marché de l'emploi.
export const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard', icon: Squares2X2Icon,     end: true },
  { to: '/offres',    label: 'Recherche', icon: MagnifyingGlassIcon },
  { to: '/tendances', label: 'Tendances', icon: ArrowTrendingUpIcon },
  { to: '/carte',     label: 'Carte',     icon: MapIcon },
  { to: '/favoris',   label: 'Favoris',   icon: HeartIcon, badgeKey: 'saved' },
];
