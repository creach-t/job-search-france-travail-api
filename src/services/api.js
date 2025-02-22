import axios from 'axios';

// Token management
let accessToken = null;
let tokenExpiration = 0;

// Fonction pour obtenir un token OAuth 2.0 valide
const getAccessToken = async () => {
  const currentTime = Date.now();
  
  // Si le token existe et est encore valide (avec une marge de 5 minutes)
  if (accessToken && tokenExpiration > currentTime + 300000) {
    return accessToken;
  }
  
  try {
    // Configuration pour le flux Client Credentials d'OAuth 2.0
    // Utilisation du chemin relatif pour éviter les problèmes CORS
    const tokenUrl = '/connexion/oauth2/access_token?realm=%2Fpartenaire';
    
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', process.env.REACT_APP_CLIENT_ID);
    params.append('client_secret', process.env.REACT_APP_CLIENT_SECRET);
    params.append('scope', 'api_offresdemploiv2');
    
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });
    
    // Stocker le token et calculer son expiration
    accessToken = response.data.access_token;
    tokenExpiration = currentTime + (response.data.expires_in * 1000) - 60000; // Soustraire 1 minute pour être sûr
    
    return accessToken;
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token OAuth:', error);
    throw new Error('Échec de l\'authentification OAuth 2.0');
  }
};

// Création d'une instance Axios avec la configuration de base pour les offres d'emploi
// Notez qu'on utilise l'URL complète ici car c'est un domaine différent de celui de l'authentification
const api = axios.create({
  baseURL: 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Limites strictes pour éviter les erreurs 431
  maxContentLength: 2 * 1024 * 1024, // 2 MB
  maxBodyLength: 2 * 1024 * 1024, // 2 MB
  maxRedirects: 3, 
  timeout: 10000 // 10 secondes
});

// Intercepteur de requête ultra-minimaliste avec authentification OAuth 2.0
api.interceptors.request.use(
  async config => {
    try {
      // Obtenir un token OAuth 2.0 valide
      const token = await getAccessToken();
      
      // Simplification radicale des en-têtes
      config.headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      // Limiter strictement la taille des paramètres
      if (config.params) {
        Object.keys(config.params).forEach(key => {
          if (typeof config.params[key] === 'string' && config.params[key].length > 25) {
            config.params[key] = config.params[key].substring(0, 25);
          }
        });
        
        // Limiter le nombre de paramètres aux paramètres autorisés
        const allowedParams = [
          // Paramètres de base
          'motsCles', 'commune', 'distance', 'experience', 'typeContrat', 'sort', 'range', 'publieeDepuis',
          // Paramètres supplémentaires utiles
          'departement', 'qualification', 'tempsPlein', 'dureeHebdo', 'codeROME', 'niveauFormation'
        ];
        
        Object.keys(config.params).forEach(key => {
          if (!allowedParams.includes(key)) {
            delete config.params[key];
          }
        });
      }
      
      return config;
    } catch (error) {
      console.error('Erreur lors de la préparation de la requête:', error);
      return Promise.reject(error);
    }
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de manière globale
api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    // Log des erreurs en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }
    
    if (response) {
      // Erreurs avec réponse du serveur
      switch (response.status) {
        case 400:
          error.message = 'Requête incorrecte. Veuillez vérifier vos paramètres.';
          break;
        case 401:
          // Réinitialiser le token en cas d'erreur d'authentification
          accessToken = null;
          error.message = 'Non autorisé. Identifiants OAuth 2.0 invalides.';
          break;
        case 403:
          error.message = 'Accès refusé.';
          break;
        case 404:
          error.message = 'Ressource non trouvée.';
          break;
        case 429:
          error.message = 'Trop de requêtes. Veuillez réessayer plus tard.';
          break;
        case 431:
          error.message = 'Erreur 431: Request Header Fields Too Large';
          break;
        case 500:
          error.message = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          error.message = `Erreur ${response.status}: ${response.statusText}`;
      }
    } else {
      // Erreurs sans réponse (réseau, timeout, etc.)
      error.message = 'Erreur réseau. Vérifiez votre connexion.';
    }
    
    return Promise.reject(error);
  }
);

// Service optimisé pour la recherche d'offres d'emploi avec plus de paramètres
export const searchJobs = async (params) => {
  // Extraction des paramètres de recherche
  const {
    keywords,
    location,
    distance,
    experience,
    contractType,
    qualification,     // Paramètre pour cadre/non-cadre
    workingHours,      // Paramètre pour temps plein/partiel
    department,        // Paramètre optionnel: département
    romeCode,          // Paramètre optionnel: code ROME spécifique
    educationLevel     // Paramètre optionnel: niveau de formation
  } = params;
  
  // Construire les paramètres de base (minimalistes)
  const queryParams = {
    motsCles: keywords ? keywords.substring(0, 20) : 'dev',
    sort: 1,
    range: '0-9', // Légèrement plus de résultats (0-9 au lieu de 0-5)
    publieeDepuis: 31
  };
  
  // Ajouter les paramètres de base
  if (location && location.trim()) {
    queryParams.commune = location.substring(0, 20);
  }
  
  if (distance) {
    queryParams.distance = distance;
  }
  
  if (experience) {
    queryParams.experience = experience;
  }
  
  if (contractType) {
    queryParams.typeContrat = contractType;
  }
  
  // Ajouter les paramètres supplémentaires s'ils sont fournis
  if (qualification) {
    queryParams.qualification = qualification; // "0" pour non-cadre, "9" pour cadre
  }
  
  if (workingHours) {
    queryParams.dureeHebdo = workingHours; // "1" (temps plein), "2" (temps partiel)
  }
  
  if (department) {
    queryParams.departement = department;
  }
  
  if (romeCode) {
    queryParams.codeROME = romeCode;
  }
  
  if (educationLevel) {
    queryParams.niveauFormation = educationLevel;
  }
  
  try {
    // Méthode HTTP simple
    const response = await api.get('/search', { 
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error.message);
    throw error;
  }
};

// Service simplifié pour récupérer une offre d'emploi par son ID
export const getJobById = async (jobId) => {
  if (!jobId) {
    throw new Error('ID de l\'offre d\'emploi requis');
  }
  
  try {
    const response = await api.get(`/${jobId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;