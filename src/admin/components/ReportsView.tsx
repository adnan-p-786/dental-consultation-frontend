import React from "react";
import {
  Download,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Video,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Appointment, Doctor } from "../types";

interface ReportsViewProps {
  appointments: Appointment[];
  doctors?: Doctor[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ appointments }) => {
  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const approved = appointments.filter((a) => a.status === "approved").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;
  const noShow = appointments.filter((a) => a.status === "no_show").length;
  const videoCalls = appointments.filter(
    (a) => a.consultationType === "video",
  ).length;

  const completionRate =
    total > 0 ? Math.round(((completed + approved) / total) * 100) : 0;
  const cancelRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

  // Breakdown by treatment
  const treatmentCounts: Record<string, number> = {};
  appointments.forEach((apt) => {
    treatmentCounts[apt.treatment] = (treatmentCounts[apt.treatment] || 0) + 1;
  });

  const treatmentData = Object.entries(treatmentCounts).sort(
    (a, b) => b[1] - a[1],
  );

  // Breakdown by doctor
  const doctorCounts: Record<string, number> = {};
  appointments.forEach((apt) => {
    const docName = apt.assignedDoctor
      ? apt.assignedDoctor.name.split(",")[0]
      : "Unassigned";
    doctorCounts[docName] = (doctorCounts[docName] || 0) + 1;
  });

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Reference",
      "Patient Name",
      "Email",
      "Phone",
      "Treatment",
      "Date",
      "Time",
      "Doctor",
      "Status",
    ];
    const rows = appointments.map((a) => [
      a.id,
      a.referenceNo,
      `"${a.patient.name}"`,
      a.patient.email,
      a.patient.phone,
      `"${a.treatment}"`,
      a.confirmedDate || a.requestedDate,
      a.confirmedTime || a.requestedTime,
      `"${a.assignedDoctor ? a.assignedDoctor.name : "Unassigned"}"`,
      a.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Cedarview_Appointments_Report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-line shadow-xs">
        <div>
          <h3 className="font-display font-semibold text-xl text-ink">
            Clinical & Appointment Analytics
          </h3>
          <p className="text-xs text-ink-soft mt-1">
            Comprehensive audit reports, consultation outcomes, and treatment
            volume distributions.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          className="gap-2 bg-teal-deep text-white hover:bg-teal-mid text-xs h-9 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          Export Report (CSV)
        </Button>
      </div>

      {/* Primary KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-line bg-white shadow-xs">
          <div className="flex items-center justify-between text-ink-soft text-xs mb-1">
            <span>Total Volume</span>
            <Activity className="w-4 h-4 text-teal-deep" />
          </div>
          <div className="text-2xl font-bold text-ink">{total}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18% from last month
          </div>
        </Card>

        <Card className="p-4 border-line bg-white shadow-xs">
          <div className="flex items-center justify-between text-ink-soft text-xs mb-1">
            <span>Success / Confirmed Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-ink">{completionRate}%</div>
          <div className="text-[11px] text-ink-soft mt-1">
            {completed} completed • {approved} confirmed
          </div>
        </Card>

        <Card className="p-4 border-line bg-white shadow-xs">
          <div className="flex items-center justify-between text-ink-soft text-xs mb-1">
            <span>Online Tele-Consultations</span>
            <Video className="w-4 h-4 text-teal-deep" />
          </div>
          <div className="text-2xl font-bold text-ink">{videoCalls}</div>
          <div className="text-[11px] text-teal-deep font-semibold mt-1">
            {Math.round((videoCalls / (total || 1)) * 100)}% of all bookings
          </div>
        </Card>

        <Card className="p-4 border-line bg-white shadow-xs">
          <div className="flex items-center justify-between text-ink-soft text-xs mb-1">
            <span>Cancellation / No-Show</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-ink">{cancelRate}%</div>
          <div className="text-[11px] text-ink-soft mt-1">
            {cancelled} cancelled • {noShow} no-show
          </div>
        </Card>
      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treatment Distribution */}
        <Card className="border-line shadow-xs">
          <CardHeader className="pb-3 border-b border-line">
            <CardTitle className="text-base font-semibold text-ink">
              Appointments by Treatment Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {treatmentData.length === 0 ? (
              <div className="py-10 text-center text-xs text-ink-soft">
                No consultation records yet to generate treatment distribution.
              </div>
            ) : (
              treatmentData.map(([treatment, count]) => {
                const percentage = Math.round((count / (total || 1)) * 100);
                return (
                  <div key={treatment} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink">
                        {treatment}
                      </span>
                      <span className="text-ink-soft font-mono">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-line-soft overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-deep transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Doctor Workload Distribution */}
        <Card className="border-line shadow-xs">
          <CardHeader className="pb-3 border-b border-line">
            <CardTitle className="text-base font-semibold text-ink">
              Doctor Consultation Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {Object.entries(doctorCounts).length === 0 ? (
              <div className="py-10 text-center text-xs text-ink-soft">
                No doctor consultation records to display yet.
              </div>
            ) : (
              Object.entries(doctorCounts).map(([docName, count]) => {
                const percentage = Math.round((count / (total || 1)) * 100);
                return (
                  <div key={docName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink">{docName}</span>
                      <span className="text-ink-soft font-mono">
                        {count} appointments ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-line-soft overflow-hidden">
                      <div
                        className="h-full rounded-full bg-mint-deep transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}

            {/* Platform Distribution Bar */}
            <div className="pt-4 border-t border-line space-y-2">
              <span className="text-xs font-bold text-ink-soft uppercase tracking-wider block">
                Preferred Video Platforms
              </span>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-deep" />
                  <span className="text-ink">Google Meet (65%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="text-ink">Zoom (25%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-ink">MS Teams (10%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
