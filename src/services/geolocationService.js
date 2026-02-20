import axios from 'axios';

// Service pour la géolocalisation via le navigateur et la recherche de commune par coordonnées

/**
 * Obtenir la position actuelle de l'utilisateur via l'API du navigateur
 * @returns {Promise<{latitude: number, longitude: number}>} Coordonnées de l'utilisateur
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation inconnue';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Vous avez refusé la demande de géolocalisation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Impossible de déterminer votre position';
            break;
          case error.TIMEOUT:
            errorMessage = 'La demande de géolocalisation a expiré';
            break;
          default:
            break;
        }
        
        reject(new Error(errorMessage));
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};

/**
 * Trouver la commune la plus proche des coordonnées GPS données
 * @param {number} latitude - Latitude de l'utilisateur
 * @param {number} longitude - Longitude de l'utilisateur
 * @returns {Promise<Object>} - La commune trouvée avec son code INSEE
 */
export const findCommuneByCoordinates = async (latitude, longitude) => {
  try {
    // Utiliser l'API geo.api.gouv.fr pour trouver la commune à partir des coordonnées
    const response = await axios.get(`https://geo.api.gouv.fr/communes`, {
      params: {
        lat: latitude,
        lon: longitude,
        fields: 'nom,code,codesPostaux,population',
        format: 'json'
      }
    });

    if (response.data && response.data.length > 0) {
      // Retourner la première commune trouvée (la plus proche)
      return {
        code: response.data[0].code,
        nom: response.data[0].nom,
        codesPostaux: response.data[0].codesPostaux || [],
        population: response.data[0].population
      };
    }
    
    throw new Error('Aucune commune trouvée à proximité');
  } catch (error) {
    console.error('Erreur lors de la recherche de commune par coordonnées:', error);
    throw error;
  }
};

const geolocationService = {
  getCurrentPosition,
  findCommuneByCoordinates
};

export default geolocationService;
