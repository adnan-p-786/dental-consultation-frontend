import { apiClient } from "../Api";

export interface ClinicSettings {
  id?: number;
  clinicName: string;
  supportEmail: string;
  clinicPhone: string;
  defaultDuration: number;
  meetingProvider: string;
  manualMeetingLink: string;
  instantAckEnabled?: boolean;
  reminder24hEnabled?: boolean;
  reminder24hHours?: number;
  reminder1hEnabled?: boolean;
  reminder1hMinutes?: number;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  updatedAt?: string;
}

export interface TriggerReminderInput {
  reminderType: "24_hour" | "1_hour";
  customHours?: number;
}

export interface TriggerReminderResponse {
  success: boolean;
  message: string;
  results?: any;
}

export const settingApi = {
  get: async (): Promise<ClinicSettings> => {
    const res = await apiClient.get<{ success: boolean; data: ClinicSettings }>("/settings");
    return res.data.data;
  },

  update: async (payload: Partial<ClinicSettings>): Promise<ClinicSettings> => {
    const res = await apiClient.put<{ success: boolean; data: ClinicSettings }>("/settings", payload);
    return res.data.data;
  },

  triggerReminders: async (payload: TriggerReminderInput): Promise<TriggerReminderResponse> => {
    const res = await apiClient.post<TriggerReminderResponse>("/appointment/trigger-reminders", payload);
    return res.data;
  },
};

export const settingsApi = settingApi;
export default settingApi;
