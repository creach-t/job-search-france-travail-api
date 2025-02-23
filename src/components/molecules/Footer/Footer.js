import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-base text-gray-500">
            Application utilisant l'API de France Travail. 
            Plus d'informations sur{' '}
            <a
              href="https://www.emploi-store-dev.fr/portail-developpeur/"
              target="_blank"
              rel="noreferrer"
              className="text-ft-blue hover:text-ft-darkblue"
            >
              l'Emploi Store Dev
            </a>
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Ce site n'est pas affilié à France Travail
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;