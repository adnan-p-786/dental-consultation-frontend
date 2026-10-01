import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportApi, type ReportFilterParams } from "./reportApi";
import { queryKeys } from "../queryKeys";


/** Query real-time analytics for current filters */
export const useReportAnalyticsQuery = (
  filters?: ReportFilterParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.reports.analytics(filters),
    queryFn: () => reportApi.getAnalytics(filters),
    staleTime: 1000 * 60 * 1, // 1 minute fresh cache
    ...options,
  });
};

/** Query all saved report snapshots */
export const useSavedReportsQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.reports.saved,
    queryFn: reportApi.getSavedReports,
    staleTime: 1000 * 60 * 3,
    ...options,
  });
};

/** Mutation to save a report snapshot */
export const useSaveReportSnapshotMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportApi.saveSnapshot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.saved });
    },
  });
};

/** Mutation to delete a saved report snapshot */
export const useDeleteReportSnapshotMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportApi.deleteSnapshot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.saved });
    },
  });
};
