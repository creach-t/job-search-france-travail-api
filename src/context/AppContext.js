import React, { createContext, useContext, useState, useEffect } from 'react';

// Création du contexte
const AppContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useAppContext = () => useContext(AppContext);

// Fournisseur du contexte
export const AppProvider = ({ children }) => {
  const [savedJobs, setSavedJobs] = useState([]);

  // Chargement des offres sauvegardées depuis le localStorage au chargement
  useEffect(() => {
    try {
      const storedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setSavedJobs(storedJobs);
    } catch (error) {
      console.error('Erreur lors du chargement des offres sauvegardées:', error);
      setSavedJobs([]);
    }
  }, []);

  // Fonction pour sauvegarder une offre
  const saveJob = (job) => {
    const updatedJobs = [...savedJobs, job];
    setSavedJobs(updatedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
  };

  // Fonction pour supprimer une offre sauvegardée
  const removeJob = (jobId) => {
    const updatedJobs = savedJobs.filter(job => job.id !== jobId);
    setSavedJobs(updatedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
  };

  // Vérifier si une offre est sauvegardée
  const isJobSaved = (jobId) => {
    return savedJobs.some(job => job.id === jobId);
  };

  // Valeur fournie par le contexte
  const value = {
    savedJobs,
    saveJob,
    removeJob,
    isJobSaved
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
