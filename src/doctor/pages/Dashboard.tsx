import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/auth/AuthContext";
import { appointmentService } from "@/lib/appointmentService";
import type { Appointment, ConsultationNotes } from "@/admin/types";
import { initialAppointments } from "@/admin/data/mockData";
import {
  Activity,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  History,
  LogOut,
  Mail,
  Phone,
  Search,
  Sparkles,
  Stethoscope,
  Video,
  X,
  AlertCircle,
} from "lucide-react";

type ScheduleTab = "today" | "upcoming" | "completed" | "all";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const all = appointmentService.getAppointments();
    return all.length > 0 ? all : initialAppointments;
  });
  const [activeTab, setActiveTab] = useState<ScheduleTab>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [availability, setAvailability] = useState<"available" | "busy" | "offline">("available");

  // Selected appointment for Consultation Workspace
  const [activeWorkspaceApt, setActiveWorkspaceApt] = useState<Appointment | null>(null);

  // Consultation Workspace Form state (SOW Section 7 exact fields)
  const [workspaceNotes, setWorkspaceNotes] = useState<ConsultationNotes>({
    chiefComplaint: "",
    findings: "",
    diagnosis: "",
    recommendedTreatment: "",
    additionalInstructions: "",
    followUpRequirements: "",
    internalNotes: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load appointments directly for UI display (all appointments / mock data)
  const loadDoctorAppointments = () => {
    const all = appointmentService.getAppointments();
    setAppointments(all.length > 0 ? all : initialAppointments);
  };

  useEffect(() => {
    loadDoctorAppointments();

    const handleSync = () => {
      loadDoctorAppointments();
    };

    window.addEventListener("dental_appointments_updated", handleSync);
    return () => {
      window.removeEventListener("dental_appointments_updated", handleSync);
    };
  }, []);

  const doctorName = user ? `Dr. ${user.firstName} ${user.lastName}` : "Dr. Sarah Jenkins";
  const doctorEmail = user?.email || "sarah.jenkins@cedarview.com";

  // Filter appointments according to SOW Section 7 schedule views
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return appointments.filter((apt) => {
      // Tab filter
      const aptDate = apt.confirmedDate || apt.requestedDate || "";
      if (activeTab === "today") {
        if (apt.status === "completed" || apt.status === "cancelled") return false;
        return aptDate === todayStr || !aptDate;
      } else if (activeTab === "upcoming") {
        if (apt.status === "completed" || apt.status === "cancelled") return false;
        return aptDate >= todayStr || !aptDate;
      } else if (activeTab === "completed") {
        if (apt.status !== "completed") return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = apt.patient?.name?.toLowerCase().includes(q);
        const matchesRef = apt.referenceNo?.toLowerCase().includes(q);
        const matchesTreatment = apt.treatment?.toLowerCase().includes(q);
        const matchesPhone = apt.patient?.phone?.includes(q);
        return matchesName || matchesRef || matchesTreatment || matchesPhone;
      }

      return true;
    });
  }, [appointments, activeTab, searchQuery]);

  // Open the Consultation Workspace for an appointment
  const handleOpenWorkspace = (apt: Appointment) => {
    setActiveWorkspaceApt(apt);
    setWorkspaceNotes({
      chiefComplaint: apt.consultationNotes?.chiefComplaint || apt.patientMessage || "",
      findings: apt.consultationNotes?.findings || "",
      diagnosis: apt.consultationNotes?.diagnosis || "",
      recommendedTreatment: apt.consultationNotes?.recommendedTreatment || apt.treatment || "",
      additionalInstructions: apt.consultationNotes?.additionalInstructions || "",
      followUpRequirements: apt.consultationNotes?.followUpRequirements || "",
      internalNotes: apt.consultationNotes?.internalNotes || "",
    });
  };

  // Mark consultation as completed (SOW Section 7 & 8 workflow)
  const handleCompleteConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspaceApt) return;

    appointmentService.completeConsultation(
      activeWorkspaceApt.id,
      workspaceNotes,
      doctorName
    );

    showToast(`Consultation for ${activeWorkspaceApt.patient.name} marked as Completed.`);
    setActiveWorkspaceApt(null);
    loadDoctorAppointments();
  };

  // Save consultation notes in progress without marking completed
  const handleSaveNotesDraft = () => {
    if (!activeWorkspaceApt) return;

    appointmentService.saveConsultationNotes(
      activeWorkspaceApt.id,
      workspaceNotes,
      doctorName
    );

    showToast("Consultation notes saved.");
    loadDoctorAppointments();
  };

  // Previous patient consultation history (SOW Section 8)
  const patientPreviousConsultations = useMemo(() => {
    if (!activeWorkspaceApt?.patient?.email) return [];
    return appointments.filter(
      (a) =>
        a.id !== activeWorkspaceApt.id &&
        a.patient.email.toLowerCase() === activeWorkspaceApt.patient.email.toLowerCase() &&
        a.status === "completed"
    );
  }, [activeWorkspaceApt, appointments]);

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-ink flex flex-col font-sans selection:bg-mint/30 selection:text-teal-deep">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-deep text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-lg border border-white/20 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-mint" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Doctor App Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-line px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-deep text-white flex items-center justify-center shadow-xs">
            <Stethoscope className="w-5 h-5 text-mint" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-lg text-teal-deep tracking-tight">
                Cedarview Dental
              </span>
              <span className="text-[10.5px] font-bold uppercase tracking-wider bg-[#EDF6F2] text-teal-deep px-2 py-0.5 rounded-full border border-teal-deep/15">
                Doctor Portal
              </span>
            </div>
            <p className="text-xs text-ink-soft">Consultation Workspace & Patient Queue</p>
          </div>
        </div>

        {/* Doctor profile & availability status (SOW Section 10) */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-[#EDF6F2] px-3 py-1.5 rounded-xl border border-teal-deep/10 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                availability === "available"
                  ? "bg-emerald-500 animate-pulse"
                  : availability === "busy"
                  ? "bg-amber-500"
                  : "bg-gray-400"
              }`}
            />
            <span className="font-medium text-teal-deep capitalize">
              {availability === "available" ? "Online & Available" : availability}
            </span>
          </div>

          <div className="flex items-center gap-2.5 pl-3 border-l border-line">
            <div className="w-9 h-9 rounded-full bg-teal-deep text-paper font-semibold flex items-center justify-center text-xs shadow-xs">
              {user?.firstName?.[0] || "D"}
              {user?.lastName?.[0] || "R"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-ink leading-tight">
                {doctorName}
              </span>
              <span className="text-[11px] text-ink-soft leading-tight">{doctorEmail}</span>
            </div>
            <button
              onClick={() => logout()}
              className="ml-2 flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Doctor Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-teal-deep text-white p-6 sm:p-8 shadow-sm">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-mint text-xs font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Doctor Consultation Workspace</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome, {doctorName}
              </h1>
              <p className="text-sm text-[#C3D8D0] mt-1 max-w-xl">
                Manage your scheduled appointments, conduct online video consultations, and record clinical findings as specified in the consultation workflow.
              </p>
            </div>

            {/* Quick Status Control */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm p-1.5 rounded-xl border border-white/10 shrink-0 text-xs">
              <button
                onClick={() => setAvailability("available")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  availability === "available"
                    ? "bg-white text-teal-deep shadow-xs font-semibold"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setAvailability("busy")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  availability === "busy"
                    ? "bg-white text-teal-deep shadow-xs font-semibold"
                    : "text-white/80 hover:text-white"
                }`}
              >
                In Consult
              </button>
              <button
                onClick={() => setAvailability("offline")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  availability === "offline"
                    ? "bg-white text-teal-deep shadow-xs font-semibold"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Offline
              </button>
            </div>
          </div>
        </div>

        {/* Real-time KPI Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-line shadow-xs">
            <div className="flex items-center justify-between text-ink-soft text-xs mb-2 font-medium">
              <span>Today's Consultations</span>
              <Calendar className="w-4 h-4 text-teal-deep" />
            </div>
            <div className="text-2xl font-display font-bold text-teal-deep">
              {appointments.filter((a) => a.status !== "completed" && a.status !== "cancelled").length}
            </div>
            <span className="text-[11px] text-ink-soft mt-1 inline-block">
              Pending consultations
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-line shadow-xs">
            <div className="flex items-center justify-between text-ink-soft text-xs mb-2 font-medium">
              <span>Online Video Calls</span>
              <Video className="w-4 h-4 text-mint-deep" />
            </div>
            <div className="text-2xl font-display font-bold text-teal-deep">
              {appointments.filter((a) => a.consultationType === "video" && a.status !== "completed").length}
            </div>
            <span className="text-[11px] text-teal-deep font-medium mt-1 inline-block">
              Video enabled
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-line shadow-xs">
            <div className="flex items-center justify-between text-ink-soft text-xs mb-2 font-medium">
              <span>Completed Consultations</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-display font-bold text-teal-deep">
              {appointments.filter((a) => a.status === "completed").length}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
              Notes recorded
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-line shadow-xs">
            <div className="flex items-center justify-between text-ink-soft text-xs mb-2 font-medium">
              <span>Total Assigned Patients</span>
              <Activity className="w-4 h-4 text-teal-deep" />
            </div>
            <div className="text-2xl font-display font-bold text-teal-deep">
              {appointments.length}
            </div>
            <span className="text-[11px] text-ink-soft mt-1 inline-block">In doctor queue</span>
          </div>
        </div>

        {/* Doctor Portal - Schedule & Consultation Queue (SOW Section 7) */}
        <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
          {/* Header with Search and Tabs */}
          <div className="p-5 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-lg text-ink">
                Doctor Consultation Schedule
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                View today's and upcoming appointments, patient records, and consultation links
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient, reference, treatment..."
                  className="text-xs pl-9 pr-3 py-2 rounded-xl border border-line bg-paper/50 focus:bg-white focus:border-mint-deep focus:outline-none w-full sm:w-64 transition-all"
                />
              </div>

              {/* Schedule Tabs */}
              <div className="flex items-center gap-1 bg-paper p-1 rounded-xl border border-line text-xs font-medium">
                <button
                  onClick={() => setActiveTab("today")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeTab === "today"
                      ? "bg-teal-deep text-white font-semibold shadow-xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeTab === "upcoming"
                      ? "bg-teal-deep text-white font-semibold shadow-xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeTab === "completed"
                      ? "bg-teal-deep text-white font-semibold shadow-xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeTab === "all"
                      ? "bg-teal-deep text-white font-semibold shadow-xs"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>

          {/* Appointments List / Empty State */}
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EDF6F2] text-teal-deep flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="font-display text-base font-semibold text-ink">
                No consultations in this view
              </h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto mt-1 leading-relaxed">
                When patient appointment requests are assigned to your schedule by clinic administrators, they will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {filteredAppointments.map((apt) => {
                const isCompleted = apt.status === "completed";
                const dateStr = apt.confirmedDate || apt.requestedDate;
                const timeStr = apt.confirmedTime || apt.requestedTime;

                return (
                  <div
                    key={apt.id}
                    className={`p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-colors ${
                      isCompleted ? "bg-gray-50/50" : "hover:bg-[#FAFDFB]"
                    }`}
                  >
                    {/* Patient and Case details */}
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-teal-deep/10 text-teal-deep font-bold flex items-center justify-center text-sm shrink-0">
                        {apt.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "P"}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-ink">
                            {apt.patient.name}
                          </span>
                          <span className="text-xs font-mono text-ink-soft bg-paper px-2 py-0.5 rounded border border-line">
                            {apt.referenceNo}
                          </span>
                          {apt.patient.age && (
                            <span className="text-xs text-ink-soft">
                              ({apt.patient.age} yrs{apt.patient.gender ? `, ${apt.patient.gender}` : ""})
                            </span>
                          )}

                          {/* Status Badge */}
                          <span
                            className={`text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              apt.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : apt.status === "approved"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {apt.status.replace("_", " ")}
                          </span>

                          {/* Consultation Type */}
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              apt.consultationType === "video"
                                ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                                : "bg-purple-50 text-purple-700 border-purple-200"
                            }`}
                          >
                            {apt.consultationType === "video" ? "Online Video" : "In Clinic"}
                          </span>
                        </div>

                        {/* Major Treatment requirement (SOW Section 2 & 7) */}
                        <p className="text-xs font-semibold text-teal-deep mt-1">
                          {apt.treatment}
                        </p>

                        {/* Patient Contact Info & Message */}
                        <div className="flex items-center gap-4 text-xs text-ink-soft mt-1.5 flex-wrap">
                          {apt.patient.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-ink-soft/70" />
                              <span>{apt.patient.email}</span>
                            </span>
                          )}
                          {apt.patient.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-ink-soft/70" />
                              <span>{apt.patient.phone}</span>
                            </span>
                          )}
                          {apt.patient.preferredContact && (
                            <span className="text-[11px] bg-paper px-2 py-0.5 rounded border border-line text-ink-soft capitalize">
                              Prefers: {apt.patient.preferredContact}
                            </span>
                          )}
                        </div>

                        {apt.patientMessage && (
                          <p className="text-xs text-ink-soft/90 mt-1.5 bg-paper/60 p-2 rounded-lg border border-line/60">
                            <span className="font-medium text-ink">Patient Note: </span>
                            {apt.patientMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Schedule and Consultation Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-2 lg:pt-0">
                      {/* Date & Time */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-ink bg-paper px-3 py-2 rounded-xl border border-line">
                        <Calendar className="w-3.5 h-3.5 text-teal-deep" />
                        <span>{dateStr}</span>
                        <Clock className="w-3.5 h-3.5 text-teal-deep ml-1" />
                        <span>{timeStr}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Access Online Consultation Link (SOW Section 5 & 7) */}
                        {apt.consultationType === "video" && (
                          <a
                            href={apt.meetingLink || `https://meet.google.com/new`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-teal-deep hover:bg-mint-deep active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5 text-mint" />
                            <span>Join Video Call</span>
                            <ExternalLink className="w-3 h-3 text-white/70" />
                          </a>
                        )}

                        {/* Open Consultation Workspace (SOW Section 7) */}
                        <button
                          onClick={() => handleOpenWorkspace(apt)}
                          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-teal-deep/30 bg-[#EDF6F2] hover:bg-teal-deep hover:text-white text-teal-deep text-xs font-semibold transition-all cursor-pointer shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isCompleted ? "View Workspace" : "Open Workspace"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* SOW Section 7: Consultation Workspace Modal */}
      {activeWorkspaceApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-line shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-line flex items-center justify-between bg-teal-deep text-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-mint">
                    Consultation Workspace
                  </span>
                  <span className="text-xs font-mono text-[#C3D8D0]">
                    Ref: {activeWorkspaceApt.referenceNo}
                  </span>
                </div>
                <h2 className="font-display font-bold text-xl sm:text-2xl mt-1">
                  {activeWorkspaceApt.patient.name}
                </h2>
                <p className="text-xs text-[#C3D8D0] mt-0.5">
                  Case Requirement: {activeWorkspaceApt.treatment} •{" "}
                  {activeWorkspaceApt.consultationType === "video" ? "Online Video" : "In Clinic"}
                </p>
              </div>

              <button
                onClick={() => setActiveWorkspaceApt(null)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body - Features all 7 documented fields from SOW Section 7 */}
            <form onSubmit={handleCompleteConsultation} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Meeting Link Quick Bar */}
              {activeWorkspaceApt.consultationType === "video" && (
                <div className="p-4 rounded-2xl bg-[#EDF6F2] border border-teal-deep/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-deep text-white flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5 text-mint" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-teal-deep">Video Consultation Room</span>
                      <p className="text-xs text-ink-soft truncate max-w-md">
                        {activeWorkspaceApt.meetingLink || "Standard encrypted clinic consultation link"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={activeWorkspaceApt.meetingLink || "https://meet.google.com/new"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-teal-deep text-white text-xs font-semibold hover:bg-mint-deep transition-all shrink-0"
                  >
                    <span>Launch Meeting</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Patient Medical Consultation Record - 7 fields from SOW Section 7 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Chief Complaint */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                    <span>1. Chief Complaint</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={workspaceNotes.chiefComplaint || ""}
                    onChange={(e) =>
                      setWorkspaceNotes((prev) => ({ ...prev, chiefComplaint: e.target.value }))
                    }
                    placeholder="Patient's reported dental symptoms, pain location, onset, or treatment inquiry..."
                    className="w-full text-xs p-3 rounded-xl border border-line bg-paper/40 focus:bg-white focus:border-mint-deep focus:outline-none transition-colors"
                  />
                </div>

                {/* 2. Consultation Findings */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    2. Consultation Findings
                  </label>
                  <textarea
                    rows={3}
                    value={workspaceNotes.findings || ""}
                    onChange={(e) =>
                      setWorkspaceNotes((prev) => ({ ...prev, findings: e.target.value }))
                    }
                    placeholder="Clinical observations, tooth condition, soft tissue, occlusion, visual assessment..."
                    className="w-full text-xs p-3 rounded-xl border border-line bg-paper/40 focus:bg-white focus:border-mint-deep focus:outline-none transition-colors"
                  />
                </div>

                {/* 3. Diagnosis / Assessment */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    3. Diagnosis / Assessment
                  </label>
                  <textarea
                    rows={3}
                    value={workspaceNotes.diagnosis || ""}
                    onChange={(e) =>
                      setWorkspaceNotes((prev) => ({ ...prev, diagnosis: e.target.value }))
                    }
                    placeholder="Clinical assessment (e.g. Class I Malocclusion, Pulpal Necrosis #19, Missing #14)..."
                    className="w-full text-xs p-3 rounded-xl border border-line bg-paper/40 focus:bg-white focus:border-mint-deep focus:outline-none transition-colors"
                  />
                </div>

                {/* 4. Recommended Treatment */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    4. Recommended Treatment
                  </label>
                  <textarea
                    rows={3}
                    value={workspaceNotes.recommendedTreatment || ""}
                    onChange={(e) =>
                      setWorkspaceNotes((prev) => ({
                        ...prev,
                        recommendedTreatment: e.target.value,
                      }))
                    }
                    placeholder="Recommended procedure, clear aligner plan, implant protocol, restoration..."
                    className="w-full text-xs p-3 rounded-xl border border-line bg-paper/40 focus:bg-white focus:border-mint-deep focus:outline-none transition-colors"
                  />
                </div>

                {/* 5. Additional Instructions */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    5. Additional Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={workspaceNotes.additionalInstructions || ""}
                    onChange={(e) =>
                      setWorkspaceNotes((prev) => ({
                        ...prev,
                        additionalInstructions: e.target.value,
                      }))
                    }
                    placeholder="Pre/post care instructions, oral hygiene recommendations, medication guidance..."
                    className="w-full text-xs p-3 rounded-xl border border-line bg-paper/40 focus:bg-white focus:border-mint-deep focus:outline-none transition-colors"
                  />
                </div>

                {/* 6. Follow-up Requirements */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    6. Follow-up Requirements
                  </label>
                  <textarea
                    rows={2}
                    value={workspaceNotes.followUpRequirements || ""}
                    onChange={(e) =>
                      setWorkspaceNotes((prev) => ({
                        ...prev,
                        followUpRequirements: e.target.value,
                      }))
                    }
                    placeholder="Required follow-up visit timeline (e.g. In-clinic scan in 2 weeks, review in 1 month)..."
                    className="w-full text-xs p-3 rounded-xl border border-line bg-paper/40 focus:bg-white focus:border-mint-deep focus:outline-none transition-colors"
                  />
                </div>

                {/* 7. Internal Notes (Private to doctor & clinic admin) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center justify-between">
                    <span>7. Internal Notes</span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                      Private to Doctor & Clinic
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={workspaceNotes.internalNotes || ""}
                    onChange={(e) =>
                      setWorkspaceNotes((prev) => ({
                        ...prev,
                        internalNotes: e.target.value,
                      }))
                    }
                    placeholder="Internal clinic observation, complexity rating, doctor notes..."
                    className="w-full text-xs p-3 rounded-xl border border-line bg-paper/40 focus:bg-white focus:border-mint-deep focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* SOW Section 8: Patient Previous Consultation History */}
              <div className="p-4 rounded-2xl bg-paper border border-line space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-deep">
                  <History className="w-4 h-4 text-teal-deep" />
                  <span>Previous Consultation History</span>
                </div>

                {patientPreviousConsultations.length === 0 ? (
                  <p className="text-xs text-ink-soft italic">
                    No prior consultations on record for this patient. This is their initial consultation record.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {patientPreviousConsultations.map((prevApt) => (
                      <div
                        key={prevApt.id}
                        className="p-3 rounded-xl bg-white border border-line text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-teal-deep font-semibold">
                            {prevApt.treatment}
                          </span>
                          <span className="text-ink-soft">
                            {prevApt.confirmedDate || prevApt.requestedDate}
                          </span>
                        </div>
                        {prevApt.consultationNotes?.diagnosis && (
                          <p className="text-ink-soft">
                            <span className="font-semibold text-ink">Diagnosis: </span>
                            {prevApt.consultationNotes.diagnosis}
                          </p>
                        )}
                        {prevApt.consultationNotes?.recommendedTreatment && (
                          <p className="text-ink-soft">
                            <span className="font-semibold text-ink">Treatment: </span>
                            {prevApt.consultationNotes.recommendedTreatment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-ink-soft">
                  <AlertCircle className="w-4 h-4 text-teal-deep" />
                  <span>
                    Marking as completed locks the clinical consultation sheet and adds an audit record.
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotesDraft}
                    className="py-2.5 px-4 rounded-xl border border-line hover:bg-line-soft/60 text-xs font-semibold text-ink transition-colors cursor-pointer"
                  >
                    Save Notes Draft
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-teal-deep hover:bg-mint-deep active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-mint" />
                    <span>Mark Consultation as Completed</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
