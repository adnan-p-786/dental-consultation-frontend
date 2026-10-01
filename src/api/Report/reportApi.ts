import { apiClient } from "../Api";

export interface AnalyticsMetrics {
  totalAppointments: number;
  completedConsultations: number;
  approvedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  onlineConsultations: number;
  completionRate: number;
  cancelRate: number;
  appointmentsByTreatment: Array<{
    treatment: string;
    count: number;
    percentage: number;
  }>;
  appointmentsByDoctor: Array<{
    doctorName: string;
    count: number;
    percentage: number;
  }>;
  appointmentsByMonth: Array<{
    month: string;
    label: string;
    total: number;
    completed: number;
    cancelled: number;
  }>;
  appointmentStatusStatistics: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface AnalyticsResponseData {
  metrics: AnalyticsMetrics;
  appointments: any[];
}

export interface SavedReport {
  id: number;
  title: string;
  reportType: string;
  description?: string | null;
  filters?: any;
  metrics: AnalyticsMetrics;
  createdAt: string;
}

export interface ReportFilterParams {
  search?: string;
  doctor?: string;
  treatment?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  month?: string;
}

export interface SaveReportSnapshotInput {
  title: string;
  description?: string;
  reportType?: string;
  filters?: Record<string, any>;
  customMetrics?: AnalyticsMetrics | null;
}

export const reportApi = {
  getAnalytics: async (filters?: ReportFilterParams): Promise<AnalyticsResponseData> => {
    const params: Record<string, string> = {};
    if (filters?.search?.trim()) params.search = filters.search.trim();
    if (filters?.doctor && filters.doctor !== "all") params.doctor = filters.doctor;
    if (filters?.treatment && filters.treatment !== "all") params.treatment = filters.treatment;
    if (filters?.status && filters.status !== "all") params.status = filters.status;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.month) params.month = filters.month;

    const res = await apiClient.get<{ success: boolean; data: AnalyticsResponseData }>("/reports/analytics", {
      params,
    });
    return res.data.data;
  },

  getSavedReports: async (): Promise<SavedReport[]> => {
    const res = await apiClient.get<{ success: boolean; data: SavedReport[] }>("/reports");
    return res.data?.data || [];
  },

  saveSnapshot: async (payload: SaveReportSnapshotInput): Promise<SavedReport> => {
    const res = await apiClient.post<{ success: boolean; data: SavedReport }>("/reports/save", payload);
    return res.data.data;
  },

  deleteSnapshot: async (id: number): Promise<void> => {
    await apiClient.delete(`/reports/${id}`);
  },

  exportCsv: async (filters?: ReportFilterParams): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.search?.trim()) params.append("search", filters.search.trim());
    if (filters?.doctor && filters.doctor !== "all") params.append("doctor", filters.doctor);
    if (filters?.treatment && filters.treatment !== "all") params.append("treatment", filters.treatment);
    if (filters?.status && filters.status !== "all") params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const res = await apiClient.get(`/reports/export?${params.toString()}`, {
      responseType: "blob",
    });
    return res.data;
  },
};

export const reportsApi = reportApi;
export default reportApi;
