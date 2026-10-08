import { apiClient } from "../Api";

export interface DayWorkingHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  hasBreak?: boolean;
  breakStart?: string;
  breakEnd?: string;
}

export interface DoctorAvailabilitySettings {
  defaultStatus: "available" | "busy" | "offline";
  maxParallelPerSlot: number;
  assignmentMode: "manual" | "round_robin" | "least_busy";
  autoBusyDuringCall: boolean;
  allowEmergencyOverride: boolean;
}

export interface EmailTemplateConfig {
  id: string;
  name: string;
  subject: string;
  enabled: boolean;
  bodySummary: string;
  customFooterNote?: string;
}

export interface AppointmentStatusConfig {
  key: string;
  label: string;
  color: string;
  description: string;
  patientCanCancel: boolean;
  autoExpireHours?: number;
  isActive: boolean;
}

export interface ConsultationTypeConfig {
  id: string;
  name: string;
  description: string;
  defaultDuration: number;
  isActive: boolean;
  requiresMeetingLink: boolean;
  badgeText: string;
}

export interface GeneralAppointmentSettings {
  minNoticeHours: number;
  maxAdvanceDays: number;
  allowSameDayBooking: boolean;
  cancellationCutoffHours: number;
  maxActivePerPatient: number;
  allowDocumentUpload: boolean;
  requireDocumentUpload: boolean;
  autoConfirmExistingPatients: boolean;
  bufferTimeMinutes?: number;
}

export interface ClinicSettings {
  id?: number;
  clinicName: string;
  supportEmail: string;
  clinicPhone: string;
  defaultDuration: number;
  bufferTimeMinutes?: number;
  meetingProvider: string;
  manualMeetingLink: string;
  instantAckEnabled?: boolean;
  reminder24hEnabled?: boolean;
  reminder24hHours?: number;
  reminder1hEnabled?: boolean;
  reminder1hMinutes?: number;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  workingHours?: DayWorkingHours[];
  doctorAvailability?: DoctorAvailabilitySettings;
  emailTemplates?: EmailTemplateConfig[];
  appointmentStatuses?: AppointmentStatusConfig[];
  consultationTypes?: ConsultationTypeConfig[];
  generalAppointmentSettings?: GeneralAppointmentSettings;
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
