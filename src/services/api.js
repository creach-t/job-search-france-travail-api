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
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche d\'emplois:', error);
    throw new Error('Impossible de rechercher les offres d\'emploi. Veuillez réessayer.');
  }
};
