import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../../context/AppContext';
import MobileMenu from './MobileMenu';
import NavLinks from './NavLinks';

// Affiche le nom du mode vers lequel on bascule (destination)
const ModeToggle = ({ isDevMode, onToggle }) => {
  const isClassic = !isDevMode;
  // En DevJobs → le bouton propose "Classique" ; en classique → il propose "DevJobs"
  const label = isDevMode ? 'Classique' : 'DevJobs';
  const active = isClassic; // bouton "actif" visuellement quand on est en classique

  return (
    <button
      onClick={onToggle}
      title={isDevMode ? 'Passer en recherche classique' : 'Passer en mode DevJobs'}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors select-none"
      style={active
        ? { background: '#1a56db', borderColor: '#1a56db', color: '#fff' }
        : isDevMode
          ? { background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.18)', color: '#9ca3af' }
          : { background: '#f3f4f6', borderColor: '#e5e7eb', color: '#374151' }
      }
    >
      <span className="text-xs font-bold tracking-wide">{label}</span>
      <span
        className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
        style={{ background: active ? 'rgba(255,255,255,0.3)' : isDevMode ? '#4b5563' : '#d1d5db' }}
      >
        <span
          className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
          style={{ transform: active ? 'translateX(18px)' : 'translateX(2px)' }}
        />
      </span>
    </button>
  );
};

const Navbar = () => {
  const { savedJobs, isDevMode, toggleDevMode } = useAppContext();
  const savedJobsCount = savedJobs.length;

  return (
    <Disclosure as="nav" className={`shadow transition-colors ${isDevMode ? 'bg-gray-900' : 'bg-white'}`}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="flex items-center gap-2">
                    {isDevMode && (
                      <span className="text-xs font-mono font-bold text-ft-blue bg-ft-blue/20 px-1.5 py-0.5 rounded">&lt;/&gt;</span>
                    )}
                    <span className={`text-lg font-semibold ${isDevMode ? 'text-white' : 'text-ft-blue'}`}>
                      {isDevMode ? 'DevJobs' : 'Recherche Emploi'}
                    </span>
                  </Link>
                </div>
                <NavLinks savedJobsCount={savedJobsCount} />
              </div>

              <div className="flex items-center gap-3">
                <ModeToggle isDevMode={isDevMode} onToggle={toggleDevMode} />
                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className={`inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ft-blue ${isDevMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-500'}`}>
                    <span className="sr-only">Ouvrir le menu principal</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </div>

          <MobileMenu savedJobsCount={savedJobsCount} />
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
