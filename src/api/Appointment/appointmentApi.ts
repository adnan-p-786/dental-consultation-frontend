import { apiClient } from "../Api";
import { appointmentService } from "@/lib/appointmentService";
import type { Appointment } from "@/admin/types";

export interface AppointmentFilterParams {
  email?: string;
  phone?: string;
  name?: string;
  status?: string;
}

export interface SendReminderPayload {
  reminderType: "24_hour" | "1_hour";
  assignedDoctorName?: string;
  meetingLink?: string;
}

export const appointmentApi = {
  /**
   * Fetch all appointments from database and map to rich frontend Appointment types
   */
  async getAll(): Promise<Appointment[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>(
      "/appointment/get-all-appointment"
    );

    if (res.data?.success && Array.isArray(res.data.data)) {
      const localApts = appointmentService.getAppointments();
      const localMap = new Map<string, Appointment>();
      localApts.forEach((apt) => localMap.set(String(apt.id), apt));

      const mapped: Appointment[] = res.data.data.map((dbRecord: any) => {
        const existingLocal = localMap.get(String(dbRecord.id));
        return appointmentService.mapDbRecord(dbRecord, existingLocal);
      });

      // Save fresh DB appointments to localStorage cache without firing notification loop
      appointmentService.saveAppointments(mapped, false);
      return mapped;
    }

    return appointmentService.getAppointments();
  },

  /**
   * Search / filter patient appointments from backend
   */
  async getPatientAppointments(filters: AppointmentFilterParams): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters.email) params.append("email", filters.email);
    if (filters.phone) params.append("phone", filters.phone);
    if (filters.name) params.append("name", filters.name);
    if (filters.status) params.append("status", filters.status);

    const res = await apiClient.get<{ success: boolean; data: any[] }>(
      `/appointment/get-appointments?${params.toString()}`
    );

    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((b: any) => appointmentService.mapDbRecord(b));
    }
    return [];
  },

  /**
   * Create an appointment (supports FormData for supporting document file upload)
   */
  async create(data: FormData | Record<string, any>): Promise<any> {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const res = await apiClient.post("/appointment/create-appointment", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data;
  },

  /**
   * Update an appointment by ID
   */
  async update(id: string | number, payload: Record<string, any>): Promise<any> {
    const res = await apiClient.patch(`/appointment/update-appointment/${id}`, payload);
    return res.data;
  },

  /**
   * Cancel an appointment by ID
   */
  async cancel(id: string | number): Promise<any> {
    const res = await apiClient.patch(`/appointment/cancel-appointment/${id}`);
    return res.data;
  },

  /**
   * Send appointment email reminder
   */
  async sendReminder(id: string | number, payload: SendReminderPayload): Promise<any> {
    const res = await apiClient.post(`/appointment/send-reminder/${id}`, payload);
    return res.data;
  },

  /**
   * Delete an appointment by ID
   */
  async delete(id: string | number): Promise<any> {
    const res = await apiClient.delete(`/appointment/delete-appointment/${id}`);
    return res.data;
  },
};

export const appointmentsApi = appointmentApi;
export default appointmentApi;
