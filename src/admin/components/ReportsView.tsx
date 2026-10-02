import React, { useState, useEffect, useMemo } from "react";
import {
  Download,
  CheckCircle2,
  XCircle,
  Video,
  Activity,
  Filter,
  Search,
  RefreshCw,
  User,
  Stethoscope,
  Clock,
  FileText,
  Trash2,
  Loader2,
  BookmarkPlus,
  BarChart3,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Appointment, Doctor } from "../types";
import {
  useReportAnalyticsQuery,
  useSavedReportsQuery,
  useSaveReportSnapshotMutation,
  useDeleteReportSnapshotMutation,
} from "@/api/Report/reportHooks";

import { reportsApi, type AnalyticsMetrics } from "@/api/Report/reportApi";

interface ReportsViewProps {
  appointments: Appointment[];
  doctors?: Doctor[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  appointments: initialAppointments = [],
  doctors = [],
}) => {
  // ------------------------------------------------------------------
  // Filter States (PDF Section 11: Search & Filters)
  // ------------------------------------------------------------------
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [selectedTreatment, setSelectedTreatment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState<string>("all");

  // ------------------------------------------------------------------
  // Data States
  // ------------------------------------------------------------------
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [filteredAppointments, setFilteredAppointments] =
    useState<any[]>(initialAppointments);

  // Saved reports snapshots state
  const [isSavedReportsOpen, setIsSavedReportsOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [snapshotTitle, setSnapshotTitle] = useState("");
  const [snapshotDesc, setSnapshotDesc] = useState("");
  const [exporting, setExporting] = useState(false);

  // ------------------------------------------------------------------
  // Filter Parameters for TanStack Query
  // ------------------------------------------------------------------
  const filterParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      doctor: selectedDoctor !== "all" ? selectedDoctor : undefined,
      treatment: selectedTreatment !== "all" ? selectedTreatment : undefined,
      status: selectedStatus !== "all" ? selectedStatus : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [
      search,
      selectedDoctor,
      selectedTreatment,
      selectedStatus,
      startDate,
      endDate,
    ],
  );

  // ------------------------------------------------------------------
  // TanStack Query Hooks: Real-time Analytics & Saved Reports
  // ------------------------------------------------------------------
  const {
    data: analyticsData,
    isLoading: loading,
    refetch: refetchAnalytics,
  } = useReportAnalyticsQuery(filterParams);

  const { data: savedReports = [], isLoading: loadingSavedReports } =
    useSavedReportsQuery({ enabled: isSavedReportsOpen });

  const saveSnapshotMutation = useSaveReportSnapshotMutation();
  const deleteSnapshotMutation = useDeleteReportSnapshotMutation();
  const savingSnapshot = saveSnapshotMutation.isPending;

  // ------------------------------------------------------------------
  // Quick Date Presets
  // ------------------------------------------------------------------
  const handlePresetSelect = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      const d = today.toISOString().split("T")[0];
      setStartDate(d);
      setEndDate(d);
    } else if (preset === "this_month") {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const firstDay = `${year}-${month}-01`;
      const lastDay = new Date(year, today.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === "last_30_days") {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (preset === "last_90_days") {
      const past = new Date();
      past.setDate(today.getDate() - 90);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (preset === "this_year") {
      const year = today.getFullYear();
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-12-31`);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedDoctor("all");
    setSelectedTreatment("all");
    setSelectedStatus("all");
    setStartDate("");
    setEndDate("");
    setDatePreset("all");
  };

  // Sync analyticsData to local display states (with local fallback if server query hasn't resolved)
  useEffect(() => {
    if (analyticsData) {
      setMetrics(analyticsData.metrics);
      setFilteredAppointments(analyticsData.appointments || []);
    } else {
      calculateClientFallback();
    }
  }, [analyticsData, initialAppointments]);

  // Client-side fallback computation
  const calculateClientFallback = () => {
    const filtered = initialAppointments.filter((apt) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          String(apt.id).includes(q) ||
          apt.patient.name.toLowerCase().includes(q) ||
          apt.patient.email.toLowerCase().includes(q) ||
          (apt.patient.phone || "").toLowerCase().includes(q) ||
          apt.treatment.toLowerCase().includes(q) ||
          (apt.assignedDoctor?.name || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedDoctor !== "all") {
        const docName = apt.assignedDoctor?.name.toLowerCase() || "";
        const docId = String(apt.assignedDoctor?.id || "");
        if (
          !docName.includes(selectedDoctor.toLowerCase()) &&
          docId !== selectedDoctor
        ) {
          return false;
        }
      }

      if (selectedTreatment !== "all" && apt.treatment !== selectedTreatment) {
        return false;
      }

      if (selectedStatus !== "all" && apt.status !== selectedStatus) {
        return false;
      }

      const aptDate = apt.confirmedDate || apt.requestedDate;
      if (startDate && aptDate < startDate) return false;
      if (endDate && aptDate > endDate) return false;

      return true;
    });

    setFilteredAppointments(filtered);

    const total = filtered.length;
    const completed = filtered.filter((a) => a.status === "completed").length;
    const approved = filtered.filter((a) => a.status === "approved").length;
    const cancelled = filtered.filter((a) => a.status === "cancelled").length;
    const noShow = filtered.filter((a) => a.status === "no_show").length;
    const videoCalls = total; // All consultations in system are online consultations

    const treatmentCounts: Record<string, number> = {};
    const doctorCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};

    filtered.forEach((a) => {
      treatmentCounts[a.treatment] = (treatmentCounts[a.treatment] || 0) + 1;
      const dName = a.assignedDoctor?.name || "Unassigned";
      doctorCounts[dName] = (doctorCounts[dName] || 0) + 1;
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    setMetrics({
      totalAppointments: total,
      completedConsultations: completed,
      approvedAppointments: approved,
      pendingAppointments: total - completed - approved - cancelled - noShow,
      cancelledAppointments: cancelled,
      noShowAppointments: noShow,
      onlineConsultations: videoCalls,
      completionRate:
        total > 0 ? Math.round(((completed + approved) / total) * 100) : 0,
      cancelRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      appointmentsByTreatment: Object.entries(treatmentCounts).map(
        ([treatment, count]) => ({
          treatment,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }),
      ),
      appointmentsByDoctor: Object.entries(doctorCounts).map(
        ([doctorName, count]) => ({
          doctorName,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }),
      ),
      appointmentsByMonth: [],
      appointmentStatusStatistics: Object.entries(statusCounts).map(
        ([status, count]) => ({
          status,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }),
      ),
    });
  };

  const handleOpenSavedReports = () => {
    setIsSavedReportsOpen(true);
  };

  // ------------------------------------------------------------------
  // Export CSV Action
  // ------------------------------------------------------------------
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const blob = await reportsApi.exportCsv(filterParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `dental_consultation_report_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Client-side CSV export fallback
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
      const rows = filteredAppointments.map((a) => [
        a.id,
        a.referenceNo || `APT-${a.id}`,
        `"${a.patient?.name || a.patientName || ""}"`,
        a.patient?.email || a.patientEmail || "",
        a.patient?.phone || a.phoneNumber || "",
        `"${a.treatment || a.tratmentType || ""}"`,
        a.confirmedDate || a.preferredDate || a.requestedDate || "",
        a.confirmedTime || a.preferredTime || a.requestedTime || "",
        `"${a.assignedDoctor?.name || a.assignedDoctorName || "Unassigned"}"`,
        a.status || "pending",
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `dental_report_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setExporting(false);
    }
  };

  // ------------------------------------------------------------------
  // Save Snapshot Action
  // ------------------------------------------------------------------
  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotTitle.trim()) {
      return;
    }

    try {
      await saveSnapshotMutation.mutateAsync({
        title: snapshotTitle.trim(),
        description: snapshotDesc.trim() || undefined,
        reportType: "custom_filtered_audit",
        filters: filterParams,
        customMetrics: metrics,
      });

      setIsSaveModalOpen(false);
      setSnapshotTitle("");
      setSnapshotDesc("");
    } catch {
      // ignore
    }
  };

  const handleDeleteSavedReport = async (id: number) => {
    try {
      await deleteSnapshotMutation.mutateAsync(id);
    } catch {
      // ignore
    }
  };

  // Unique list of treatments and doctors for filter dropdowns
  const treatmentFilterOptions = useMemo(() => {
    const set = new Set<string>();
    initialAppointments.forEach((a) => {
      if (a.treatment) set.add(a.treatment);
    });
    return Array.from(set);
  }, [initialAppointments]);

  const doctorFilterOptions = useMemo(() => {
    return doctors.map((d) => ({
      id: String(d.id),
      name: d.name,
    }));
  }, [doctors]);

  // Summary Metrics calculations
  const total = metrics?.totalAppointments ?? filteredAppointments.length;
  const completed = metrics?.completedConsultations ?? 0;
  const approved = metrics?.approvedAppointments ?? 0;
  const cancelled = metrics?.cancelledAppointments ?? 0;
  const noShow = metrics?.noShowAppointments ?? 0;
  const videoCalls = metrics?.onlineConsultations ?? 0;
  const completionRate = metrics?.completionRate ?? 0;
  const cancelRate = metrics?.cancelRate ?? 0;

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-xl text-ink">
              Clinical & Appointment Analytics
            </h3>
            <Badge className="bg-[#FAF2F0] text-[#5E3E3B] border-[#5E3E3B]/20 text-[11px] font-bold">
              PDF Section 11
            </Badge>
          </div>
          <p className="text-xs text-ink-soft mt-1">
            Real-time appointment statistics, doctor workloads, treatment
            breakdowns, and exportable clinical audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenSavedReports}
            className="text-xs h-9 gap-1.5 border-line text-ink hover:bg-[#FAF7F6] cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-teal-deep" />
            Saved Reports ({savedReports.length})
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSnapshotTitle(
                `Report Snapshot (${new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })})`,
              );
              setIsSaveModalOpen(true);
            }}
            className="text-xs h-9 gap-1.5 border-[#5E3E3B]/30 text-[#5E3E3B] hover:bg-[#FAF2F0] cursor-pointer font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5E3E3B]" />
            Save Snapshot
          </Button>

          <Button
            type="button"
            onClick={handleExportCSV}
            disabled={exporting}
            className="gap-2 bg-[#5E3E3B] text-white hover:bg-[#262525] text-xs h-9 shadow-xs cursor-pointer font-semibold disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Export Report (CSV)
          </Button>
        </div>
      </div>

      {/* SEARCH & FILTERS SECTION (PDF Section 11) */}
      <Card className="border-line shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-line flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-ink flex items-center gap-2">
            <Filter className="w-4 h-4 text-teal-deep" />
            Search & Advanced Filters
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-[11px] h-7 px-2 text-ink-soft hover:text-ink cursor-pointer gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Filters
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Universal Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-soft" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, email address, phone number, treatment, or appointment ID..."
              className="pl-9 text-xs h-9 bg-[#FAF7F6]/60 border-line"
            />
          </div>

          {/* Filter Dropdowns Grid (Doctor, Treatment, Status) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Doctor Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-ink flex items-center gap-1">
                <User className="w-3 h-3 text-mint-deep" />
                Assigned Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full text-xs h-9 rounded-md border border-line bg-white px-2.5 py-1 text-ink focus:outline-none focus:ring-1 focus:ring-teal-deep"
              >
                <option value="all">All Doctors</option>
                {doctorFilterOptions.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Treatment Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-ink flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-mint-deep" />
                Treatment Type
              </label>
              <select
                value={selectedTreatment}
                onChange={(e) => setSelectedTreatment(e.target.value)}
                className="w-full text-xs h-9 rounded-md border border-line bg-white px-2.5 py-1 text-ink focus:outline-none focus:ring-1 focus:ring-teal-deep"
              >
                <option value="all">All Treatments</option>
                {treatmentFilterOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Status Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-ink flex items-center gap-1">
                <Clock className="w-3 h-3 text-mint-deep" />
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs h-9 rounded-md border border-line bg-white px-2.5 py-1 text-ink focus:outline-none focus:ring-1 focus:ring-teal-deep"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
                <option value="under_review">Under Review</option>
              </select>
            </div>
          </div>

          {/* Date Range & Quick Preset Chips */}
          <div className="pt-2 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-ink-soft mr-1 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                Preset:
              </span>
              {[
                { id: "all", label: "All Time" },
                { id: "today", label: "Today" },
                { id: "this_month", label: "This Month" },
                { id: "last_30_days", label: "Last 30 Days" },
                { id: "last_90_days", label: "Last 90 Days" },
                { id: "this_year", label: "This Year" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer font-medium ${
                    datePreset === p.id
                      ? "bg-[#5E3E3B] text-white border-[#5E3E3B]"
                      : "bg-[#FAF7F6] text-ink-soft border-line hover:border-mint-deep hover:text-ink"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-ink-soft">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset("custom");
                  }}
                  className="text-xs h-7 px-2 border border-line rounded bg-white text-ink"
                />
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-ink-soft">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset("custom");
                  }}
                  className="text-xs h-7 px-2 border border-line rounded bg-white text-ink"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary KPI Row (PDF Section 11: Reports & Analytics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Appointments */}
        <Card className="p-4 border-line bg-white shadow-xs">
          <div className="flex items-center justify-between text-ink-soft text-xs mb-1">
            <span className="font-medium">Total Appointments</span>
            <Activity className="w-4 h-4 text-teal-deep" />
          </div>
          <div className="text-2xl font-bold text-ink">{total}</div>
          <div className="text-[11px] text-ink-soft mt-1">
            Matching current active filters
          </div>
        </Card>

        {/* Completed & Confirmed Rate */}
        <Card className="p-4 border-line bg-white shadow-xs">
          <div className="flex items-center justify-between text-ink-soft text-xs mb-1">
            <span className="font-medium">Completed & Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-ink">{completionRate}%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            {completed} completed • {approved} confirmed
          </div>
        </Card>

        {/* Online Consultations */}
        <Card className="p-4 border-line bg-white shadow-xs">
          <div className="flex items-center justify-between text-ink-soft text-xs mb-1">
            <span className="font-medium">Online Consultations</span>
            <Video className="w-4 h-4 text-teal-deep" />
          </div>
          <div className="text-2xl font-bold text-ink">{videoCalls}</div>
          <div className="text-[11px] text-teal-deep font-semibold mt-1">
            100% Online Tele-Dentistry
          </div>
        </Card>

        {/* Cancellation & No-Show */}
        <Card className="p-4 border-line bg-white shadow-xs">
          <div className="flex items-center justify-between text-ink-soft text-xs mb-1">
            <span className="font-medium">Cancellation & No-Show</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-ink">{cancelRate}%</div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">
            {cancelled} cancelled • {noShow} no-show
          </div>
        </Card>
      </div>

      {/* APPOINTMENTS BY MONTH (PDF Section 11) */}
      {metrics?.appointmentsByMonth &&
        metrics.appointmentsByMonth.length > 0 && (
          <Card className="border-line shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-line flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-deep" />
                  Appointments by Month (Timeline Trend)
                </CardTitle>
                <p className="text-xs text-ink-soft mt-0.5">
                  Monthly volume breakdown and consultation completion
                  trajectory.
                </p>
              </div>
              <span className="text-xs text-ink-soft font-mono">
                {metrics.appointmentsByMonth.length} months recorded
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {metrics.appointmentsByMonth.map((m) => (
                  <div
                    key={m.month}
                    className="p-3 rounded-xl border border-line bg-[#FAF7F6] text-center space-y-1 hover:border-mint-deep transition-colors"
                  >
                    <span className="text-xs font-bold text-ink block">
                      {m.label}
                    </span>
                    <span className="text-xl font-bold text-teal-deep block">
                      {m.total}
                    </span>
                    <div className="text-[10px] text-ink-soft flex items-center justify-center gap-2 pt-1 border-t border-line/40">
                      <span className="text-emerald-700 font-medium">
                        ✓ {m.completed}
                      </span>
                      <span className="text-rose-600 font-medium">
                        ✕ {m.cancelled}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Distribution Grids (Treatment & Doctor Allocation) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Appointments by Treatment Category (PDF Section 11) */}
        <Card className="border-line shadow-xs bg-white">
          <CardHeader className="pb-3 border-b border-line">
            <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-deep" />
              Appointments by Treatment Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {!metrics?.appointmentsByTreatment ||
            metrics.appointmentsByTreatment.length === 0 ? (
              <div className="py-10 text-center text-xs text-ink-soft">
                No consultation records yet to generate treatment distribution.
              </div>
            ) : (
              metrics.appointmentsByTreatment.map((item) => (
                <div key={item.treatment} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">
                      {item.treatment}
                    </span>
                    <span className="text-ink-soft font-mono">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-line-soft overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-deep transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 2. Appointments by Doctor Workload (PDF Section 11) */}
        <Card className="border-line shadow-xs bg-white">
          <CardHeader className="pb-3 border-b border-line">
            <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <User className="w-4 h-4 text-teal-deep" />
              Appointments by Doctor Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {!metrics?.appointmentsByDoctor ||
            metrics.appointmentsByDoctor.length === 0 ? (
              <div className="py-10 text-center text-xs text-ink-soft">
                No doctor consultation records to display yet.
              </div>
            ) : (
              metrics.appointmentsByDoctor.map((item) => (
                <div key={item.doctorName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">
                      {item.doctorName}
                    </span>
                    <span className="text-ink-soft font-mono">
                      {item.count} appointments ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-line-soft overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#5E3E3B] transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}

            {/* Status Statistics Pills (PDF Section 11: Appointment status statistics) */}
            {metrics?.appointmentStatusStatistics &&
              metrics.appointmentStatusStatistics.length > 0 && (
                <div className="pt-4 border-t border-line space-y-2">
                  <span className="text-xs font-bold text-ink-soft uppercase tracking-wider block">
                    Appointment Status Breakdown
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {metrics.appointmentStatusStatistics.map((st) => (
                      <span
                        key={st.status}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FAF7F6] border border-line text-ink"
                      >
                        <span className="capitalize">{st.status}</span>:
                        <span className="font-bold text-teal-deep">
                          {st.count}
                        </span>
                        <span className="text-[10px] text-ink-soft">
                          ({st.percentage}%)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* FILTERED APPOINTMENTS TABLE AUDIT */}
      <Card className="border-line shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-line flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-deep" />
              Filtered Consultation Records ({filteredAppointments.length})
            </CardTitle>
            <p className="text-xs text-ink-soft mt-0.5">
              Live audit dataset generated from active search and criteria
              filters.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetchAnalytics()}
            disabled={loading}
            className="text-xs h-8 border-line text-ink cursor-pointer gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-4 p-0 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-xs text-ink-soft gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-deep" />
              Loading report dataset from database...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FileText className="w-8 h-8 text-ink-soft mx-auto mb-2 opacity-40" />
              <h4 className="text-xs font-bold text-ink">No Records Found</h4>
              <p className="text-[11px] text-ink-soft mt-1">
                No appointments matched the specified search or filter
                parameters.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-3 text-xs h-8 cursor-pointer"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line bg-[#FAF7F6] text-ink font-semibold">
                    <th className="py-2.5 px-3">ID / Ref</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Treatment</th>
                    <th className="py-2.5 px-3">Assigned Doctor</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Meeting Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filteredAppointments.slice(0, 25).map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#FAF7F6]/50">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-ink-soft">
                        #{apt.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-ink block">
                          {apt.patient?.name || apt.patientName || "Anonymous"}
                        </span>
                        <span className="text-[11px] text-ink-soft block">
                          {apt.patient?.email || apt.patientEmail || ""}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-ink">
                          {apt.treatment ||
                            apt.tratmentType ||
                            "General Consultation"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-ink">
                          {apt.assignedDoctor?.name ||
                            apt.assignedDoctorName ||
                            "Unassigned"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-ink block">
                          {apt.confirmedDate ||
                            apt.preferredDate ||
                            apt.requestedDate ||
                            "—"}
                        </span>
                        <span className="text-[11px] text-ink-soft block">
                          {apt.confirmedTime ||
                            apt.preferredTime ||
                            apt.requestedTime ||
                            ""}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={(apt.status as any) || "pending"}
                          className="capitalize text-[10px]"
                        >
                          {apt.status || "pending"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        {apt.meetingLink ? (
                          <a
                            href={apt.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-deep hover:underline"
                          >
                            <Video className="w-3 h-3" /> Join Call
                          </a>
                        ) : (
                          <span className="text-[11px] text-ink-soft inline-flex items-center gap-1">
                            <Video className="w-3 h-3 text-ink-soft/50" />{" "}
                            Online (Pending)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAppointments.length > 25 && (
                <div className="p-3 text-center text-xs text-ink-soft border-t border-line bg-[#FAF7F6]/40">
                  Showing first 25 of {filteredAppointments.length} records.
                  Click Export CSV to download the complete dataset.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SAVE SNAPSHOT MODAL */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-deep" />
              Save Report Snapshot
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-soft">
              Persist the current filtered metrics and analytics to the database
              as an audit record.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSnapshot} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">
                Report Title <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={snapshotTitle}
                onChange={(e) => setSnapshotTitle(e.target.value)}
                placeholder="e.g. Q3 2026 Treatment Audit"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">
                Description / Memo (Optional)
              </label>
              <textarea
                value={snapshotDesc}
                onChange={(e) => setSnapshotDesc(e.target.value)}
                placeholder="Notes about current quarterly targets, patient volume, or anomalies..."
                rows={3}
                className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-deep resize-none"
              />
            </div>

            <div className="p-3 rounded-xl border border-line bg-[#FAF7F6] text-xs space-y-1">
              <span className="font-semibold text-ink block">
                Snapshot Contents:
              </span>
              <span className="text-ink-soft block">
                • {total} total appointments matching active filters
              </span>
              <span className="text-ink-soft block">
                • {completed} completed consultations ({completionRate}%)
              </span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSaveModalOpen(false)}
                className="text-xs h-8 border-line"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingSnapshot}
                className="text-xs h-8 gap-1.5 bg-[#5E3E3B] text-white hover:bg-[#262525] shadow-xs cursor-pointer"
              >
                {savingSnapshot && <Loader2 className="w-3 h-3 animate-spin" />}
                Save to Database
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SAVED REPORTS HISTORY MODAL */}
      <Dialog open={isSavedReportsOpen} onOpenChange={setIsSavedReportsOpen}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-ink flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-teal-deep" />
              Saved Report Snapshots
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-soft">
              Archived audit reports stored in PostgreSQL database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {loadingSavedReports ? (
              <div className="py-8 text-center text-xs text-ink-soft flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-deep" />
                Loading archived report snapshots...
              </div>
            ) : savedReports.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-soft">
                No saved report snapshots found. Click &quot;Save Snapshot&quot;
                above to create one.
              </div>
            ) : (
              savedReports.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-line bg-white hover:bg-[#FAF7F6] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-ink block">
                      {item.title}
                    </span>
                    {item.description && (
                      <p className="text-[11px] text-ink-soft">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-ink-soft">
                      <span>
                        Saved: {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-teal-deep">
                        {item.metrics?.totalAppointments ?? 0} Appointments
                      </span>
                      <span>•</span>
                      <span>
                        {item.metrics?.completionRate ?? 0}% Completion
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSavedReport(item.id)}
                      className="text-xs h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
