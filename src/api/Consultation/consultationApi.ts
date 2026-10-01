import { apiClient } from "../Api";

export interface ConsultationPayload {
  appointmentId: number;
  patientId?: number | null;
  doctorId?: number | null;
  chiefComplaint?: string;
  consultationFindings?: string;
  diagnosis?: string;
  recommendedTreatment?: string;
  additionalInstructions?: string;
  followUpRequired?: boolean;
  followUpDate?: string | null;
  internalNotes?: string;
  isCompleted?: boolean;
}

export interface ConsultationRecord {
  id: number;
  appointmentId: number;
  doctorId: number;
  patientId?: number | null;
  chiefComplaint?: string | null;
  consultationFindings?: string | null;
  diagnosis?: string | null;
  recommendedTreatment?: string | null;
  additionalInstructions?: string | null;
  followUpRequired?: boolean;
  followUpDate?: string | null;
  internalNotes?: string | null;
  isCompleted?: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const consultationApi = {
  async getByAppointmentId(appointmentId: string | number): Promise<ConsultationRecord | null> {
    const res = await apiClient.get<{ success: boolean; data?: ConsultationRecord }>(
      `/consultations/appointment/${appointmentId}`
    );
    return res.data?.data || null;
  },

  async getMyConsultations(): Promise<ConsultationRecord[]> {
    const res = await apiClient.get<{ success: boolean; data?: ConsultationRecord[] }>("/consultations/me");
    return res.data?.data || [];
  },

  async createOrUpdate(payload: ConsultationPayload): Promise<ConsultationRecord> {
    const res = await apiClient.post<{ success: boolean; data: ConsultationRecord; message?: string }>(
      "/consultations",
      payload
    );
    return res.data.data;
  },

  async update(id: number | string, payload: Partial<ConsultationPayload>): Promise<ConsultationRecord> {
    const res = await apiClient.put<{ success: boolean; data: ConsultationRecord; message?: string }>(
      `/consultations/${id}`,
      payload
    );
    return res.data.data;
  },
};

export const consultationsApi = consultationApi;
export default consultationApi;
