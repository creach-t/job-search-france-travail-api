import { Disclosure } from '@headlessui/react';
import { NavLink } from 'react-router-dom';
import { MapIcon } from '@heroicons/react/24/outline';

const MobileMenu = ({ savedJobsCount }) => {
  return (
    <Disclosure.Panel className="sm:hidden">
      <div className="space-y-1 pb-3 pt-2">
        <Disclosure.Button
          as={NavLink}
          to="/"
          className={({ isActive }) =>
            `block border-l-4 ${
              isActive
                ? 'border-ft-blue bg-ft-blue/10 text-ft-blue'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } py-2 pl-3 pr-4 text-base font-medium`
          }
          end
        >
          Accueil
        </Disclosure.Button>
        <Disclosure.Button
          as={NavLink}
          to="/saved"
          className={({ isActive }) =>
            `block border-l-4 ${
              isActive
                ? 'border-ft-blue bg-ft-blue/10 text-ft-blue'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } py-2 pl-3 pr-4 text-base font-medium`
          }
        >
          Offres sauvegardées
          {savedJobsCount > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-ft-blue px-2 py-1 text-xs font-medium text-white">
              {savedJobsCount}
            </span>
          )}
        </Disclosure.Button>
        <Disclosure.Button
          as={NavLink}
          to="/map"
          className={({ isActive }) =>
            `flex items-center gap-2 border-l-4 ${
              isActive
                ? 'border-ft-blue bg-ft-blue/10 text-ft-blue'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } py-2 pl-3 pr-4 text-base font-medium`
          }
        >
          <MapIcon className="h-5 w-5" aria-hidden="true" />
          Carte
        </Disclosure.Button>
      </div>
    </Disclosure.Panel>
  );
};

export default MobileMenu;
