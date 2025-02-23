import React from 'react';
import { Link } from 'react-router-dom';

const FooterLinks = () => {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Navigation</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Accueil
            </Link>
          </li>
          <li>
            <Link to="/saved" className="text-gray-600 hover:text-gray-900">
              Offres sauvegardées
            </Link>
          </li>
        </ul>
      </div>
      
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Ressources</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a 
              href="https://fr.wikipedia.org/wiki/France_Travail" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              À propos de France Travail
            </a>
          </li>
          <li>
            <a 
              href="https://entreprise.francetravail.fr/connexion/connexion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              France Travail Entreprises
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FooterLinks;
