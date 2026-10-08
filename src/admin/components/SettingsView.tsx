import React, { useState, useEffect } from "react";
import {
  Bell,
  Video,
  Check,
  Building,
  Save,
  Clock,
  Send,
  ShieldCheck,
  Stethoscope,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Users,
  Mail,
  Layers,
  Settings2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useTreatmentsQuery,
  useCreateTreatmentMutation,
  useUpdateTreatmentMutation,
  useToggleTreatmentStatusMutation,
  useDeleteTreatmentMutation,
} from "@/api/Treatment/treatmentHooks";
import { type TreatmentItem as Treatment } from "@/api/Treatment/treatmentApi";
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
  useTriggerRemindersMutation,
} from "@/api/Setting/settingHooks";
import type {
  DayWorkingHours,
  DoctorAvailabilitySettings,
  EmailTemplateConfig,
  AppointmentStatusConfig,
  ConsultationTypeConfig,
  GeneralAppointmentSettings,
} from "@/api/Setting/settingApi";
import { defaultSettings as mockDefaults } from "../data/mockData";
import { toast } from "sonner";

export interface ClinicSettings {
  clinicName: string;
  supportEmail: string;
  clinicPhone: string;
  defaultDuration: number;
  meetingProvider: string;
  manualMeetingLink: string;
}

export interface ReminderConfig {
  instantAckEnabled: boolean;
  reminder24hEnabled: boolean;
  reminder24hHours: number;
  reminder1hEnabled: boolean;
  reminder1hMinutes: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export const defaultWorkingHours: DayWorkingHours[] = [
  {
    day: "Monday",
    isOpen: true,
    openTime: "08:00",
    closeTime: "19:00",
    hasBreak: true,
    breakStart: "13:00",
    breakEnd: "14:00",
  },
  {
    day: "Tuesday",
    isOpen: true,
    openTime: "08:00",
    closeTime: "19:00",
    hasBreak: true,
    breakStart: "13:00",
    breakEnd: "14:00",
  },
  {
    day: "Wednesday",
    isOpen: true,
    openTime: "08:00",
    closeTime: "19:00",
    hasBreak: true,
    breakStart: "13:00",
    breakEnd: "14:00",
  },
  {
    day: "Thursday",
    isOpen: true,
    openTime: "08:00",
    closeTime: "19:00",
    hasBreak: true,
    breakStart: "13:00",
    breakEnd: "14:00",
  },
  {
    day: "Friday",
    isOpen: true,
    openTime: "08:00",
    closeTime: "19:00",
    hasBreak: true,
    breakStart: "13:00",
    breakEnd: "14:00",
  },
  {
    day: "Saturday",
    isOpen: true,
    openTime: "08:00",
    closeTime: "14:00",
    hasBreak: false,
  },
  {
    day: "Sunday",
    isOpen: false,
    openTime: "09:00",
    closeTime: "13:00",
    hasBreak: false,
  },
];

export const defaultDoctorAvailability: DoctorAvailabilitySettings = {
  defaultStatus: "available",
  maxParallelPerSlot: 1,
  assignmentMode: "round_robin",
  autoBusyDuringCall: true,
  allowEmergencyOverride: true,
};

export const defaultEmailTemplates: EmailTemplateConfig[] = [
  {
    id: "acknowledgment",
    name: "Appointment Request Acknowledgment",
    subject:
      "Appointment Request Received - 32Stories Dental Clinic (#{ref_no})",
    enabled: true,
    bodySummary:
      "Dear {patient_name}, thank you for requesting your dental consultation for {treatment}. Your tracking reference is #{ref_no}. Our clinical team is reviewing your requested slot for {date} at {time}.",
    customFooterNote:
      "Need urgent care? Call our 24/7 clinic helpline at +1 (800) 555-0199.",
  },
  {
    id: "proposed",
    name: "Proposed Schedule Notification",
    subject: "Alternative Consultation Slot Proposed (#{ref_no})",
    enabled: true,
    bodySummary:
      "Dear {patient_name}, our dentist Dr. {doctor_name} has proposed an alternative consultation slot: {date} at {time}. Please visit your patient portal to review or confirm.",
    customFooterNote:
      "You can accept or request a reschedule directly from your portal.",
  },
  {
    id: "approved",
    name: "Appointment Confirmed & Video Room Access",
    subject:
      "Confirmed: Dental Video Consultation with Dr. {doctor_name} (#{ref_no})",
    enabled: true,
    bodySummary:
      "Dear {patient_name}, your dental consultation has been approved and scheduled for {date} at {time} with Dr. {doctor_name}. Your secure video room is ready: {meeting_link}.",
    customFooterNote:
      "Please join 5 minutes prior in a quiet, well-lit room for visual examination.",
  },
  {
    id: "cancelled",
    name: "Appointment Cancellation Notice",
    subject: "Consultation Request Cancelled (#{ref_no})",
    enabled: true,
    bodySummary:
      "Dear {patient_name}, your appointment request #{ref_no} for {treatment} has been cancelled. If this was unexpected, please contact our clinic care team.",
    customFooterNote: "We hope to assist you soon at 32Stories Dental Clinic.",
  },
  {
    id: "reminder_24h",
    name: "Advance 24-Hour Reminder",
    subject: "Reminder: Upcoming Dental Consultation Tomorrow (#{ref_no})",
    enabled: true,
    bodySummary:
      "Dear {patient_name}, this is a reminder for your upcoming consultation tomorrow, {date} at {time} with Dr. {doctor_name}. Video room link: {meeting_link}.",
    customFooterNote: "Please have any prior dental X-rays or notes ready.",
  },
  {
    id: "reminder_1h",
    name: "Urgent 1-Hour Pre-Consultation Ping",
    subject: "Starting Soon (1 Hour): Join Dental Video Room (#{ref_no})",
    enabled: true,
    bodySummary:
      "Dear {patient_name}, your dental consultation starts in 1 hour ({time}) with Dr. {doctor_name}. Click to test your audio/camera and join: {meeting_link}.",
    customFooterNote: "Doctor will admit you as soon as the session begins.",
  },
];

export const defaultAppointmentStatuses: AppointmentStatusConfig[] = [
  {
    key: "pending",
    label: "Requested / Pending",
    color: "amber",
    description: "Patient submitted request, awaiting clinic review",
    patientCanCancel: true,
    isActive: true,
  },
  {
    key: "under_review",
    label: "Under Review",
    color: "teal",
    description: "Staff is reviewing patient notes and assigning doctor",
    patientCanCancel: true,
    isActive: true,
  },
  {
    key: "proposed",
    label: "Proposed Slot",
    color: "blue",
    description: "Clinic suggested an alternative date/time to patient",
    patientCanCancel: true,
    autoExpireHours: 48,
    isActive: true,
  },
  {
    key: "approved",
    label: "Approved & Scheduled",
    color: "emerald",
    description:
      "Confirmed appointment with assigned dentist and video room link",
    patientCanCancel: true,
    isActive: true,
  },
  {
    key: "completed",
    label: "Completed",
    color: "indigo",
    description: "Consultation conducted and clinical doctor notes recorded",
    patientCanCancel: false,
    isActive: true,
  },
  {
    key: "cancelled",
    label: "Cancelled",
    color: "rose",
    description:
      "Booking cancelled by patient or clinic with documented reason",
    patientCanCancel: false,
    isActive: true,
  },
  {
    key: "rejected",
    label: "Rejected",
    color: "red",
    description:
      "Clinic unable to accept case (out of service area or referral needed)",
    patientCanCancel: false,
    isActive: true,
  },
];

export const defaultConsultationTypes: ConsultationTypeConfig[] = [
  {
    id: "video",
    name: "Online Video Consultation",
    description:
      "Remote tele-dentistry session via secure video conference (Meet, Zoom, Teams)",
    defaultDuration: 30,
    isActive: true,
    requiresMeetingLink: true,
    badgeText: "Tele-Health",
  },
  {
    id: "in_clinic",
    name: "In-Clinic Physical Visit",
    description:
      "In-person consultation and physical examination at our dental clinic",
    defaultDuration: 45,
    isActive: true,
    requiresMeetingLink: false,
    badgeText: "In-Surgery",
  },
  {
    id: "follow_up",
    name: "Follow-Up Review",
    description:
      "Post-procedure review or clear aligner checkup for existing patients",
    defaultDuration: 20,
    isActive: true,
    requiresMeetingLink: true,
    badgeText: "Review",
  },
  {
    id: "emergency",
    name: "Urgent Dental Triage",
    description:
      "Expedited acute pain, trauma, or emergency swelling assessment",
    defaultDuration: 30,
    isActive: true,
    requiresMeetingLink: true,
    badgeText: "Priority",
  },
];

export const defaultGeneralAppointmentSettings: GeneralAppointmentSettings = {
  minNoticeHours: 2,
  maxAdvanceDays: 60,
  allowSameDayBooking: true,
  cancellationCutoffHours: 2,
  maxActivePerPatient: 3,
  allowDocumentUpload: true,
  requireDocumentUpload: false,
  autoConfirmExistingPatients: false,
  bufferTimeMinutes: 10,
};

const defaultClinicSettings: ClinicSettings = {
  clinicName: mockDefaults.clinicName || "Dental Clinic",
  supportEmail: mockDefaults.supportEmail || "care@32storiesdental.com",
  clinicPhone: mockDefaults.clinicPhone || "+1 (555) 234-CARE",
  defaultDuration: mockDefaults.defaultDuration || 30,
  meetingProvider: "manual",
  manualMeetingLink: "",
};

const defaultReminderConfig: ReminderConfig = {
  instantAckEnabled: true,
  reminder24hEnabled: true,
  reminder24hHours: 24,
  reminder1hEnabled: true,
  reminder1hMinutes: 60,
  emailEnabled: true,
  smsEnabled: false,
};

type SettingsTab =
  | "all"
  | "general"
  | "hours"
  | "doctors"
  | "treatments"
  | "statuses"
  | "video"
  | "reminders"
  | "templates";

export const SettingsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<SettingsTab>("all");

