import React, { useState } from "react";
import { Bell, Video, Check, Building, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { defaultSettings } from "../data/mockData";

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
            Global scheduling rules, video meeting integrations, and patient
            email reminder triggers.
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
            Supported video consultation platforms for remote patient
            assessments.
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
        <CardHeader className="pb-3 border-b border-line">
          <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-deep" />
            Automated Patient Notifications & Reminder Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-line bg-[#FAF7F6]">
            <div>
              <span className="text-xs font-bold text-ink block">
                Instant Request Acknowledgement
              </span>
              <span className="text-[11px] text-ink-soft">
                Sends automated email with appointment reference code
                immediately upon patient submission.
              </span>
            </div>
            <span className="text-xs font-semibold text-[#5E3E3B]">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-line bg-[#FAF7F6]">
            <div>
              <span className="text-xs font-bold text-ink block">
                24-Hour Prior Consultation Reminder
              </span>
              <span className="text-[11px] text-ink-soft">
                Sends email with preparation tips and meeting joining link 24
                hours in advance.
              </span>
            </div>
            <span className="text-xs font-semibold text-[#5E3E3B]">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-line bg-[#FAF7F6]">
            <div>
              <span className="text-xs font-bold text-ink block">
                1-Hour Prior Direct SMS / Email Ping
              </span>
              <span className="text-[11px] text-ink-soft">
                Urgent reminder with one-click direct consultation room URL.
              </span>
            </div>
            <span className="text-xs font-semibold text-[#5E3E3B]">
              Enabled
            </span>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
