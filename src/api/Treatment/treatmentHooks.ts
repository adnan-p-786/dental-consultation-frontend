import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentApi } from "./treatmentApi";
import { queryKeys } from "../queryKeys";


/** Query all treatments (admin view) */
export const useTreatmentsQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.treatments.all,
    queryFn: treatmentApi.getAll,
    staleTime: 1000 * 60 * 5, // Treatments change infrequently; cache for 5 minutes
    ...options,
  });
};

/** Query only active treatments (for booking & doctor assignment dropdowns) */
export const useActiveTreatmentsQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.treatments.active,
    queryFn: treatmentApi.getActive,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

/** Create a new treatment */
export const useCreateTreatmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: treatmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.treatments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.treatments.active });
    },
  });
};

/** Update an existing treatment */
export const useUpdateTreatmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: treatmentApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.treatments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.treatments.active });
    },
  });
};

/** Toggle treatment active/inactive status */
export const useToggleTreatmentStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: treatmentApi.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.treatments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.treatments.active });
    },
  });
};

/** Delete a treatment */
export const useDeleteTreatmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: treatmentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.treatments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.treatments.active });
    },
  });
};
