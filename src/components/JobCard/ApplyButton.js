import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Composant de bouton de postulation
 * 
 * @param {Object} job - Détails de l'offre d'emploi
 * @param {boolean} isDetailed - Afficher en mode détaillé ou non
 */
const ApplyButton = ({ job, isDetailed = false }) => {
  const [showModal, setShowModal] = useState(false);
  
  // Vérifier si l'offre a un URL de postulation ou un email
  const hasDirectApply = job?.contact?.urlPostulation;
  const hasEmailApply = job?.contact?.courriel;
  const hasPhoneApply = job?.contact?.telephone;
  
  const handleApplyClick = () => {
    if (hasDirectApply) {
      // Ouvrir l'URL dans un nouvel onglet
      window.open(job.contact.urlPostulation, '_blank');
    } else {
      // Afficher la modal avec les informations de contact
      setShowModal(true);
    }
  };
  
  const closeModal = () => setShowModal(false);
  
  // Style du bouton en fonction du mode (détaillé ou non)
  const buttonClassName = isDetailed
    ? "w-full py-3 px-4 bg-ft-blue hover:bg-ft-darkblue text-white font-medium rounded-md shadow-sm transition-colors"
    : "py-2 px-3 bg-ft-blue hover:bg-ft-darkblue text-white text-sm font-medium rounded-md shadow-sm transition-colors";
  
  return (
    <>
      <button 
        onClick={handleApplyClick}
        className={buttonClassName}
        disabled={!hasDirectApply && !hasEmailApply && !hasPhoneApply}
      >
        {isDetailed ? 'Postuler à cette offre' : 'Postuler'}
      </button>
      
      {/* Modal de contact pour postuler */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Comment postuler à cette offre
                  </h3>
                  
                  <div className="text-left">
                    {job?.contact?.nom && (
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Contact :</span> {job.contact.nom}
                      </p>
                    )}
                    
                    {hasEmailApply && (
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Email :</span> 
                        <a 
                          href={`mailto:${job.contact.courriel}`} 
                          className="ml-1 text-ft-blue hover:underline"
                        >
                          {job.contact.courriel}
                        </a>
                      </p>
                    )}
                    
                    {hasPhoneApply && (
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Téléphone :</span> 
                        <a 
                          href={`tel:${job.contact.telephone}`} 
                          className="ml-1 text-ft-blue hover:underline"
                        >
                          {job.contact.telephone}
                        </a>
                      </p>
                    )}
                    
                    {job?.contact?.commentaire && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
                        <p className="font-medium mb-1">Informations supplémentaires :</p>
                        <p>{job.contact.commentaire}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  className="w-full py-2 bg-gray-200 text-gray-800 font-medium rounded-md"
                  onClick={closeModal}
                >
                  Fermer
                </button>
                
                {hasEmailApply && (
                  <a
                    href={`mailto:${job.contact.courriel}?subject=Candidature pour le poste ${job.intitule}`}
                    className="w-full py-2 bg-ft-blue text-white font-medium rounded-md text-center"
                  >
                    Envoyer un email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyButton;
