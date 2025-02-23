import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-ft-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl hover:text-gray-200">
                France Travail API
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <a
              href="https://www.emploi-store-dev.fr/portail-developpeur/"
              target="_blank"
              rel="noreferrer"
              className="text-white hover:text-gray-200 font-medium"
            >
              Emploi Store Dev
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;