  const [settings, setSettings] = useState<ClinicSettings>(defaultClinicSettings);
  const [reminders, setReminders] = useState<ReminderConfig>(defaultReminderConfig);
  const [workingHours, setWorkingHours] = useState<DayWorkingHours[]>(defaultWorkingHours);
  const [doctorAvailability, setDoctorAvailability] =
    useState<DoctorAvailabilitySettings>(defaultDoctorAvailability);
  const [emailTemplates, setEmailTemplates] =
    useState<EmailTemplateConfig[]>(defaultEmailTemplates);
  const [appointmentStatuses, setAppointmentStatuses] =
    useState<AppointmentStatusConfig[]>(defaultAppointmentStatuses);
  const [consultationTypes, setConsultationTypes] =
    useState<ConsultationTypeConfig[]>(defaultConsultationTypes);
  const [generalSettings, setGeneralSettings] =
    useState<GeneralAppointmentSettings>(defaultGeneralAppointmentSettings);

  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  // Clean up any legacy offline localStorage settings once on mount
  useEffect(() => {
    [
      "dental_clinic_settings",
      "dental_reminder_settings",
      "dental_working_hours",
      "dental_doctor_availability",
      "dental_email_templates",
      "dental_appointment_statuses",
      "dental_consultation_types",
      "dental_general_appointment_settings",
    ].forEach((key) => localStorage.removeItem(key));
  }, []);

  // Email Template Edit Modal
  const [editingTemplate, setEditingTemplate] =
    useState<EmailTemplateConfig | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // ------------------------------------------------------------------
  // TanStack Query: Clinic & Reminder Settings
  // ------------------------------------------------------------------
  const { data: serverSettings, isLoading: loadingSettings } =
    useSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();
  const triggerRemindersMutation = useTriggerRemindersMutation();

  useEffect(() => {
    if (serverSettings) {
      setSettings({
        clinicName:
          serverSettings.clinicName || defaultClinicSettings.clinicName,
        supportEmail: serverSettings.supportEmail || "",
        clinicPhone: serverSettings.clinicPhone || "",
        defaultDuration: serverSettings.defaultDuration || 30,
        meetingProvider: serverSettings.meetingProvider || "manual",
        manualMeetingLink: serverSettings.manualMeetingLink || "",
      });
      setReminders({
        instantAckEnabled: serverSettings.instantAckEnabled ?? true,
        reminder24hEnabled: serverSettings.reminder24hEnabled ?? true,
        reminder24hHours: serverSettings.reminder24hHours ?? 24,
        reminder1hEnabled: serverSettings.reminder1hEnabled ?? true,
        reminder1hMinutes: serverSettings.reminder1hMinutes ?? 60,
        emailEnabled: serverSettings.emailEnabled ?? true,
        smsEnabled: serverSettings.smsEnabled ?? false,
      });
      if (
        serverSettings.workingHours &&
        Array.isArray(serverSettings.workingHours)
      ) {
        setWorkingHours(serverSettings.workingHours);
      }
      if (serverSettings.doctorAvailability) {
        setDoctorAvailability({
          ...defaultDoctorAvailability,
          ...serverSettings.doctorAvailability,
        });
      }
      if (
        serverSettings.emailTemplates &&
        Array.isArray(serverSettings.emailTemplates)
      ) {
        setEmailTemplates(serverSettings.emailTemplates);
      }
      if (
        serverSettings.appointmentStatuses &&
        Array.isArray(serverSettings.appointmentStatuses)
      ) {
        setAppointmentStatuses(serverSettings.appointmentStatuses);
      }
      if (
        serverSettings.consultationTypes &&
        Array.isArray(serverSettings.consultationTypes)
      ) {
        setConsultationTypes(serverSettings.consultationTypes);
      }
      if (serverSettings.generalAppointmentSettings) {
        setGeneralSettings({
          ...defaultGeneralAppointmentSettings,
          ...serverSettings.generalAppointmentSettings,
        });
      }
    }
  }, [serverSettings]);

