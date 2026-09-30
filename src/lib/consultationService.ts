import type { ConsultationNotes } from "@/admin/types";

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

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("dental_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const consultationService = {
  /**
   * Create or update consultation on backend
   */
  async createConsultation(payload: ConsultationPayload): Promise<{
    success: boolean;
    data?: ConsultationRecord;
    message?: string;
    error?: string;
  }> {
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.error("Failed to create consultation:", err);
      return {
        success: false,
        error: err.message || "Failed to create consultation",
      };
    }
  },

  /**
   * Update existing consultation by ID
   */
  async updateConsultation(
    id: number,
    payload: Partial<ConsultationPayload>,
  ): Promise<{
    success: boolean;
    data?: ConsultationRecord;
    message?: string;
    error?: string;
  }> {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      console.error(`Failed to update consultation #${id}:`, err);
      return {
        success: false,
        error: err.message || "Failed to update consultation",
      };
    }
  },

  /**
   * Get consultation for a specific appointment
   */
  async getConsultationByAppointment(appointmentId: number): Promise<{
    success: boolean;
    data?: ConsultationRecord;
    error?: string;
  }> {
    try {
      const res = await fetch(
        `/api/consultations/appointment/${appointmentId}`,
        {
          headers: getAuthHeaders(),
        },
      );
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to fetch consultation",
      };
    }
  },

  /**
   * High level helper: Saves consultation notes to backend.
   * Dispatches to POST /api/consultations (which performs upsert if already existing).
   */
  async saveOrCompleteConsultation(options: {
    appointmentId: number | string;
    notes: ConsultationNotes;
    isCompleted: boolean;
    doctorId?: number;
    patientId?: number;
  }): Promise<{
    success: boolean;
    data?: ConsultationRecord;
    error?: string;
  }> {
    const numApptId = Number(options.appointmentId);
    if (isNaN(numApptId)) {
      return { success: false, error: "Invalid appointment ID" };
    }

    const payload: ConsultationPayload = {
      appointmentId: numApptId,
      patientId: options.patientId,
      doctorId: options.doctorId,
      chiefComplaint: options.notes.chiefComplaint,
      consultationFindings: options.notes.findings,
      diagnosis: options.notes.diagnosis,
      recommendedTreatment: options.notes.recommendedTreatment,
      additionalInstructions: options.notes.additionalInstructions,
      followUpRequired: Boolean(options.notes.followUpRequirements?.trim()),
      internalNotes: options.notes.internalNotes,
      isCompleted: options.isCompleted,
    };

    return await this.createConsultation(payload);
  },
};
