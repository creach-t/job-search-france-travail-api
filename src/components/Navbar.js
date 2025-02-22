import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-ft-darkblue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <span className="text-white font-bold text-xl">DevJobs</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/' ? 'bg-ft-blue text-white' : 'text-white hover:bg-ft-blue/80'}`}
                >
                  Recherche
                </Link>
                <Link
                  to="/saved"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/saved' ? 'bg-ft-blue text-white' : 'text-white hover:bg-ft-blue/80'}`}
                >
                  Offres sauvegardées
                </Link>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-ft-blue focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/' ? 'bg-ft-blue text-white' : 'text-white hover:bg-ft-blue/80'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Recherche
            </Link>
            <Link
              to="/saved"
              className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/saved' ? 'bg-ft-blue text-white' : 'text-white hover:bg-ft-blue/80'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Offres sauvegardées
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
