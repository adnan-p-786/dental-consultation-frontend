import { apiClient } from "../Api";

export interface TreatmentItem {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateTreatmentInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTreatmentInput {
  id: number;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const treatmentApi = {
  getAll: async (): Promise<TreatmentItem[]> => {
    const res = await apiClient.get<{ success: boolean; data: TreatmentItem[] }>("/treatment");
    return res.data?.data || [];
  },

  getActive: async (): Promise<TreatmentItem[]> => {
    const res = await apiClient.get<{ success: boolean; data: TreatmentItem[] }>("/treatment/active");
    return res.data?.data || [];
  },

  create: async (payload: CreateTreatmentInput): Promise<TreatmentItem> => {
    const res = await apiClient.post<{ success: boolean; data: TreatmentItem }>("/treatment", payload);
    return res.data.data;
  },

  update: async ({ id, ...payload }: UpdateTreatmentInput): Promise<TreatmentItem> => {
    const res = await apiClient.put<{ success: boolean; data: TreatmentItem }>(`/treatment/${id}`, payload);
    return res.data.data;
  },

  toggleStatus: async (id: number): Promise<TreatmentItem> => {
    const res = await apiClient.patch<{ success: boolean; data: TreatmentItem }>(`/treatment/toggle-status/${id}`);
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/treatment/${id}`);
  },
};

export const treatmentsApi = treatmentApi;
export default treatmentApi;
