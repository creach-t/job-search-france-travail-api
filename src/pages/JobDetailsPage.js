import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useGetJobById } from '../hooks/useJobs';
import ApplyButton from '../components/JobCard/ApplyButton';
import { formatSalaryToMonthly } from '../utils/salaryUtils';

const JobDetailsPage = () => {
  const { id } = useParams();
  const { data: job, isLoading, isError } = useGetJobById(id);
  const [isSaved, setIsSaved] = useState(false);
  
  useEffect(() => {
    if (job) {
      const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setIsSaved(savedJobs.some(savedJob => savedJob.id === job.id));
    }
  }, [job]);
  
  const handleSaveJob = () => {
    if (!job) return;
    
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    
    if (isSaved) {
      const updatedJobs = savedJobs.filter(savedJob => savedJob.id !== job.id);
      localStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
      setIsSaved(false);
    } else {
      savedJobs.push(job);
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
      setIsSaved(true);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <svg className="animate-spin h-10 w-10 text-ft-blue mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-700">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Erreur lors du chargement de l'offre. Cette offre n'existe pas ou n'est plus disponible.
              </p>
            </div>
          </div>
        </div>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-ft-blue hover:bg-ft-darkblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ft-blue"
        >
          Retour à la recherche
        </Link>
      </div>
    );
  }

  // Organisation du contenu de l'offre
  const hasGeolocation = job.lieuTravail?.latitude && job.lieuTravail?.longitude;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex flex-col md:flex-row md:justify-between md:items-start">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">{job.intitule}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {job.entreprise?.nom || 'Entreprise non spécifiée'}
              {job.lieuTravail?.libelle ? ` · ${job.lieuTravail.libelle}` : ''}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.typeContratLibelle && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  {job.typeContratLibelle}
                </span>
              )}
              {job.dureeTravailLibelleConverti && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                  {job.dureeTravailLibelleConverti}
                </span>
              )}
              {job.experienceLibelle && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                  {job.experienceLibelle}
                </span>
              )}
              {job.qualificationLibelle && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                  {job.qualificationLibelle}
                </span>
              )}
              {job.alternance && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                  Alternance
                </span>
              )}
              {job.accessibleTH && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-teal-100 text-teal-800">
                  Accessible TH
                </span>
              )}
              {job.offresManqueCandidats && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
                  Offre en tension
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={handleSaveJob}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isSaved
                  ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill={isSaved ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={isSaved ? "0" : "2"}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {isSaved ? 'Sauvegardée' : 'Sauvegarder'}
            </button>
            
            {/* Bouton de postulation */}
            <ApplyButton job={job} isDetailed={true} />
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <dl>
            {/* Section principale */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Lieu</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {job.lieuTravail?.libelle || 'Lieu non spécifié'}
                {job.lieuTravail?.codePostal && ` (${job.lieuTravail.codePostal})`}
                {hasGeolocation && (
                  <div className="mt-2">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${job.lieuTravail.latitude},${job.lieuTravail.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ft-blue hover:underline inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Voir sur la carte
                    </a>
                  </div>
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type de contrat</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {job.typeContratLibelle || 'Type de contrat non spécifié'}
                {job.natureContrat && ` (${job.natureContrat})`}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Durée du travail</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {job.dureeTravailLibelle || 'Non spécifiée'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Salaire</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {/* Salaire converti en mensuel brut */}
                <span className="font-medium text-gray-900">
                  💰 {formatSalaryToMonthly(job.salaire)}
                </span>
                {/* Salaire original pour référence */}
                {job.salaire?.libelle && (
                  <div className="mt-1 text-xs text-gray-500">
                    Indication originale : {job.salaire.libelle}
                  </div>
                )}
                {(job.salaire?.complement1 || job.salaire?.complement2) && (
                  <div className="mt-2">
                    <ul className="list-disc list-inside text-gray-600 text-sm">
                      {job.salaire.complement1 && <li>{job.salaire.complement1}</li>}
                      {job.salaire.complement2 && <li>{job.salaire.complement2}</li>}
                    </ul>
                  </div>
                )}
              </dd>
            </div>
            
            {/* Description */}
            <div className="bg-white px-4 py-5 sm:px-6">
              <dt className="text-base font-medium text-gray-900 mb-3">Description du poste</dt>
              <dd className="mt-2 text-sm text-gray-900 prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: job.description?.replace(/\n/g, '<br />') || 'Aucune description disponible' }} />
              </dd>
            </div>
            
            {/* Contact et candidature */}
            {job.contact && (
              <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <div className="mb-3">
                  <h3 className="text-base font-medium text-gray-900">Comment postuler</h3>
                  <p className="mt-1 text-sm text-gray-500">Utilisez les informations de contact ci-dessous pour candidater à cette offre</p>
                </div>
                <div className="mt-4 border border-gray-200 rounded-md bg-white p-4">
                  {job.contact.nom && (
                    <p className="text-sm mb-2">
                      <span className="font-medium">Personne à contacter :</span> {job.contact.nom}
                    </p>
                  )}
                  {job.contact.telephone && (
                    <p className="text-sm mb-2">
                      <span className="font-medium">Téléphone :</span> 
                      <a href={`tel:${job.contact.telephone}`} className="ml-1 text-ft-blue hover:underline">
                        {job.contact.telephone}
                      </a>
                    </p>
                  )}
                  {job.contact.courriel && (
                    <p className="text-sm mb-2">
                      <span className="font-medium">Email :</span> 
                      <a href={`mailto:${job.contact.courriel}`} className="ml-1 text-ft-blue hover:underline">
                        {job.contact.courriel}
                      </a>
                    </p>
                  )}
                  {job.contact.urlPostulation && (
                    <div className="mt-3">
                      <a 
                        href={job.contact.urlPostulation} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-ft-blue hover:bg-ft-darkblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ft-blue"
                      >
                        Postuler en ligne
                      </a>
                    </div>
                  )}
                  {job.contact.commentaire && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
                      <p className="font-medium mb-1">Informations supplémentaires :</p>
                      <p className="whitespace-pre-wrap">
                        {job.contact.commentaire.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
                          if (part.match(/^https?:\/\//)) {
                            return (
                              <a
                                key={index}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-ft-blue hover:underline break-all"
                              >
                                {part}
                              </a>
                            );
                          }
                          return part;
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ft-blue"
        >
          Retour à la recherche
        </Link>
      </div>
    </div>
  );
};

export default JobDetailsPage;