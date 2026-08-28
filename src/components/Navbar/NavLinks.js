import React from 'react';
import { NavLink } from 'react-router-dom';
import { MapIcon } from '@heroicons/react/24/outline';

const NavLinks = ({ savedJobsCount }) => {
  return (
    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
            isActive
              ? 'border-ft-blue text-ft-blue'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`
        }
        end
      >
        Accueil
      </NavLink>
      <NavLink
        to="/saved"
        className={({ isActive }) =>
          `inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
            isActive
              ? 'border-ft-blue text-ft-blue'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`
        }
      >
        Offres sauvegardées
        {savedJobsCount > 0 && (
          <span className="ml-2 inline-flex items-center rounded-full bg-ft-blue px-2 py-1 text-xs font-medium text-white">
            {savedJobsCount}
          </span>
        )}
      </NavLink>
      <NavLink
        to="/map"
        className={({ isActive }) =>
          `inline-flex items-center gap-1.5 border-b-2 px-1 pt-1 text-sm font-medium ${
            isActive
              ? 'border-ft-blue text-ft-blue'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`
        }
      >
        <MapIcon className="h-4 w-4" aria-hidden="true" />
        Carte
      </NavLink>
    </div>
  );
};

export default NavLinks;