  // ------------------------------------------------------------------
  // TanStack Query: Treatment Management
  // ------------------------------------------------------------------
  const { data: treatments = [], isLoading: loadingTreatments } =
    useTreatmentsQuery();
  const createTreatmentMutation = useCreateTreatmentMutation();
  const updateTreatmentMutation = useUpdateTreatmentMutation();
  const toggleTreatmentMutation = useToggleTreatmentStatusMutation();
  const deleteTreatmentMutation = useDeleteTreatmentMutation();

  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(
    null,
  );
  const [treatmentForm, setTreatmentForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const savingTreatment =
    createTreatmentMutation.isPending || updateTreatmentMutation.isPending;
  const isSaving = updateSettingsMutation.isPending;
  const deletingId = deleteTreatmentMutation.isPending ? deleteConfirmId : null;

  const handleOpenAddTreatment = () => {
    setEditingTreatment(null);
    setTreatmentForm({ name: "", description: "", isActive: true });
    setIsTreatmentModalOpen(true);
  };

  const handleOpenEditTreatment = (item: Treatment) => {
    setEditingTreatment(item);
    setTreatmentForm({
      name: item.name,
      description: item.description || "",
      isActive: item.isActive,
    });
    setIsTreatmentModalOpen(true);
  };

  const handleSaveTreatment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = treatmentForm.name.trim();
    if (!trimmed) return;

    try {
      if (editingTreatment) {
        await updateTreatmentMutation.mutateAsync({
          id: editingTreatment.id,
          name: trimmed,
          description: treatmentForm.description.trim() || undefined,
          isActive: treatmentForm.isActive,
        });
        toast.success(`Treatment "${trimmed}" updated successfully`);
      } else {
        await createTreatmentMutation.mutateAsync({
          name: trimmed,
          description: treatmentForm.description.trim() || undefined,
          isActive: treatmentForm.isActive,
        });
        toast.success(`Treatment "${trimmed}" added successfully`);
      }
      setIsTreatmentModalOpen(false);
    } catch (err: any) {
      console.error("Failed to save treatment:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save treatment");
    }
  };

  const handleToggleTreatment = async (item: Treatment) => {
    try {
      await toggleTreatmentMutation.mutateAsync(item.id);
      toast.success(`Treatment "${item.name}" marked as ${!item.isActive ? "active" : "inactive"}`);
    } catch (err: any) {
      console.error("Failed to toggle treatment status:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to update treatment status");
    }
  };

