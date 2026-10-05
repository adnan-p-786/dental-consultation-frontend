import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi, type LoginPayload, type RegisterPayload, type PatientRecord } from "./userApi";
import { queryKeys } from "../queryKeys";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => userApi.login(payload),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => userApi.register(payload),
  });
};

export const usePatientsQuery = () => {
  return useQuery<PatientRecord[]>({
    queryKey: queryKeys.users.patients,
    queryFn: () => userApi.getPatients(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useDeletePatientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userApi.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.patients });
    },
  });
};

