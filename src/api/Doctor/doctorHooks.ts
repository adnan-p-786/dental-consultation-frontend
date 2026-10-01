import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doctorApi, type DoctorDbRecord } from "./doctorApi";
import { queryKeys } from "../queryKeys";

export const useDoctorsQuery = () => {
  return useQuery({
    queryKey: queryKeys.doctors.all,
    queryFn: doctorApi.getAll,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAddDoctorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData | Partial<DoctorDbRecord>) => doctorApi.addDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all });
    },
  });
};

export const useUpdateDoctorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: FormData | Partial<DoctorDbRecord> }) =>
      doctorApi.updateDoctor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all });
    },
  });
};

export const useUpdateDoctorStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: "available" | "busy" | "on_leave" }) =>
      doctorApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all });
    },
  });
};

export const useDeleteDoctorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => doctorApi.deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all });
    },
  });
};
