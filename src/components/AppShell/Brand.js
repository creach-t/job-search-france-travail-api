import React from 'react';
import { Link } from 'react-router-dom';

// Marque : pastille dégradée + nom en dégradé (cohérent avec la maquette)
const Brand = ({ compact = false }) => (
  <Link to="/" className="flex items-center gap-2.5 group" aria-label="DevJobs — accueil">
    <span
      className="icon-tile h-9 w-9 shrink-0 bg-accent-gradient text-white"
      aria-hidden="true"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13a9 9 0 0118 0M7 13a5 5 0 0110 0M11 13a1 1 0 112 0" />
      </svg>
    </span>
    {!compact && (
      <span className="text-lg font-extrabold tracking-tight gradient-text">DevJobs</span>
    )}
  </Link>
);

export default Brand;
