import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { NAV_ITEMS } from './navItems';
import Brand from './Brand';

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-accent-gradient text-white shadow-glow-violet'
      : 'text-ink-muted hover:text-ink hover:bg-[var(--glass-hover)]'
  }`;

// Sidebar verticale (desktop ≥ lg) — carte de verre fixe
const Sidebar = () => {
  const { savedJobs } = useAppContext();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 z-30 p-3">
      <div className="glass-card flex flex-1 flex-col p-4">
        <div className="px-1.5 py-2 mb-4">
          <Brand />
        </div>

        <nav className="flex-1 space-y-1" aria-label="Navigation principale">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, badgeKey }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {badgeKey === 'saved' && savedJobs.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--glass-bg-strong)] text-xs font-semibold text-ink">
                  {savedJobs.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 pt-4 border-t border-[rgb(var(--line)/0.12)]">
          <p className="px-2 text-xs leading-relaxed text-ink-faint">
            Données&nbsp;: API France Travail.
            <br />Site non-officiel.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