  const handleDeleteTreatment = async (id: number) => {
    try {
      await deleteTreatmentMutation.mutateAsync(id);
      setDeleteConfirmId(null);
      toast.success("Treatment disabled successfully");
    } catch (err: any) {
      console.error("Failed to delete treatment:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete treatment");
    }
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      await updateSettingsMutation.mutateAsync({
        ...settings,
        ...reminders,
        bufferTimeMinutes: generalSettings.bufferTimeMinutes,
        workingHours,
        doctorAvailability,
        emailTemplates,
        appointmentStatuses,
        consultationTypes,
        generalAppointmentSettings: generalSettings,
      });

      setSaved(true);
      toast.success("Clinic settings saved to database successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Failed to save settings to database:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save settings");
    }
  };

  const handleSendTestReminder = async (type: "24_hour" | "1_hour") => {
    try {
      setTestStatus(null);
      const res = await triggerRemindersMutation.mutateAsync({
        reminderType: type,
      });
      const msg = `Test ${type === "24_hour" ? "24-Hour" : "1-Hour"} Reminder dispatched: ${res.message || "Success"}`;
      setTestStatus(msg);
      toast.success(msg);
      setTimeout(() => setTestStatus(null), 5000);
    } catch (err: any) {
      const errMsg = `Error triggering test ping: ${err.message || "Request failed"}`;
      setTestStatus(errMsg);
      toast.error(errMsg);
      setTimeout(() => setTestStatus(null), 5000);
    }
  };

  // Working Hours Helper
  const handleUpdateDayHours = (
    index: number,
    updates: Partial<DayWorkingHours>,
  ) => {
    setWorkingHours((prev) =>
      prev.map((day, idx) => (idx === index ? { ...day, ...updates } : day)),
    );
  };

  const handleUpdateAppointmentStatus = (
    index: number,
    updates: Partial<AppointmentStatusConfig>,
  ) => {
    setAppointmentStatuses((prev) =>
      prev.map((status, itemIndex) =>
        itemIndex === index ? { ...status, ...updates } : status,
      ),
    );
  };

  const handleUpdateConsultationType = (
    index: number,
    updates: Partial<ConsultationTypeConfig>,
  ) => {
    setConsultationTypes((prev) =>
      prev.map((type, itemIndex) =>
        itemIndex === index ? { ...type, ...updates } : type,
      ),
    );
  };

  // Email Template Helper
  const handleSaveEditedTemplate = () => {
    if (!editingTemplate) return;
    setEmailTemplates((prev) =>
      prev.map((t) => (t.id === editingTemplate.id ? editingTemplate : t)),
    );
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
  };

  const shouldShow = (category: SettingsTab) => {
    return activeCategory === "all" || activeCategory === category;
  };

  if (loadingSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white rounded-2xl border border-line p-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-deep" />
        <p className="text-sm font-medium text-ink-soft">Loading clinic settings from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Sticky Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-line shadow-xs sticky top-16 z-10 backdrop-blur-md bg-white/95">
          <div>
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-teal-deep" />
              <h3 className="font-display font-semibold text-xl text-ink">
                Admin & Clinic Settings
              </h3>
            </div>
            <p className="text-xs text-ink-soft mt-0.5">
              Configure clinic profile, working hours, doctor availability,
              treatment categories, statuses, templates, and reminders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={isSaving || loadingSettings}
              className="gap-2 bg-[#5E3E3B] text-white hover:bg-[#262525] text-xs h-9 shadow-xs cursor-pointer font-semibold disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saved ? (
                <Check className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saved
                ? "Changes Saved!"
                : isSaving
                  ? "Saving..."
                  : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* Quick Navigation Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: "all", label: "All Settings", icon: Settings2 },
            { id: "general", label: "General & Duration", icon: Building },
            { id: "hours", label: "Working Hours", icon: Clock },
            { id: "doctors", label: "Doctor Availability", icon: Users },
            {
              id: "treatments",
              label: "Treatment Categories",
              icon: Stethoscope,
            },
            { id: "statuses", label: "Statuses & Types", icon: Layers },
            { id: "video", label: "Video Integration", icon: Video },
            { id: "reminders", label: "Reminder Timings", icon: Bell },
            { id: "templates", label: "Email Templates", icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as SettingsTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer text-xs ${
                  isSelected
                    ? "bg-[#5E3E3B] text-white shadow-xs"
                    : "bg-white text-ink-soft border border-line hover:bg-line-soft hover:text-ink"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {testStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testStatus}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. GENERAL CLINIC INFORMATION & DURATION (Already implemented, preserved) */}
        {/* ========================================================================= */}
        {shouldShow("general") && (
          <Card className="border-line shadow-xs">
            <CardHeader className="pb-3 border-b border-line">
              <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-deep" />
                Clinic Profile & Appointment Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Clinic Name
                </label>
                <Input
                  value={settings.clinicName}
                  onChange={(e) =>
                    setSettings({ ...settings, clinicName: e.target.value })
                  }
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Support Email for Confirmations
                </label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, supportEmail: e.target.value })
                  }
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Clinic Hotline Phone
                </label>
                <Input
                  value={settings.clinicPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, clinicPhone: e.target.value })
                  }
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Default Consultation Duration
                </label>
                <div className="flex items-center gap-2">
                  {[30, 45, 60].map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() =>
                        setSettings({ ...settings, defaultDuration: mins })
                      }
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        settings.defaultDuration === mins
                          ? "bg-teal-deep text-white border-teal-deep shadow-xs"
                          : "bg-white text-ink-soft border-line hover:border-mint-deep"
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Buffer Time Between Appointments
                </label>
                <div className="flex items-center gap-2">
                  {[0, 5, 10, 15].map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() =>
                        setGeneralSettings({
                          ...generalSettings,
                          bufferTimeMinutes: mins,
                        })
                      }
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        (generalSettings.bufferTimeMinutes ?? 10) === mins
                          ? "bg-[#5E3E3B] text-white border-[#5E3E3B] shadow-xs"
                          : "bg-white text-ink-soft border-line hover:border-mint-deep"
                      }`}
                    >
                      {mins === 0 ? "No Buffer" : `${mins} min`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Custom Duration (Minutes)
                </label>
                <Input
                  type="number"
                  min={10}
                  max={180}
                  step={5}
                  value={settings.defaultDuration}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultDuration: Number(e.target.value) || 30,
                    })
                  }
                  className="text-xs"
                  placeholder="Custom minutes"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 2. GENERAL APPOINTMENT SETTINGS (NEW FUNCTION)                             */}
        {/* ========================================================================= */}
        {shouldShow("general") && (
          <Card className="border-line shadow-xs">
            <CardHeader className="pb-3 border-b border-line">
              <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-teal-deep" />
                General Appointment Settings & Booking Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Minimum Advance Booking Notice
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 6, 24].map((hours) => (
                    <button
                      type="button"
                      key={hours}
                      onClick={() =>
                        setGeneralSettings({
                          ...generalSettings,
                          minNoticeHours: hours,
                        })
                      }
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        generalSettings.minNoticeHours === hours
                          ? "bg-teal-deep text-white border-teal-deep shadow-xs"
                          : "bg-white text-ink-soft border-line hover:border-mint-deep"
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  Patients cannot book earlier than this window.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Max Future Booking Horizon
                </label>
                <div className="flex items-center gap-2">
                  {[30, 60, 90].map((days) => (
                    <button
                      type="button"
                      key={days}
                      onClick={() =>
                        setGeneralSettings({
                          ...generalSettings,
                          maxAdvanceDays: days,
                        })
                      }
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        generalSettings.maxAdvanceDays === days
                          ? "bg-teal-deep text-white border-teal-deep shadow-xs"
                          : "bg-white text-ink-soft border-line hover:border-mint-deep"
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  Maximum days in advance a slot can be reserved.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Cancellation Cutoff Window
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 4, 12].map((hours) => (
                    <button
                      type="button"
                      key={hours}
                      onClick={() =>
                        setGeneralSettings({
                          ...generalSettings,
                          cancellationCutoffHours: hours,
                        })
                      }
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        generalSettings.cancellationCutoffHours === hours
                          ? "bg-teal-deep text-white border-teal-deep shadow-xs"
                          : "bg-white text-ink-soft border-line hover:border-mint-deep"
                      }`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  Minimum hours prior for patient self-cancellation.
                </p>
              </div>

              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-line">
                <div className="flex items-center justify-between p-3 rounded-xl border border-line bg-[#FAF7F6]">
                  <div>
                    <span className="text-xs font-bold text-ink block">
                      Same-Day Booking
                    </span>
                    <span className="text-[11px] text-ink-soft">
                      Allow booking slots for current day
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGeneralSettings({
                        ...generalSettings,
                        allowSameDayBooking:
                          !generalSettings.allowSameDayBooking,
                      })
                    }
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      generalSettings.allowSameDayBooking
                        ? "bg-teal-deep text-white border-teal-deep"
                        : "bg-white text-zinc-500 border-zinc-300"
                    }`}
                  >
                    {generalSettings.allowSameDayBooking
                      ? "Allowed"
                      : "Disabled"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-line bg-[#FAF7F6]">
                  <div>
                    <span className="text-xs font-bold text-ink block">
                      Document Attachments
                    </span>
                    <span className="text-[11px] text-ink-soft">
                      Enable dental file/image upload
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGeneralSettings({
                        ...generalSettings,
                        allowDocumentUpload:
                          !generalSettings.allowDocumentUpload,
                      })
                    }
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      generalSettings.allowDocumentUpload
                        ? "bg-teal-deep text-white border-teal-deep"
                        : "bg-white text-zinc-500 border-zinc-300"
                    }`}
                  >
                    {generalSettings.allowDocumentUpload
                      ? "Enabled"
                      : "Disabled"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-line bg-[#FAF7F6]">
                  <div>
                    <span className="text-xs font-bold text-ink block">
                      Max Active Bookings
                    </span>
                    <span className="text-[11px] text-ink-soft">
                      Per patient concurrent limit
                    </span>
                  </div>
                  <select
                    value={generalSettings.maxActivePerPatient}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        maxActivePerPatient: Number(e.target.value) || 3,
                      })
                    }
                    className="text-xs font-semibold py-1 px-2 rounded-lg border border-line bg-white cursor-pointer"
                  >
                    <option value={1}>1 Active</option>
                    <option value={2}>2 Active</option>
                    <option value={3}>3 Active</option>
                    <option value={5}>5 Active</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 3. WORKING HOURS CONFIGURATION (NEW FUNCTION)                              */}
        {/* ========================================================================= */}
        {shouldShow("hours") && (
          <Card className="border-line shadow-xs">
            <CardHeader className="pb-3 border-b border-line flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-deep" />
                  Clinic Working Hours & Operating Schedule
                </CardTitle>
                <p className="text-xs text-ink-soft mt-0.5">
                  Set the daily working schedule, opening/closing hours, and
                  clinical break intervals.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                7 Days Schedule
              </Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="divide-y divide-line/60">
                {workingHours.map((day, idx) => (
                  <div
                    key={day.day}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="w-32 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateDayHours(idx, { isOpen: !day.isOpen })
                        }
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                          day.isOpen
                            ? "bg-teal-deep border-teal-deep text-white"
                            : "bg-white border-line"
                        }`}
                      >
                        {day.isOpen && <Check className="w-3 h-3" />}
                      </button>
                      <span
                        className={`font-semibold ${day.isOpen ? "text-ink" : "text-ink-soft line-through"}`}
                      >
                        {day.day}
                      </span>
                    </div>

                    {day.isOpen ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-ink-soft">
                            Hours:
                          </span>
                          <Input
                            type="time"
                            value={day.openTime}
                            onChange={(e) =>
                              handleUpdateDayHours(idx, {
                                openTime: e.target.value,
                              })
                            }
                            className="h-7 text-xs w-28 bg-white"
                          />
                          <span className="text-ink-soft">to</span>
                          <Input
                            type="time"
                            value={day.closeTime}
                            onChange={(e) =>
                              handleUpdateDayHours(idx, {
                                closeTime: e.target.value,
                              })
                            }
                            className="h-7 text-xs w-28 bg-white"
                          />
                        </div>

                        <div className="flex items-center gap-2 pl-2 border-l border-line/60">
                          <label className="flex items-center gap-1 text-[11px] text-ink-soft cursor-pointer">
                            <input
                              type="checkbox"
                              checked={day.hasBreak ?? false}
                              onChange={(e) =>
                                handleUpdateDayHours(idx, {
                                  hasBreak: e.target.checked,
                                })
                              }
                              className="rounded"
                            />
                            <span>Lunch Break</span>
                          </label>

                          {day.hasBreak && (
                            <div className="flex items-center gap-1">
                              <Input
                                type="time"
                                value={day.breakStart || "13:00"}
                                onChange={(e) =>
                                  handleUpdateDayHours(idx, {
                                    breakStart: e.target.value,
                                  })
                                }
                                className="h-7 text-xs w-24 bg-white"
                              />
                              <span className="text-ink-soft">-</span>
                              <Input
                                type="time"
                                value={day.breakEnd || "14:00"}
                                onChange={(e) =>
                                  handleUpdateDayHours(idx, {
                                    breakEnd: e.target.value,
                                  })
                                }
                                className="h-7 text-xs w-24 bg-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        Closed (No Consultations Scheduled)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 4. DOCTOR AVAILABILITY SETTINGS (NEW FUNCTION)                             */}
        {/* ========================================================================= */}
        {shouldShow("doctors") && (
          <Card className="border-line shadow-xs">
            <CardHeader className="pb-3 border-b border-line flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-deep" />
                  Doctor Availability & Scheduling Rules
                </CardTitle>
                <p className="text-xs text-ink-soft mt-0.5">
                  Configure default dentist availability statuses, concurrency
                  caps, and assignment allocation.
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Default Doctor Status
                </label>
                <select
                  value={doctorAvailability.defaultStatus}
                  onChange={(e) =>
                    setDoctorAvailability({
                      ...doctorAvailability,
                      defaultStatus: e.target.value as any,
                    })
                  }
                  className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-line bg-white cursor-pointer"
                >
                  <option value="available">
                    Available (Accepting Consultations)
                  </option>
                  <option value="busy">Busy (Reviewing Cases)</option>
                  <option value="offline">Offline / By Appointment Only</option>
                </select>
                <p className="text-[11px] text-ink-soft">
                  Initial state for on-duty doctors.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Max Parallel Consultations Per Slot
                </label>
                <select
                  value={doctorAvailability.maxParallelPerSlot}
                  onChange={(e) =>
                    setDoctorAvailability({
                      ...doctorAvailability,
                      maxParallelPerSlot: Number(e.target.value) || 1,
                    })
                  }
                  className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-line bg-white cursor-pointer"
                >
                  <option value={1}>1 Patient (Strict 1-on-1 Dedicated)</option>
                  <option value={2}>2 Patients (Overlap Triage Allowed)</option>
                </select>
                <p className="text-[11px] text-ink-soft">
                  Limits double-booking the same dentist in one slot.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Doctor Assignment Mode
                </label>
                <select
                  value={doctorAvailability.assignmentMode}
                  onChange={(e) =>
                    setDoctorAvailability({
                      ...doctorAvailability,
                      assignmentMode: e.target.value as any,
                    })
                  }
                  className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-line bg-white cursor-pointer"
                >
                  <option value="round_robin">
                    Round-Robin (Balanced Distribution)
                  </option>
                  <option value="least_busy">
                    Least Busy (Lowest Active Queue)
                  </option>
                  <option value="manual">
                    Manual Assignment (Admin Directs)
                  </option>
                </select>
                <p className="text-[11px] text-ink-soft">
                  Strategy used during appointment review.
                </p>
              </div>

              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-line">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-[#FAF7F6]">
                  <div>
                    <span className="text-xs font-bold text-ink block">
                      Auto-Busy During Active Call
                    </span>
                    <span className="text-[11px] text-ink-soft">
                      Automatically marks doctor as busy while video session is
                      underway
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDoctorAvailability({
                        ...doctorAvailability,
                        autoBusyDuringCall:
                          !doctorAvailability.autoBusyDuringCall,
                      })
                    }
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      doctorAvailability.autoBusyDuringCall
                        ? "bg-teal-deep text-white border-teal-deep"
                        : "bg-white text-zinc-500 border-zinc-300"
                    }`}
                  >
                    {doctorAvailability.autoBusyDuringCall
                      ? "Enabled"
                      : "Disabled"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-[#FAF7F6]">
                  <div>
                    <span className="text-xs font-bold text-ink block">
                      Emergency Case Override
                    </span>
                    <span className="text-[11px] text-ink-soft">
                      Allow clinic admin to override doctor busy status for
                      emergency triage
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDoctorAvailability({
                        ...doctorAvailability,
                        allowEmergencyOverride:
                          !doctorAvailability.allowEmergencyOverride,
                      })
                    }
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      doctorAvailability.allowEmergencyOverride
                        ? "bg-teal-deep text-white border-teal-deep"
                        : "bg-white text-zinc-500 border-zinc-300"
                    }`}
                  >
                    {doctorAvailability.allowEmergencyOverride
                      ? "Allowed"
                      : "Disabled"}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 5. TREATMENT CATEGORIES (Already implemented, preserved)                  */}
        {/* ========================================================================= */}
        {shouldShow("treatments") && (
          <Card className="border-line shadow-xs">
            <CardHeader className="pb-3 border-b border-line flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-deep" />
                  Clinical Treatments & Categories
                </CardTitle>
                <p className="text-xs text-ink-soft mt-0.5">
                  Manage dental procedures, specialties, and case options stored
                  in the database for patient booking.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={handleOpenAddTreatment}
                className="gap-1.5 bg-[#5E3E3B] text-white hover:bg-[#262525] text-xs h-8 shadow-xs cursor-pointer font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Treatment
              </Button>
            </CardHeader>

            <CardContent className="pt-4">
              {loadingTreatments ? (
                <div className="flex items-center justify-center py-6 text-xs text-ink-soft gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-deep" />
                  Loading treatments from database...
                </div>
              ) : treatments.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-line bg-[#FAF7F6]">
                  <Stethoscope className="w-7 h-7 text-ink-soft mx-auto mb-2 opacity-40" />
                  <h4 className="text-xs font-bold text-ink">
                    No Treatments Added Yet
                  </h4>
                  <p className="text-[11px] text-ink-soft mt-1">
                    Click "Add Treatment" to register dental procedures in the
                    database.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {treatments.map((treatment) => (
                      <div
                        key={treatment.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                          treatment.isActive
                            ? "bg-white border-line hover:border-mint-deep shadow-xs"
                            : "bg-[#FAF7F6] border-line/60 opacity-60"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-ink truncate">
                              {treatment.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                treatment.isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-zinc-100 text-zinc-500"
                              }`}
                            >
                              {treatment.isActive ? "Active" : "Disabled"}
                            </span>
                          </div>
                          {treatment.description && (
                            <p className="text-[11px] text-ink-soft line-clamp-2 mt-1 leading-relaxed">
                              {treatment.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-line/60 text-xs">
                          <button
                            type="button"
                            onClick={() => handleToggleTreatment(treatment)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-ink-soft hover:text-teal-deep cursor-pointer"
                          >
                            {treatment.isActive ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-600" />
                                <span>Disable</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-zinc-400" />
                                <span>Enable</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditTreatment(treatment)}
                              className="text-[11px] h-7 px-2 text-ink-soft hover:text-ink cursor-pointer"
                              title="Edit treatment"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>

                            {deleteConfirmId === treatment.id ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  disabled={deletingId === treatment.id}
                                  onClick={() =>
                                    handleDeleteTreatment(treatment.id)
                                  }
                                  className="text-[10px] h-7 px-2 cursor-pointer"
                                >
                                  {deletingId === treatment.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    "Confirm"
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-[10px] h-7 px-1.5 text-ink-soft cursor-pointer"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirmId(treatment.id)}
                                className="text-[11px] h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                title="Delete treatment"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 6. APPOINTMENT STATUSES & CONSULTATION TYPES                              */}
        {/* ========================================================================= */}
        {shouldShow("statuses") && (
          <Card className="border-line shadow-xs">
            <CardHeader className="pb-3 border-b border-line">
              <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-deep" />
                Appointment Statuses & Consultation Types
              </CardTitle>
              <p className="text-xs text-ink-soft mt-0.5">
                Configure the booking lifecycle and the consultation options
                available to patients and staff.
              </p>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 xl:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-ink">
                      Appointment Statuses
                    </h4>
                    <p className="text-[11px] text-ink-soft">
                      Control which stages appear in the appointment workflow.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {appointmentStatuses.filter((status) => status.isActive).length} active
                  </Badge>
                </div>

                <div className="space-y-2">
                  {appointmentStatuses.map((status, index) => (
                    <div
                      key={status.key}
                      className="rounded-xl border border-line bg-[#FAF7F6] p-3 space-y-2"
                    >
                      <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                        <Input
                          value={status.label}
                          onChange={(e) =>
                            handleUpdateAppointmentStatus(index, {
                              label: e.target.value,
                            })
                          }
                          className="text-xs h-8 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateAppointmentStatus(index, {
                              isActive: !status.isActive,
                            })
                          }
                          className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                            status.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-white text-zinc-500 border-zinc-300"
                          }`}
                        >
                          {status.isActive ? "Active" : "Disabled"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={status.color}
                          onChange={(e) =>
                            handleUpdateAppointmentStatus(index, {
                              color: e.target.value,
                            })
                          }
                          className="text-[11px] h-8 rounded-md border border-line bg-white px-2"
                          aria-label={`${status.label} color`}
                        >
                          {[
                            "amber",
                            "teal",
                            "blue",
                            "emerald",
                            "indigo",
                            "rose",
                            "red",
                          ].map((color) => (
                            <option key={color} value={color}>
                              {color[0].toUpperCase() + color.slice(1)}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          min={1}
                          max={168}
                          value={status.autoExpireHours ?? ""}
                          onChange={(e) =>
                            handleUpdateAppointmentStatus(index, {
                              autoExpireHours: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          className="text-[11px] h-8 bg-white"
                          placeholder="Auto-expire hours"
                          aria-label={`${status.label} auto-expire hours`}
                        />
                      </div>
                      <Input
                        value={status.description}
                        onChange={(e) =>
                          handleUpdateAppointmentStatus(index, {
                            description: e.target.value,
                          })
                        }
                        className="text-[11px] h-8 bg-white"
                        placeholder="Describe this appointment stage"
                      />
                      <label className="flex items-center gap-2 text-[11px] text-ink-soft">
                        <input
                          type="checkbox"
                          checked={status.patientCanCancel}
                          onChange={(e) =>
                            handleUpdateAppointmentStatus(index, {
                              patientCanCancel: e.target.checked,
                            })
                          }
                          className="rounded text-teal-deep"
                        />
                        Patient can cancel while in this status
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-ink">
                      Consultation Types
                    </h4>
                    <p className="text-[11px] text-ink-soft">
                      Configure duration, label, and meeting requirements.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {consultationTypes.filter((type) => type.isActive).length} active
                  </Badge>
                </div>

                <div className="space-y-2">
                  {consultationTypes.map((type, index) => (
                    <div
                      key={type.id}
                      className="rounded-xl border border-line bg-[#FAF7F6] p-3 space-y-2"
                    >
                      <div className="grid grid-cols-[1fr_86px_auto] gap-2 items-center">
                        <Input
                          value={type.name}
                          onChange={(e) =>
                            handleUpdateConsultationType(index, {
                              name: e.target.value,
                            })
                          }
                          className="text-xs h-8 bg-white"
                        />
                        <Input
                          type="number"
                          min={5}
                          max={240}
                          value={type.defaultDuration}
                          onChange={(e) =>
                            handleUpdateConsultationType(index, {
                              defaultDuration: Number(e.target.value) || 30,
                            })
                          }
                          className="text-xs h-8 bg-white"
                          aria-label={`${type.name} duration in minutes`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateConsultationType(index, {
                              isActive: !type.isActive,
                            })
                          }
                          className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                            type.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-white text-zinc-500 border-zinc-300"
                          }`}
                        >
                          {type.isActive ? "Active" : "Disabled"}
                        </button>
                      </div>
                      <Input
                        value={type.description}
                        onChange={(e) =>
                          handleUpdateConsultationType(index, {
                            description: e.target.value,
                          })
                        }
                        className="text-[11px] h-8 bg-white"
                        placeholder="Describe this consultation type"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={type.badgeText}
                          onChange={(e) =>
                            handleUpdateConsultationType(index, {
                              badgeText: e.target.value,
                            })
                          }
                          className="text-[11px] h-8 bg-white"
                          placeholder="Badge text"
                        />
                        <label className="flex items-center gap-2 text-[11px] text-ink-soft">
                          <input
                            type="checkbox"
                            checked={type.requiresMeetingLink}
                            onChange={(e) =>
                              handleUpdateConsultationType(index, {
                                requiresMeetingLink: e.target.checked,
                              })
                            }
                            className="rounded text-teal-deep"
                          />
                          Requires meeting link
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 7. VIDEO MEETING INTEGRATION                                             */}
        {/* ========================================================================= */}
        {shouldShow("video") && (
          <Card className="border-line shadow-xs">
            <CardHeader className="pb-3 border-b border-line">
              <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                <Video className="w-4 h-4 text-teal-deep" />
                Video Meeting Integration
              </CardTitle>
              <p className="text-xs text-ink-soft mt-0.5">
                Configure the provider and default link used for online
                consultations.
              </p>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Preferred Video Provider
                </label>
                <select
                  value={settings.meetingProvider}
                  onChange={(e) =>
                    setSettings({ ...settings, meetingProvider: e.target.value })
                  }
                  className="w-full text-xs font-medium py-2 px-3 rounded-xl border border-line bg-white cursor-pointer"
                >
                  <option value="manual">Manual Meeting Link</option>
                  <option value="google_meet">Google Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="microsoft_teams">Microsoft Teams</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Default Meeting Link
                </label>
                <Input
                  type="url"
                  value={settings.manualMeetingLink}
                  onChange={(e) =>
                    setSettings({ ...settings, manualMeetingLink: e.target.value })
                  }
                  placeholder="https://meet.google.com/..."
                  className="text-xs"
                />
              </div>
              <div className="md:col-span-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-[11px] text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Meeting links are shared with authorized patients and
                  assigned doctors through the appointment workflow.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 8. REMINDER TIMINGS & NOTIFICATIONS (Already implemented, preserved)      */}
        {/* ========================================================================= */}
        {shouldShow("reminders") && (
          <Card className="border-line shadow-xs">
            <CardHeader className="pb-3 border-b border-line flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-deep" />
                Reminder Timings & Patient Notifications
              </CardTitle>
              <span className="text-[11px] font-semibold text-ink-soft bg-zinc-100 px-2.5 py-1 rounded-full">
                SOW Section 9
              </span>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Automated Daemon Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/80">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      Automatic Background Daemon Active
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Reminders run continuously on schedule without requiring
                      button clicks. The server automatically scans appointments
                      and dispatches emails at the intervals configured below.
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-white border border-emerald-300 px-2.5 py-1 rounded-md shadow-xs">
                  Every 60s Scan
                </span>
              </div>

              {/* Instant Request Acknowledgement */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-[#FAF7F6]">
                <div>
                  <span className="text-xs font-bold text-ink block">
                    Instant Request Acknowledgement
                  </span>
                  <span className="text-[11px] text-ink-soft">
                    Sends automated email with appointment reference code
                    immediately upon patient booking.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setReminders({
                      ...reminders,
                      instantAckEnabled: !reminders.instantAckEnabled,
                    })
                  }
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    reminders.instantAckEnabled
                      ? "bg-teal-deep text-white border-teal-deep"
                      : "bg-white text-zinc-500 border-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  {reminders.instantAckEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              {/* Configurable Advance Reminder (24 Hours) */}
              <div className="p-3.5 rounded-xl border border-line bg-[#FAF7F6] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-deep" />
                      Advance Consultation Reminder (
                      {reminders.reminder24hHours} Hours Prior)
                    </span>
                    <span className="text-[11px] text-ink-soft block mt-0.5">
                      Sends email with appointment preparation checklist, doctor
                      profile, and meeting link.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendTestReminder("24_hour")}
                      className="text-[11px] h-7 gap-1 border-teal-deep/40 text-teal-deep hover:bg-teal-50"
                    >
                      <Send className="w-3 h-3" />
                      Test 24h Ping
                    </Button>
                    <button
                      type="button"
                      onClick={() =>
                        setReminders({
                          ...reminders,
                          reminder24hEnabled: !reminders.reminder24hEnabled,
                        })
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        reminders.reminder24hEnabled
                          ? "bg-teal-deep text-white border-teal-deep"
                          : "bg-white text-zinc-500 border-zinc-300 hover:border-zinc-400"
                      }`}
                    >
                      {reminders.reminder24hEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                </div>

                {reminders.reminder24hEnabled && (
                  <div className="pt-2 border-t border-line/60 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-ink-soft">
                      Trigger Interval:
                    </span>
                    {[48, 24, 12].map((hours) => (
                      <button
                        type="button"
                        key={hours}
                        onClick={() =>
                          setReminders({
                            ...reminders,
                            reminder24hHours: hours,
                          })
                        }
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                          reminders.reminder24hHours === hours
                            ? "bg-[#5E3E3B] text-white border-[#5E3E3B]"
                            : "bg-white text-ink border-line hover:border-mint-deep"
                        }`}
                      >
                        {hours} Hours Before
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Configurable Urgent Reminder (1 Hour) */}
              <div className="p-3.5 rounded-xl border border-line bg-[#FAF7F6] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Urgent Pre-Consultation Ping (
                      {reminders.reminder1hMinutes === 60
                        ? "1 Hour"
                        : `${reminders.reminder1hMinutes} Mins`}{" "}
                      Prior)
                    </span>
                    <span className="text-[11px] text-ink-soft block mt-0.5">
                      Sends high-priority alert with direct one-click room
                      joining button.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendTestReminder("1_hour")}
                      className="text-[11px] h-7 gap-1 border-amber-500/40 text-amber-700 hover:bg-amber-50"
                    >
                      <Send className="w-3 h-3" />
                      Test 1h Ping
                    </Button>
                    <button
                      type="button"
                      onClick={() =>
                        setReminders({
                          ...reminders,
                          reminder1hEnabled: !reminders.reminder1hEnabled,
                        })
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        reminders.reminder1hEnabled
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-zinc-500 border-zinc-300 hover:border-zinc-400"
                      }`}
                    >
                      {reminders.reminder1hEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                </div>

                {reminders.reminder1hEnabled && (
                  <div className="pt-2 border-t border-line/60 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-ink-soft">
                      Trigger Interval:
                    </span>
                    {[
                      { label: "2 Hours Before", value: 120 },
                      { label: "1 Hour Before", value: 60 },
                      { label: "30 Mins Before", value: 30 },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        onClick={() =>
                          setReminders({
                            ...reminders,
                            reminder1hMinutes: item.value,
                          })
                        }
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                          reminders.reminder1hMinutes === item.value
                            ? "bg-[#5E3E3B] text-white border-[#5E3E3B]"
                            : "bg-white text-ink border-line hover:border-mint-deep"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery Channels */}
              <div className="p-3.5 rounded-xl border border-line bg-white flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-ink block">
                    Notification Delivery Channels
                  </span>
                  <span className="text-[11px] text-ink-soft">
                    Emails are dispatched via verified SMTP. SMS alert requires
                    gateway integration.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-ink font-semibold">
                    <input
                      type="checkbox"
                      checked={reminders.emailEnabled}
                      onChange={(e) =>
                        setReminders({
                          ...reminders,
                          emailEnabled: e.target.checked,
                        })
                      }
                      className="rounded text-teal-deep"
                    />
                    Email Channel (Active)
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-ink font-semibold">
                    <input
                      type="checkbox"
                      checked={reminders.smsEnabled}
                      onChange={(e) =>
                        setReminders({
                          ...reminders,
                          smsEnabled: e.target.checked,
                        })
                      }
                      className="rounded text-teal-deep"
                    />
                    SMS Alert
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 9. EMAIL TEMPLATES (NEW FUNCTION)                                         */}
        {/* ========================================================================= */}
        {shouldShow("templates") && (
          <Card className="border-line shadow-xs">
            <CardHeader className="pb-3 border-b border-line flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-deep" />
                  Email Notification Templates
                </CardTitle>
                <p className="text-xs text-ink-soft mt-0.5">
                  Configure automated email subject lines, body message formats,
                  and footers for all appointment lifecycle stages.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {emailTemplates.length} Active Templates
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {emailTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 rounded-xl border border-line bg-white flex flex-col justify-between gap-3 shadow-2xs hover:border-mint-deep transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-ink">
                          {template.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            template.enabled
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-zinc-100 text-zinc-500"
                          }`}
                        >
                          {template.enabled ? "Active" : "Disabled"}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                          Subject
                        </span>
                        <p className="text-xs font-mono bg-[#FAF7F6] p-2 rounded-lg border border-line/60 text-ink truncate">
                          {template.subject}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">
                          Body Preview
                        </span>
                        <p className="text-[11px] text-ink-soft line-clamp-2 bg-[#FAF7F6] p-2 rounded-lg border border-line/60">
                          {template.bodySummary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-line/60">
                      <button
                        type="button"
                        onClick={() => {
                          setEmailTemplates((prev) =>
                            prev.map((t) =>
                              t.id === template.id
                                ? { ...t, enabled: !t.enabled }
                                : t,
                            ),
                          );
                        }}
                        className="text-[11px] font-semibold text-ink-soft hover:text-teal-deep cursor-pointer"
                      >
                        {template.enabled
                          ? "Disable Template"
                          : "Enable Template"}
                      </button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTemplate(template);
                          setIsTemplateModalOpen(true);
                        }}
                        className="text-xs h-7 px-2.5 gap-1 border-line cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Template</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {/* ========================================================================= */}
      {/* ADD / EDIT TREATMENT MODAL (Preserved exactly as is)                      */}
      {/* ========================================================================= */}
      <Dialog
        open={isTreatmentModalOpen}
        onOpenChange={setIsTreatmentModalOpen}
      >
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-deep" />
              {editingTreatment
                ? "Edit Clinical Treatment"
                : "Add Clinical Treatment"}
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-soft">
              {editingTreatment
                ? "Update the details and availability of this dental treatment."
                : "Add a new dental procedure or case option for patient consultations."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTreatment} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">
                Treatment / Procedure Name{" "}
                <span className="text-rose-500">*</span>
              </label>
              <Input
                value={treatmentForm.name}
                onChange={(e) =>
                  setTreatmentForm({ ...treatmentForm, name: e.target.value })
                }
                placeholder="e.g. Root Canal Treatment"
                className="text-xs"
                maxLength={200}
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">
                Description (Optional)
              </label>
              <textarea
                value={treatmentForm.description}
                onChange={(e) =>
                  setTreatmentForm({
                    ...treatmentForm,
                    description: e.target.value,
                  })
                }
                placeholder="Brief summary of procedure, conditions treated, or patient prep..."
                rows={3}
                className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-ink-soft focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-line bg-[#FAF7F6]">
              <div>
                <span className="text-xs font-bold text-ink block">
                  Active for Online Booking
                </span>
                <span className="text-[11px] text-ink-soft">
                  When enabled, patients can select this treatment when
                  requesting consultations.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setTreatmentForm({
                    ...treatmentForm,
                    isActive: !treatmentForm.isActive,
                  })
                }
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  treatmentForm.isActive
                    ? "bg-teal-deep text-white border-teal-deep"
                    : "bg-white text-zinc-500 border-zinc-300"
                }`}
              >
                {treatmentForm.isActive ? "Active" : "Disabled"}
              </button>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTreatmentModalOpen(false)}
                className="text-xs h-8 border-line"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingTreatment || !treatmentForm.name.trim()}
                className="text-xs h-8 gap-1.5 bg-[#5E3E3B] text-white hover:bg-[#262525] shadow-xs cursor-pointer"
              >
                {savingTreatment && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                {editingTreatment ? "Update Treatment" : "Save Treatment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* EDIT EMAIL TEMPLATE MODAL (NEW)                                           */}
      {/* ========================================================================= */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-deep" />
              Edit Email Template
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-soft">
              Customize subject line and notification body format for{" "}
              {editingTemplate?.name}.
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-ink">
                  Template Subject Line
                </label>
                <Input
                  value={editingTemplate.subject}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      subject: e.target.value,
                    })
                  }
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">
                  Body Message Text
                </label>
                <textarea
                  rows={4}
                  value={editingTemplate.bodySummary}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      bodySummary: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-ink-soft focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-sans leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-ink">
                  Custom Footer / Contact Note
                </label>
                <Input
                  value={editingTemplate.customFooterNote || ""}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      customFooterNote: e.target.value,
                    })
                  }
                  className="text-xs"
                  placeholder="e.g. Call our clinic helpline at +1 800..."
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF7F6] border border-line/70 text-[11px] text-ink-soft space-y-1">
                <span className="font-semibold text-ink block">
                  Placeholders Reference:
                </span>
                <p>
                  Use{" "}
                  <span className="font-mono text-teal-deep font-semibold">
                    {"{patient_name}"}
                  </span>
                  ,{" "}
                  <span className="font-mono text-teal-deep font-semibold">
                    {"{doctor_name}"}
                  </span>
                  ,{" "}
                  <span className="font-mono text-teal-deep font-semibold">
                    {"{treatment}"}
                  </span>
                  ,{" "}
                  <span className="font-mono text-teal-deep font-semibold">
                    {"{date}"}
                  </span>
                  ,{" "}
                  <span className="font-mono text-teal-deep font-semibold">
                    {"{time}"}
                  </span>
                  ,{" "}
                  <span className="font-mono text-teal-deep font-semibold">
                    {"{ref_no}"}
                  </span>
                  ,{" "}
                  <span className="font-mono text-teal-deep font-semibold">
                    {"{meeting_link}"}
                  </span>
                  .
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="text-xs h-8 border-line"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveEditedTemplate}
                  className="text-xs h-8 gap-1.5 bg-[#5E3E3B] text-white hover:bg-[#262525] shadow-xs cursor-pointer font-semibold"
                >
                  Apply Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsView;
