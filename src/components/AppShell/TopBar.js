import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';
import Brand from './Brand';

// Barre supérieure : recherche globale + bascule de thème.
// La recherche envoie vers /offres avec le terme (?q=).
const TopBar = () => {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    navigate(`/offres${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };

  return (
    <header className="sticky top-0 z-20 px-3 pt-3">
      <div className="glass-card glass-card-strong flex items-center gap-3 px-3 py-2.5">
        {/* Mobile : marque compacte */}
        <div className="lg:hidden">
          <Brand compact />
        </div>

        {/* Recherche globale */}
        <form onSubmit={submit} className="flex-1 min-w-0" role="search">
          <label htmlFor="global-search" className="sr-only">Rechercher un métier</label>
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" aria-hidden="true" />
            <input
              id="global-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Quel métier recherchez-vous ?"
              className="glass-input w-full rounded-xl py-2.5 pl-11 pr-4 text-sm"
            />
          </div>
        </form>

        <ThemeToggle />
      </div>
    </header>
  );
};

export default TopBar;
