import { useQuery } from '@tanstack/react-query';
import { lookupEntreprise, lookupEntreprisesBulk } from '../services/entrepriseService';

/**
 * Enrichissement INSEE d'une entreprise (nom + code postal).
 * `enabled` permet de déclencher la requête paresseusement (ex: à l'ouverture
 * d'un popover) pour ne pas marteler l'API.
 */
export const useEntreprise = ({ nom, codePostal } = {}, enabled = true) => {
  return useQuery(
    ['entreprise', nom, codePostal],
    () => lookupEntreprise({ nom, codePostal }),
    {
      enabled: Boolean(enabled && nom && nom.trim().length >= 2),
      staleTime: 24 * 60 * 60 * 1000, // 24 h (aligné sur le cache serveur)
      cacheTime: 24 * 60 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );
};

/**
 * Enrichissement en masse pour l'analyse (top recruteurs).
 */
export const useEntreprisesBulk = (companies = [], enabled = true) => {
  const key = companies.map((c) => `${c.nom}@${c.codePostal || ''}`).join('|');
  return useQuery(
    ['entreprises-bulk', key],
    () => lookupEntreprisesBulk(companies),
    {
      enabled: Boolean(enabled && companies.length > 0),
      staleTime: 24 * 60 * 60 * 1000,
      cacheTime: 24 * 60 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );
};
