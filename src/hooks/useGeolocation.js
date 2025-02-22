import { useState, useEffect } from 'react';
import { getCurrentPosition } from '../services/geolocationService';

// Hook pour gérer la géolocalisation de l'utilisateur
export const useGeolocation = () => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestGeolocation = () => {
    setLoading(true);
    setError(null);
    
    getCurrentPosition()
      .then((coords) => {
        setPosition(coords);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  return { position, loading, error, requestGeolocation };
};

export default useGeolocation;
