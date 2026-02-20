import React from 'react';
import { Link } from 'react-router-dom';
import FooterLinks from './FooterLinks';

const Footer = () => {
  return (
    <footer className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <span className="self-center text-lg font-semibold text-ft-blue">Recherche Emploi</span>
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Site non-officiel utilisant l'API France Travail
            </p>
          </div>
          
          <FooterLinks />
        </div>
        
        <hr className="my-6 border-gray-200 sm:mx-auto" />
        
        <div className="text-center">
          <span className="text-sm text-gray-500">
            © {new Date().getFullYear()} Application exemple - Données fournies par France Travail
          </span>
          <span className="block text-xs text-gray-400 mt-1">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
