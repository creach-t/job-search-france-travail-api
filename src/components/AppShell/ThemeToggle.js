import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
      title={isDark ? 'Thème clair' : 'Thème sombre'}
      className={`glass-card glass-hover inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted hover:text-ink ${className}`}
    >
      {isDark
        ? <SunIcon className="h-5 w-5" aria-hidden="true" />
        : <MoonIcon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
