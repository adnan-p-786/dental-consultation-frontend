import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingApi, type TriggerReminderInput } from "./settingApi";
import { queryKeys } from "../queryKeys";

/** Query clinic and notification settings */
export const useSettingsQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.settings.current,
    queryFn: settingApi.get,
    staleTime: 1000 * 60 * 5, // Settings rarely change during a session
    ...options,
  });
};

/** Mutation to update clinic and reminder settings */
export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingApi.update,
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.settings.current, updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.current });
    },
  });
};

/** Mutation to test/trigger reminder batch dispatch */
export const useTriggerRemindersMutation = () => {
  return useMutation({
    mutationFn: (payload: TriggerReminderInput) => settingApi.triggerReminders(payload),
  });
};
