import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { NAV_ITEMS } from './navItems';

// Barre d'onglets basse (mobile / tablette < lg) — accès pouce-friendly.
const MobileNav = () => {
  const { savedJobs } = useAppContext();

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="Navigation"
    >
      <div className="glass-card glass-card-strong flex items-stretch justify-around px-1 py-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-accent' : 'text-ink-faint hover:text-ink-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`relative inline-flex h-6 items-center ${isActive ? 'drop-shadow-[0_0_8px_rgb(var(--accent)/0.6)]' : ''}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {badgeKey === 'saved' && savedJobs.length > 0 && (
                    <span className="absolute -right-2 -top-1 inline-flex min-w-[15px] h-[15px] items-center justify-center rounded-full bg-magenta px-1 text-[9px] font-bold text-white">
                      {savedJobs.length}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
