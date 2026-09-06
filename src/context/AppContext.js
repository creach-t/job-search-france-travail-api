import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [savedJobs, setSavedJobs] = useState([]);

  // Recherche persistante (survit aux navigations vers /carte, /tendances, détail…)
  const [homeSearchParams, setHomeSearchParams] = useState(() => {
    try {
      const s = sessionStorage.getItem('lastSearchParams');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  // Chargement initial des favoris
  useEffect(() => {
    try {
      const storedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setSavedJobs(storedJobs);
    } catch {
      setSavedJobs([]);
    }
  }, []);

  const persist = (jobs) => {
    setSavedJobs(jobs);
    try { localStorage.setItem('savedJobs', JSON.stringify(jobs)); } catch {}
  };

  const saveJob        = (job)   => persist([...savedJobs, job]);
  const removeJob      = (jobId) => persist(savedJobs.filter(j => j.id !== jobId));
  const clearSavedJobs = ()      => persist([]);
  const isJobSaved     = (jobId) => savedJobs.some(j => j.id === jobId);

  const updateHomeSearchParams = (params) => {
    setHomeSearchParams(params);
    try { sessionStorage.setItem('lastSearchParams', JSON.stringify(params)); } catch {}
  };

  return (
    <AppContext.Provider value={{
      savedJobs,
      saveJob,
      removeJob,
      clearSavedJobs,
      isJobSaved,
      homeSearchParams,
      updateHomeSearchParams,
      // Compat héritée : l'app est désormais 100 % généraliste (plus de mode dev)
      isDevMode: false,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
