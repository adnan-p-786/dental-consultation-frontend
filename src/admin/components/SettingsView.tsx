import React, { useState, useEffect } from "react";
import {
  Bell,
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
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  useDoctorsQuery,
  useUpdateDoctorStatusMutation,
} from "@/api/Doctor/doctorHooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<ClinicSettings>(defaultClinicSettings);
  const [reminders, setReminders] = useState<ReminderConfig>(defaultReminderConfig);

  const { data: clinicDoctors = [], isLoading: isLoadingDoctors } = useDoctorsQuery();
  const updateDoctorStatusMutation = useUpdateDoctorStatusMutation();
  const [updatingDoctorId, setUpdatingDoctorId] = useState<string | number | null>(null);

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

  // ------------------------------------------------------------------
  // TanStack Query: Clinic & Reminder Settings
  // ------------------------------------------------------------------
  const { data: serverSettings, isLoading: loadingSettings } = useSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();
  const triggerRemindersMutation = useTriggerRemindersMutation();

  useEffect(() => {
    if (serverSettings) {
      setSettings({
        clinicName: serverSettings.clinicName || defaultClinicSettings.clinicName,
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
    }
  }, [serverSettings]);

  // ------------------------------------------------------------------
  // TanStack Query: Treatment Management
  // ------------------------------------------------------------------
  const { data: treatments = [], isLoading: loadingTreatments } = useTreatmentsQuery();
  const createTreatmentMutation = useCreateTreatmentMutation();
  const updateTreatmentMutation = useUpdateTreatmentMutation();
  const toggleTreatmentMutation = useToggleTreatmentStatusMutation();
  const deleteTreatmentMutation = useDeleteTreatmentMutation();

  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
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
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save treatment",
      );
    }
  };

  const handleToggleTreatment = async (item: Treatment) => {
    try {
      await toggleTreatmentMutation.mutateAsync(item.id);
      toast.success(
        `Treatment "${item.name}" marked as ${!item.isActive ? "active" : "inactive"}`,
      );
    } catch (err: any) {
      console.error("Failed to toggle treatment status:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update treatment status",
      );
    }
  };

  const handleDeleteTreatment = async (id: number) => {
    try {
      await deleteTreatmentMutation.mutateAsync(id);
      setDeleteConfirmId(null);
      toast.success("Treatment disabled successfully");
    } catch (err: any) {
      console.error("Failed to delete treatment:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete treatment",
      );
    }
  };

  const handleUpdateDoctorAvailability = (
    doctorId: string | number,
    doctorName: string,
    newStatus: "available" | "busy" | "on_leave",
  ) => {
    setUpdatingDoctorId(doctorId);
    updateDoctorStatusMutation.mutate(
      { id: doctorId, status: newStatus },
      {
        onSuccess: () => {
          const readable =
            newStatus === "on_leave"
              ? "On Leave / Offline"
              : newStatus === "busy"
                ? "In Consultation (Busy)"
                : "Available";
          toast.success(`${doctorName} status updated to ${readable}`);
        },
        onError: () => {
          toast.error(`Failed to update ${doctorName} availability`);
        },
        onSettled: () => {
          setUpdatingDoctorId(null);
        },
      },
    );
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      await updateSettingsMutation.mutateAsync({
        ...settings,
        ...reminders,
      });

      setSaved(true);
      toast.success("Clinic settings saved to database successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Failed to save settings to database:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save settings",
      );
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

  if (loadingSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-white rounded-2xl border border-line p-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-deep" />
        <p className="text-sm font-medium text-ink-soft">
          Loading clinic settings from database...
        </p>
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
              Configure clinic profile, doctor availability, clinical treatments, and reminder timings.
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

        {testStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testStatus}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. CLINIC PROFILE & APPOINTMENT DURATION                                  */}
        {/* ========================================================================= */}
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
                {[15, 30, 45].map((mins) => (
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
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* 2. DOCTOR AVAILABILITY SETTINGS & ROSTER                                  */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <Card className="border-line shadow-xs">
            <CardHeader className="pb-3 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-deep" />
                  Doctor Availability & Duty Status
                </CardTitle>
                <p className="text-xs text-ink-soft mt-0.5">
                  Configure real-time clinical duty statuses and consultation
                  availability for each doctor.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  </span>
                  <span>
                    {
                      clinicDoctors.filter((d) => d.status === "available")
                        .length
                    }{" "}
                    Available
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                  <span>
                    {clinicDoctors.filter((d) => d.status === "busy").length}{" "}
                    Busy
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>
                    {
                      clinicDoctors.filter(
                        (d) =>
                          d.status === "on_leave" ||
                          (d.status as string) === "offline",
                      ).length
                    }{" "}
                    On Leave
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {isLoadingDoctors ? (
                <div className="py-8 text-center text-xs text-ink-soft flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-deep" />
                  <span>Loading clinic doctor availability...</span>
                </div>
              ) : clinicDoctors.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-soft">
                  No doctors registered in the system yet. Add doctors from
                  the Doctor Management directory.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {clinicDoctors.map((doc) => {
                    const statusKey =
                      (doc.status as "available" | "busy" | "on_leave") ||
                      "available";
                    const isUpdating = updatingDoctorId === doc.id;

                    return (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl border border-line bg-white hover:border-mint-deep/60 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 border border-line-soft shrink-0">
                            <AvatarImage src={doc.avatar} />
                            <AvatarFallback className="bg-teal-50 text-teal-deep font-bold text-xs">
                              {doc.name
                                .replace("Dr. ", "")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h4
                              className="font-semibold text-xs text-ink truncate"
                              title={doc.name}
                            >
                              {doc.name}
                            </h4>
                            <p className="text-[11px] text-mint-deep font-medium truncate mt-0.5">
                              {doc.specialization}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10.5px] text-ink-soft mt-1">
                              <Clock className="w-3 h-3 text-ink-soft shrink-0" />
                              <span className="truncate">
                                {doc.workingHours || "Regular Hours"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-line/60 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-ink-soft font-medium">
                            Availability:
                          </span>

                          <Select
                            value={statusKey}
                            onValueChange={(
                              val: "available" | "busy" | "on_leave",
                            ) =>
                              handleUpdateDoctorAvailability(
                                doc.id,
                                doc.name,
                                val,
                              )
                            }
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs font-medium">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">
                                Available
                              </SelectItem>
                              <SelectItem value="busy">Busy</SelectItem>
                              <SelectItem value="on_leave">
                                On Leave
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* 3. CLINICAL TREATMENTS & CATEGORIES                                       */}
        {/* ========================================================================= */}
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

        {/* ========================================================================= */}
        {/* 4. REMINDER TIMINGS & NOTIFICATIONS                                       */}
        {/* ========================================================================= */}
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
      </form>

      {/* ========================================================================= */}
      {/* ADD / EDIT TREATMENT MODAL                                                */}
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
    </div>
  );
};

export default SettingsView;
