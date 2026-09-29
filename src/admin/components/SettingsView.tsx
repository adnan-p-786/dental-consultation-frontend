import React, { useState, useEffect } from "react";
import { Bell, Video, Check, Building, Save, Clock, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { defaultSettings } from "../data/mockData";

export interface ReminderConfig {
  instantAckEnabled: boolean;
  reminder24hEnabled: boolean;
  reminder24hHours: number;
  reminder1hEnabled: boolean;
  reminder1hMinutes: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

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
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("dental_clinic_settings");
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [reminders, setReminders] = useState<ReminderConfig>(() => {
    try {
      const saved = localStorage.getItem("dental_reminder_settings");
      return saved ? { ...defaultReminderConfig, ...JSON.parse(saved) } : defaultReminderConfig;
    } catch {
      return defaultReminderConfig;
    }
  });

  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/appointment/reminder-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setReminders((prev) => ({ ...prev, ...data.data }));
        }
      })
      .catch(() => {
        // Fallback to local storage
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("dental_clinic_settings", JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save clinic settings:", e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem("dental_reminder_settings", JSON.stringify(reminders));
    } catch (e) {
      console.error("Failed to save reminder settings:", e);
    }
  }, [reminders]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("dental_clinic_settings", JSON.stringify(settings));
    localStorage.setItem("dental_reminder_settings", JSON.stringify(reminders));

    fetch("/api/appointment/reminder-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminders),
    }).catch((err) => console.error("Failed to sync reminder config to server:", err));

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSendTestReminder = async (type: "24_hour" | "1_hour") => {
    setTestStatus(type === "24_hour" ? "Sending test 24h reminder..." : "Sending test 1h reminder...");
    try {
      const res = await fetch("/api/appointment/trigger-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderType: type,
          customHours: type === "24_hour" ? reminders.reminder24hHours : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestStatus(`Test ${type === "24_hour" ? "24h" : "1h"} reminder sent! (${data.sentCount ?? 1} delivered)`);
      } else {
        setTestStatus(data.message || "Failed to trigger test reminder");
      }
    } catch {
      setTestStatus("Error sending test reminder to backend");
    }
    setTimeout(() => setTestStatus(null), 3500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-line shadow-xs">
        <div>
          <h3 className="font-display font-semibold text-xl text-ink">
            Admin & Clinic Configuration
          </h3>
          <p className="text-xs text-ink-soft mt-1">
            Global scheduling rules, video meeting integrations, and configurable patient email reminder schedules.
          </p>
        </div>

        <Button
          type="submit"
          className="gap-2 bg-[#5E3E3B] text-white hover:bg-[#262525] text-xs h-9 shadow-xs cursor-pointer"
        >
          {saved ? (
            <Check className="w-3.5 h-3.5 text-emerald-300" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saved ? "Changes Saved!" : "Save Settings"}
        </Button>
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

      {/* Video Platform Integrations */}
      <Card className="border-line shadow-xs">
        <CardHeader className="pb-3 border-b border-line">
          <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
            <Video className="w-4 h-4 text-teal-deep" />
            Video Consultation Third-Party Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-xs text-ink-soft">
            Supported video consultation platforms for remote patient assessments.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-line bg-[#FAF7F6] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Google Meet</span>
                <span className="text-[10px] bg-[#FAF2F0] text-[#5E3E3B] font-bold px-1.5 py-0.5 rounded">
                  Connected
                </span>
              </div>
              <p className="text-[11px] text-ink-soft">
                Auto-generates Google Meet room on approval.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-line bg-[#FAF7F6] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Zoom Video</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-ink-soft">
                Generates unique meeting ID with passcode.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-line bg-[#FAF7F6] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">
                  Microsoft Teams
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                  Enabled
                </span>
              </div>
              <p className="text-[11px] text-ink-soft">
                Enterprise tenant video link dispatching.
              </p>
            </div>
          </div>
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
                  Reminders run continuously on schedule without requiring button clicks. The server automatically scans appointments and dispatches emails at the intervals configured below.
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
                Sends automated email with appointment reference code immediately upon patient booking.
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
                  Advance Consultation Reminder ({reminders.reminder24hHours} Hours Prior)
                </span>
                <span className="text-[11px] text-ink-soft block mt-0.5">
                  Sends email with appointment preparation checklist, doctor profile, and meeting link.
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
                  Urgent Pre-Consultation Ping ({reminders.reminder1hMinutes === 60 ? "1 Hour" : `${reminders.reminder1hMinutes} Mins`} Prior)
                </span>
                <span className="text-[11px] text-ink-soft block mt-0.5">
                  Sends high-priority alert with direct one-click room joining button.
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
                Emails are dispatched via verified SMTP. SMS ping requires gateway credentials.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-ink font-semibold">
                <input
                  type="checkbox"
                  checked={reminders.emailEnabled}
                  onChange={(e) =>
                    setReminders({ ...reminders, emailEnabled: e.target.checked })
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
                    setReminders({ ...reminders, smsEnabled: e.target.checked })
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
  );
};

