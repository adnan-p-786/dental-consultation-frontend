import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { consultationApi, type ConsultationPayload } from "./consultationApi";
import { queryKeys } from "../queryKeys";

export const useConsultationByAppointmentQuery = (appointmentId: string | number | undefined) => {
  return useQuery({
    queryKey: queryKeys.consultations.byAppointment(appointmentId ?? ""),
    queryFn: () => (appointmentId ? consultationApi.getByAppointmentId(appointmentId) : null),
    enabled: Boolean(appointmentId),
    staleTime: 1000 * 60 * 2,
  });
};

export const useSaveConsultationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConsultationPayload) => consultationApi.createOrUpdate(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.consultations.byAppointment(variables.appointmentId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    },
  });
};
