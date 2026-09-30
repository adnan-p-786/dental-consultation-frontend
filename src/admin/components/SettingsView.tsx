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
} from "lucide-react";
import { toast } from "react-toastify";
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
import axios from "axios";
import { defaultSettings as mockDefaults } from "../data/mockData";

export interface Treatment {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
}

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

const getAuthHeaders = () => {
  const token = localStorage.getItem("dental_auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<ClinicSettings>(() => {
    try {
      const saved = localStorage.getItem("dental_clinic_settings");
      return saved
        ? { ...defaultClinicSettings, ...JSON.parse(saved) }
        : defaultClinicSettings;
    } catch {
      return defaultClinicSettings;
    }
  });

  const [reminders, setReminders] = useState<ReminderConfig>(() => {
    try {
      const saved = localStorage.getItem("dental_reminder_settings");
      return saved
        ? { ...defaultReminderConfig, ...JSON.parse(saved) }
        : defaultReminderConfig;
    } catch {
      return defaultReminderConfig;
    }
  });

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  // Treatment Management State (Connected to backend /api/treatment via axios)
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loadingTreatments, setLoadingTreatments] = useState(true);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [treatmentForm, setTreatmentForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadTreatments = async () => {
    try {
      setLoadingTreatments(true);
      const res = await axios.get("/api/treatment");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTreatments(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load treatments:", err);
    } finally {
      setLoadingTreatments(false);
    }
  };

  useEffect(() => {
    loadTreatments();
  }, []);

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
    if (!trimmed) {
      toast.error("Please enter a treatment name");
      return;
    }

    try {
      setSavingTreatment(true);
      if (editingTreatment) {
        const res = await axios.put(`/api/treatment/${editingTreatment.id}`, {
          name: trimmed,
          description: treatmentForm.description.trim() || undefined,
          isActive: treatmentForm.isActive,
        });
        const updated = res.data?.data;
        if (updated) {
          setTreatments((prev) =>
            prev.map((t) => (t.id === editingTreatment.id ? updated : t))
          );
        }
        toast.success(`Treatment "${trimmed}" updated successfully`);
      } else {
        const res = await axios.post("/api/treatment", {
          name: trimmed,
          description: treatmentForm.description.trim() || undefined,
          isActive: treatmentForm.isActive,
        });
        const created = res.data?.data;
        if (created) {
          setTreatments((prev) => [...prev, created]);
        }
        toast.success(`Treatment "${trimmed}" added successfully`);
      }
      setIsTreatmentModalOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to save treatment";
      toast.error(msg);
    } finally {
      setSavingTreatment(false);
    }
  };

  const handleToggleTreatment = async (id: number) => {
    try {
      const res = await axios.patch(`/api/treatment/toggle-status/${id}`);
      const updated = res.data?.data;
      if (updated) {
        setTreatments((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to toggle treatment status";
      toast.error(msg);
    }
  };

  const handleDeleteTreatment = async (id: number) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/treatment/${id}`);
      setTreatments((prev) => prev.filter((t) => t.id !== id));
      toast.success("Treatment deleted successfully");
      setDeleteConfirmId(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete treatment";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await axios.get("/api/settings", {
        headers: getAuthHeaders(),
      });
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        setSettings({
          clinicName: d.clinicName || defaultClinicSettings.clinicName,
          supportEmail: d.supportEmail || "",
          clinicPhone: d.clinicPhone || "",
          defaultDuration: d.defaultDuration || 30,
          meetingProvider: d.meetingProvider || "manual",
          manualMeetingLink: d.manualMeetingLink || "",
        });
        setReminders({
          instantAckEnabled: d.instantAckEnabled ?? true,
          reminder24hEnabled: d.reminder24hEnabled ?? true,
          reminder24hHours: d.reminder24hHours ?? 24,
          reminder1hEnabled: d.reminder1hEnabled ?? true,
          reminder1hMinutes: d.reminder1hMinutes ?? 60,
          emailEnabled: d.emailEnabled ?? true,
          smsEnabled: d.smsEnabled ?? false,
        });
      }
    } catch (err: any) {
      console.warn("Could not load settings from server, falling back to local:", err?.message);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        clinicName: settings.clinicName,
        supportEmail: settings.supportEmail,
        clinicPhone: settings.clinicPhone,
        defaultDuration: settings.defaultDuration,
        meetingProvider: settings.meetingProvider,
        manualMeetingLink: settings.manualMeetingLink,

        instantAckEnabled: reminders.instantAckEnabled,
        reminder24hEnabled: reminders.reminder24hEnabled,
        reminder24hHours: reminders.reminder24hHours,
        reminder1hEnabled: reminders.reminder1hEnabled,
        reminder1hMinutes: reminders.reminder1hMinutes,
        emailEnabled: reminders.emailEnabled,
        smsEnabled: reminders.smsEnabled,
      };

      const res = await axios.put("/api/settings", payload, {
        headers: getAuthHeaders(),
      });

      if (res.data?.success) {
        toast.success("Settings saved successfully to database!");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);

        try {
          localStorage.setItem("dental_clinic_settings", JSON.stringify(settings));
          localStorage.setItem("dental_reminder_settings", JSON.stringify(reminders));
        } catch {
          // Ignore local storage error
        }
      }
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save settings to server";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestReminder = async (type: "24_hour" | "1_hour") => {
    setTestStatus(
      type === "24_hour"
        ? "Sending test 24h reminder..."
        : "Sending test 1h reminder...",
    );
    try {
      const res = await fetch("/api/appointment/trigger-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderType: type,
          customHours:
            type === "24_hour" ? reminders.reminder24hHours : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus(
          `Test ${type === "24_hour" ? "24h" : "1h"} reminder sent! (${data.sentCount ?? 1} delivered)`,
        );
      } else {
        setTestStatus(data.message || "Failed to trigger test reminder");
      }
    } catch {
      setTestStatus("Error sending test reminder to backend");
    }
    setTimeout(() => setTestStatus(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-line shadow-xs">
          <div>
            <h3 className="font-display font-semibold text-xl text-ink">
              Admin & Clinic Configuration
            </h3>
            <p className="text-xs text-ink-soft mt-1">
              Global scheduling rules, clinical treatments, video meetings, and
              configurable patient email reminder schedules.
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
              {saved ? "Changes Saved!" : isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        {testStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {testStatus}
          </div>
        )}

        {/* General Clinic Information */}
        <Card className="border-line shadow-xs">
          <CardHeader className="pb-3 border-b border-line">
            <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-deep" />
              Clinic Profile & Contact Defaults
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
          </CardContent>
        </Card>

        {/* Clinical Treatments Card */}
        <Card className="border-line shadow-xs">
          <CardHeader className="pb-3 border-b border-line flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-deep" />
                Clinical Treatments & Procedures
              </CardTitle>
              <p className="text-xs text-ink-soft mt-0.5">
                Manage dental procedures and case options stored in the database for consultations.
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleOpenAddTreatment}
              className="gap-1.5 bg-[#5E3E3B] text-white hover:bg-[#262525] text-xs h-8 shadow-xs cursor-pointer"
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
                <h4 className="text-xs font-bold text-ink">No Treatments Added Yet</h4>
                <p className="text-[11px] text-ink-soft mt-1">
                  Click below to add your first clinical dental procedure.
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenAddTreatment}
                  className="mt-3 text-xs h-8 gap-1.5 bg-[#5E3E3B] text-white hover:bg-[#262525] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Treatment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-ink-soft pb-1">
                  <span>{treatments.length} total treatment{treatments.length !== 1 ? "s" : ""}</span>
                  <span className="font-semibold text-teal-deep">
                    {treatments.filter((t) => t.isActive).length} active for booking
                  </span>
                </div>

                <div className="divide-y divide-line/60 rounded-xl border border-line bg-white overflow-hidden">
                  {treatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F6]/60 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-ink">
                            {treatment.name}
                          </span>
                          <Badge
                            variant={treatment.isActive ? "approved" : "no_show"}
                            className="text-[10px] py-0 px-2 h-4"
                          >
                            {treatment.isActive ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                        {treatment.description && (
                          <p className="text-[11px] text-ink-soft line-clamp-1">
                            {treatment.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleTreatment(treatment.id)}
                          title={treatment.isActive ? "Click to deactivate" : "Click to activate"}
                          className={`text-[11px] h-7 px-2 gap-1 cursor-pointer ${
                            treatment.isActive
                              ? "text-emerald-700 hover:bg-emerald-50"
                              : "text-zinc-500 hover:bg-zinc-100"
                          }`}
                        >
                          {treatment.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-zinc-400" />
                              Inactive
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditTreatment(treatment)}
                          className="text-[11px] h-7 px-2 border-line text-ink cursor-pointer"
                          title="Edit treatment"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>

                        {deleteConfirmId === treatment.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              disabled={deletingId === treatment.id}
                              onClick={() => handleDeleteTreatment(treatment.id)}
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
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Platform Integrations */}
        <Card className="border-line shadow-xs">
          <CardHeader className="pb-3 border-b border-line">
            <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <Video className="w-4 h-4 text-teal-deep" />
              Video Consultation Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-xs text-ink-soft">
              Choose the primary video consultation platform for remote patient assessments.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                {
                  id: "manual",
                  name: "Custom / Manual Link",
                  desc: "Use static or custom meeting room link.",
                },
                {
                  id: "google_meet",
                  name: "Google Meet",
                  desc: "Auto-generates Google Meet room on approval.",
                },
                {
                  id: "zoom",
                  name: "Zoom Video",
                  desc: "Unique Zoom meeting ID & passcode.",
                },
                {
                  id: "microsoft_teams",
                  name: "Microsoft Teams",
                  desc: "Enterprise tenant video link dispatching.",
                },
              ].map((provider) => {
                const isSelected = settings.meetingProvider === provider.id;
                return (
                  <div
                    key={provider.id}
                    onClick={() =>
                      setSettings({ ...settings, meetingProvider: provider.id })
                    }
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-[#FAF2F0] border-[#5E3E3B] shadow-xs ring-1 ring-[#5E3E3B]"
                        : "bg-[#FAF7F6] border-line hover:border-mint-deep"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">
                        {provider.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "bg-[#5E3E3B] text-white"
                            : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {isSelected ? "Active" : "Select"}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-soft">{provider.desc}</p>
                  </div>
                );
              })}
            </div>

            {settings.meetingProvider === "manual" && (
              <div className="pt-2 space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Default Meeting Link / Room URL
                </label>
                <Input
                  type="url"
                  placeholder="e.g. https://meet.google.com/abc-defg-hij or https://zoom.us/j/..."
                  value={settings.manualMeetingLink || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, manualMeetingLink: e.target.value })
                  }
                  className="text-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Automated Notifications & Reminders (PDF Section 9) */}
        <Card className="border-line shadow-xs">
          <CardHeader className="pb-3 border-b border-line flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-deep" />
              Configurable Reminders & Patient Notifications
            </CardTitle>
            <span className="text-[11px] font-semibold text-ink-soft bg-zinc-100 px-2.5 py-1 rounded-full">
              PDF Section 9
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
                    button clicks. The server automatically scans appointments and
                    dispatches emails at the intervals configured below.
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
                    Advance Consultation Reminder ({
                      reminders.reminder24hHours
                    }{" "}
                    Hours Prior)
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
                        setReminders({ ...reminders, reminder24hHours: hours })
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
                    Sends high-priority alert with direct one-click room joining
                    button.
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
                  Emails are dispatched via verified SMTP. SMS ping requires
                  gateway credentials.
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

      {/* Add / Edit Treatment Modal */}
      <Dialog open={isTreatmentModalOpen} onOpenChange={setIsTreatmentModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-deep" />
              {editingTreatment ? "Edit Clinical Treatment" : "Add Clinical Treatment"}
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
                Treatment / Procedure Name <span className="text-rose-500">*</span>
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
                  setTreatmentForm({ ...treatmentForm, description: e.target.value })
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
                  When enabled, patients can select this treatment when requesting consultations.
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
                {savingTreatment && <Loader2 className="w-3 h-3 animate-spin" />}
                {editingTreatment ? "Update Treatment" : "Save Treatment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
