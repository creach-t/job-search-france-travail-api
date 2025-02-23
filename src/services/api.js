import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const searchJobs = async (searchParams) => {
  try {
    const response = await api.post('/jobs/search', searchParams);
    console.log('API Response:', response.data); // Pour le débogage
    return response.data || [];
  } catch (error) {
    console.error('Erreur lors de la recherche d\'emplois:', error);
    throw new Error('Impossible de rechercher les offres d\'emploi. Veuillez réessayer.');
  }
};

export const getJobById = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du job:', error);
    throw new Error('Impossible de récupérer les détails de l\'offre. Veuillez réessayer.');
  }
};
