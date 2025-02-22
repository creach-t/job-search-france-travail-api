import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="bg-white min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <p className="text-4xl font-extrabold text-ft-blue sm:text-5xl">404</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Page non trouvée</h1>
              <p className="mt-1 text-base text-gray-500">L'URL demandée n'existe pas sur ce site.</p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-ft-blue hover:bg-ft-darkblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ft-blue"
              >
                Retour à l'accueil
              </Link>
              <Link
                to="/saved"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-ft-blue bg-ft-lightblue hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ft-blue"
              >
                Voir mes offres sauvegardées
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotFoundPage;