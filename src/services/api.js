import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour la gestion globale des erreurs
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.error || 'Une erreur est survenue';
    console.error('API Error:', error);
    throw new Error(errorMessage);
  }
);

// Fonction helper pour la gestion des réponses
const handleResponse = (response) => {
  if (!response.data) {
    throw new Error('Réponse invalide du serveur');
  }
  return response.data;
};

export const searchJobs = async (searchParams) => {
  try {
    const response = await api.post('/jobs/search', searchParams);
    return handleResponse(response);
  } catch (error) {
    throw new Error('Impossible de rechercher les offres d\'emploi. ' + error.message);
  }
};

export const getJobById = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return handleResponse(response);
  } catch (error) {
    throw new Error('Impossible de récupérer les détails de l\'offre. ' + error.message);
  }
};

export const saveJob = async (jobId) => {
  try {
    const response = await api.post(`/jobs/${jobId}/save`);
    return handleResponse(response);
  } catch (error) {
    throw new Error('Impossible de sauvegarder l\'offre. ' + error.message);
  }
};

export const applyToJob = async (jobId) => {
  try {
    const response = await api.post(`/jobs/${jobId}/apply`);
    return handleResponse(response);
  } catch (error) {
    throw new Error('Impossible de postuler à l\'offre. ' + error.message);
  }
};