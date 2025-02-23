import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchJobs, saveJob, applyToJob } from '../services/api';

export const useJobSearch = (searchParams = {}) => {
  return useQuery({
    queryKey: ['jobs', searchParams],
    queryFn: () => searchJobs(searchParams),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveJob,
    onSuccess: () => {
      queryClient.invalidateQueries(['savedJobs']);
    }
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyToJob,
    onSuccess: () => {
      queryClient.invalidateQueries(['appliedJobs']);
    }
  });
};