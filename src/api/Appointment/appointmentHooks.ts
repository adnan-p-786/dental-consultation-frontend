import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  appointmentApi,
  type AppointmentFilterParams,
  type SendReminderPayload,
} from "./appointmentApi";
import { queryKeys } from "../queryKeys";

export const useAppointmentsQuery = () => {
  return useQuery({
    queryKey: queryKeys.appointments.all,
    queryFn: appointmentApi.getAll,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const usePatientAppointmentsQuery = (
  filters: AppointmentFilterParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: queryKeys.appointments.patient(filters),
    queryFn: () => appointmentApi.getPatientAppointments(filters),
    enabled: enabled && Boolean(filters.email || filters.phone || filters.name),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData | Record<string, any>) => appointmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
};

export const useUpdateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Record<string, any> }) =>
      appointmentApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};

export const useCancelAppointmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => appointmentApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
};

export const useSendReminderMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: SendReminderPayload }) =>
      appointmentApi.sendReminder(id, payload),
  });
};

export const useDeleteAppointmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => appointmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
};
