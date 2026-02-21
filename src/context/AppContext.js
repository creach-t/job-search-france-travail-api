import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [isDevMode, setIsDevMode] = useState(() => {
    try {
      const stored = localStorage.getItem('devJobsMode');
      return stored === null ? true : stored === 'true';
    } catch { return true; }
  });

  const [homeSearchParams, setHomeSearchParams] = useState(() => {
    try {
      const s = sessionStorage.getItem('lastSearchParams');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  // prevIsDevMode initialisé avec la valeur courante → pas de reset au premier rendu
  const prevIsDevMode = useRef(isDevMode);
  useEffect(() => {
    if (prevIsDevMode.current !== isDevMode) {
      prevIsDevMode.current = isDevMode;
      setHomeSearchParams(null);
      try { sessionStorage.removeItem('lastSearchParams'); } catch {}
    }
  }, [isDevMode]);

  // Chargement initial depuis localStorage
  useEffect(() => {
    try {
      const storedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setSavedJobs(storedJobs);
    } catch {
      setSavedJobs([]);
    }
  }, []);

  // Helper : met à jour l'état ET localStorage en une fois
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

  const toggleDevMode = () => {
    setIsDevMode(prev => {
      const next = !prev;
      try { localStorage.setItem('devJobsMode', String(next)); } catch {}
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      savedJobs,
      saveJob,
      removeJob,
      clearSavedJobs,
      isJobSaved,
      isDevMode,
      toggleDevMode,
      homeSearchParams,
      updateHomeSearchParams,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
