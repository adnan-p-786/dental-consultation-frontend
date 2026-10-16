import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/auth/AuthContext";
import { appointmentService } from "@/lib/appointmentService";
import { useAppointmentsQuery } from "@/api/Appointment/appointmentHooks";
import type {
  Appointment,
  ConsultationNotes,
  TreatmentType,
  AppointmentStatus,
} from "@/admin/types";
import { initialAppointments } from "@/admin/data/mockData";
import { documentTreatmentCategories } from "@/pages/Appointment";
import { DoctorSidebar, type DoctorTab } from "../components/DoctorSidebar";
import { DoctorHeader } from "../components/DoctorHeader";
import {
  Activity,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  History,
  Mail,
  Phone,
  Search,
  Sparkles,
  Stethoscope,
  Video,
  X,
  AlertCircle,
  User,
  Edit3,
  Printer,
  CalendarCheck,
  Paperclip,
  ArrowRight,
  Copy,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";


type ScheduleFilter = "today" | "upcoming" | "in_progress" | "completed" | "all";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data: dbAppointments = [], refetch: refetchAppointments } =
    useAppointmentsQuery();

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const all = appointmentService.getAppointments();
    return all.length > 0 ? all : initialAppointments;
  });

  // Sidebar & Layout State matching Super Admin Dashboard
  const [activeTab, setActiveTab] = useState<DoctorTab>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768 && window.innerWidth < 1120;
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilter>("today");
  // Modals state
  const [activeWorkspaceApt, setActiveWorkspaceApt] =
    useState<Appointment | null>(null);
  const [selectedPatientInfoApt, setSelectedPatientInfoApt] =
    useState<Appointment | null>(null);

  // Treatment Update Modal state
  const [treatmentModalApt, setTreatmentModalApt] =
    useState<Appointment | null>(null);
  const [updatedTreatmentType, setUpdatedTreatmentType] =
    useState<string>("General Dental Consultation");
  const [updatedTreatmentStatus, setUpdatedTreatmentStatus] =
    useState<AppointmentStatus>("approved");
  const [treatmentProgressNote, setTreatmentProgressNote] =
    useState<string>("");

  // Consultation Workspace state
  const [customMeetingLink, setCustomMeetingLink] = useState("");
  const [workspaceNotes, setWorkspaceNotes] = useState<ConsultationNotes>({
    chiefComplaint: "",
    findings: "",
    diagnosis: "",
    recommendedTreatment: "",
    additionalInstructions: "",
    followUpRequirements: "",
    internalNotes: "",
  });

  // Sync fresh appointments from query cache
  useEffect(() => {
    if (dbAppointments && dbAppointments.length > 0) {
      setAppointments(dbAppointments);
    }
  }, [dbAppointments]);

  // Sync events from local storage / appointments service
  useEffect(() => {
    const handleSync = () => {
      refetchAppointments();
      const all = appointmentService.getAppointments();
      if (all.length > 0) setAppointments(all);
    };

    window.addEventListener("dental_appointments_updated", handleSync);
    return () => {
      window.removeEventListener("dental_appointments_updated", handleSync);
    };
  }, [refetchAppointments]);

  // Keep active workspace appointment in sync if refreshed
  useEffect(() => {
    if (activeWorkspaceApt) {
      const refreshed = appointments.find(
        (a) => String(a.id) === String(activeWorkspaceApt.id),
      );
      if (refreshed) {
        const link =
          refreshed.meetingLink ||
          (refreshed as any).meeting_link ||
          (refreshed as any).consultation?.meetingLink ||
          "";
        if (link && !customMeetingLink) {
          setCustomMeetingLink(link);
        }
      }
    }
  }, [appointments, activeWorkspaceApt, customMeetingLink]);

  const doctorName = user
    ? `Dr. ${user.firstName} ${user.lastName}`
    : "Dr. Sarah Jenkins";

  // Bulletproof doctor assignment matching
  const isAssignedToDoctor = (apt: Appointment): boolean => {
    // 1. Direct ID check (doctor.id, assignedDoctorId, or consultation.doctorId)
    const myId = user?.id ? String(user.id).trim() : "";
    const aptDocId = String(
      apt.assignedDoctorId ||
      apt.assignedDoctor?.id ||
      (apt as any).consultation?.doctorId ||
      "",
    ).trim();

    if (myId && aptDocId) {
      if (aptDocId === myId) return true;
      if (aptDocId.replace("user-", "") === myId.replace("user-", "")) return true;
    }

    // 2. Email check
    const myEmail = (user?.email || "").toLowerCase().trim();
    const aptDocEmail = (
      apt.assignedDoctor?.email ||
      (apt as any).assignedDoctorEmail ||
      ""
    ).toLowerCase().trim();
    if (myEmail && aptDocEmail && myEmail === aptDocEmail) {
      return true;
    }

    // 3. Name check (e.g. "Dr. Adnan P" vs "Adnan P")
    const cleanDocName = (name?: string) =>
      (name || "")
        .toLowerCase()
        .replace(/^dr\.?\s*/i, "")
        .replace(/^doctor\s*/i, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();

    const currentDocClean = user
      ? cleanDocName(`${user.firstName || ""} ${user.lastName || ""}`)
      : cleanDocName("Sarah Jenkins");

    const aptDocNameClean = cleanDocName(
      apt.assignedDoctorName || apt.assignedDoctor?.name || "",
    );

    if (currentDocClean && aptDocNameClean) {
      if (currentDocClean === aptDocNameClean) return true;
      if (currentDocClean.length >= 3 && aptDocNameClean.includes(currentDocClean))
        return true;
      if (aptDocNameClean.length >= 3 && currentDocClean.includes(aptDocNameClean))
        return true;
    }

    return false;
  };

  // Strictly filter appointments belonging ONLY to this doctor
  const doctorAppointments = useMemo(() => {
    return appointments.filter((apt) => isAssignedToDoctor(apt));
  }, [appointments, user]);

  // Filtered Appointments based on Schedule filter & Search (ONLY for this doctor)
  const filteredAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return doctorAppointments.filter((apt) => {
      // 1. Schedule Filter
      const aptDate = apt.confirmedDate || apt.requestedDate || "";
      if (scheduleFilter === "today") {
        if (apt.status === "completed" || apt.status === "cancelled")
          return false;
        if (aptDate !== todayStr && aptDate) return false;
      } else if (scheduleFilter === "upcoming") {
        if (apt.status === "completed" || apt.status === "cancelled")
          return false;
        if (aptDate < todayStr && aptDate) return false;
      } else if (scheduleFilter === "in_progress") {
        if (apt.status !== "approved" && apt.status !== "under_review")
          return false;
      } else if (scheduleFilter === "completed") {
        if (apt.status !== "completed") return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = apt.patient?.name?.toLowerCase().includes(q);
        const matchesRef = apt.referenceNo?.toLowerCase().includes(q);
        const matchesTreatment = apt.treatment?.toLowerCase().includes(q);
        const matchesPhone = apt.patient?.phone?.includes(q);
        const matchesEmail = apt.patient?.email?.toLowerCase().includes(q);
        return (
          matchesName ||
          matchesRef ||
          matchesTreatment ||
          matchesPhone ||
          matchesEmail
        );
      }

      return true;
    });
  }, [doctorAppointments, scheduleFilter, searchQuery]);

  // Unique Patient Directory list - ONLY this doctor's patients
  const patientDirectory = useMemo(() => {
    const map = new Map<string, { patient: any; appointments: Appointment[] }>();

    doctorAppointments.forEach((apt) => {
      const email =
        apt.patient?.email?.toLowerCase().trim() ||
        apt.patient?.name?.toLowerCase().trim();
      if (!email) return;

      if (!map.has(email)) {
        map.set(email, {
          patient: apt.patient,
          appointments: [],
        });
      }
      map.get(email)!.appointments.push(apt);
    });

    let list = Array.from(map.values());

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.patient.name?.toLowerCase().includes(q) ||
          item.patient.email?.toLowerCase().includes(q) ||
          item.patient.phone?.includes(q),
      );
    }

    return list;
  }, [doctorAppointments, searchQuery]);

  // KPIs strictly for this doctor
  const myAssignedCount = doctorAppointments.length;

  const todayAppointments = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return doctorAppointments.filter((a) => {
      const d = a.confirmedDate || a.requestedDate;
      return d === todayStr && a.status !== "completed" && a.status !== "cancelled";
    });
  }, [doctorAppointments]);

  const todayCount = todayAppointments.length;

  const completedCount = useMemo(
    () => doctorAppointments.filter((a) => a.status === "completed").length,
    [doctorAppointments],
  );

  const activeVideoCount = useMemo(
    () =>
      doctorAppointments.filter(
        (a) =>
          (a.consultationType === "video" || Boolean(a.meetingLink)) &&
          a.status !== "completed",
      ).length,
    [doctorAppointments],
  );

  // Tab counts for Assigned Appointments filter tabs
  const scheduleCounts = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    let today = 0;
    let upcoming = 0;
    let inProgress = 0;
    let completed = 0;

    doctorAppointments.forEach((apt) => {
      const aptDate = apt.confirmedDate || apt.requestedDate || "";
      const isNotDone =
        apt.status !== "completed" && apt.status !== "cancelled";

      if (isNotDone && (!aptDate || aptDate === todayStr)) {
        today++;
      }
      if (isNotDone && (!aptDate || aptDate >= todayStr)) {
        upcoming++;
      }
      if (apt.status === "approved" || apt.status === "under_review") {
        inProgress++;
      }
      if (apt.status === "completed") {
        completed++;
      }
    });

    return {
      today,
      upcoming,
      in_progress: inProgress,
      completed,
      all: doctorAppointments.length,
    };
  }, [doctorAppointments]);

  // Open the Consultation Workspace for an appointment
  const handleOpenWorkspace = (apt: Appointment) => {
    // Resolve freshest appointment state from memory or localStorage
    const allLocal = appointmentService.getAppointments();
    const fresh =
      appointments.find((a) => String(a.id) === String(apt.id)) ||
      allLocal.find((a) => String(a.id) === String(apt.id)) ||
      apt;

    const resolvedMeetingLink =
      fresh.meetingLink ||
      apt.meetingLink ||
      (fresh as any).meeting_link ||
      (apt as any).meeting_link ||
      (fresh as any).consultation?.meetingLink ||
      (fresh as any).consultation?.meeting_link ||
      (fresh as any).videoLink ||
      "";

    setActiveWorkspaceApt(fresh);
    setCustomMeetingLink(resolvedMeetingLink);
    setWorkspaceNotes({
      chiefComplaint:
        fresh.consultationNotes?.chiefComplaint ||
        fresh.patientMessage ||
        apt.patientMessage ||
        "",
      findings: fresh.consultationNotes?.findings || "",
      diagnosis: fresh.consultationNotes?.diagnosis || "",
      recommendedTreatment:
        fresh.consultationNotes?.recommendedTreatment || fresh.treatment || "",
      additionalInstructions:
        fresh.consultationNotes?.additionalInstructions || "",
      followUpRequirements: fresh.consultationNotes?.followUpRequirements || "",
      internalNotes: fresh.consultationNotes?.internalNotes || "",
    });
  };

  // Quick update/save meeting link from workspace
  const formatMeetingUrl = (url: string) => {
    let trimmed = url.trim();
    if (!trimmed) return "";
    if (!/^https?:\/\//i.test(trimmed) && trimmed.includes(".")) {
      trimmed = `https://${trimmed}`;
    }
    return trimmed;
  };

  // Quick update/save meeting link from workspace
  const handleUpdateMeetingLinkFromWorkspace = (link: string) => {
    const cleanLink = formatMeetingUrl(link);
    setCustomMeetingLink(cleanLink);
    if (!activeWorkspaceApt) return;

    appointmentService.updateAppointment(
      activeWorkspaceApt.id,
      { meetingLink: cleanLink || undefined },
      doctorName,
    );

    setActiveWorkspaceApt((prev) =>
      prev ? { ...prev, meetingLink: cleanLink || undefined } : null,
    );
    refetchAppointments();
    toast.success(
      cleanLink ? "Video meeting link saved!" : "Meeting link cleared",
    );
  };

  // Open Treatment Update Modal
  const handleOpenTreatmentModal = (apt: Appointment) => {
    setTreatmentModalApt(apt);
    setUpdatedTreatmentType(apt.treatment || "General Dental Consultation");
    setUpdatedTreatmentStatus(apt.status || "approved");
    setTreatmentProgressNote(apt.patientMessage || "");
  };

  // Submit Treatment Updates
  const handleSaveTreatmentUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentModalApt) return;

    appointmentService.updateAppointment(
      treatmentModalApt.id,
      {
        treatment: updatedTreatmentType as TreatmentType,
        status: updatedTreatmentStatus,
        patientMessage: treatmentProgressNote.trim() || undefined,
      },
      doctorName,
    );

    setTreatmentModalApt(null);
    refetchAppointments();
    toast.success("Treatment details updated successfully!");
  };

  // Mark consultation as completed
  const handleCompleteConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspaceApt) return;

    const cleanLink = formatMeetingUrl(customMeetingLink);

    if (cleanLink !== (activeWorkspaceApt.meetingLink || "")) {
      appointmentService.updateAppointment(
        activeWorkspaceApt.id,
        { meetingLink: cleanLink || undefined },
        doctorName,
      );
    }

    appointmentService.completeConsultation(
      activeWorkspaceApt.id,
      workspaceNotes,
      doctorName,
    );

    setActiveWorkspaceApt(null);
    refetchAppointments();

    toast.success("Consultation Completed & Clinical Notes Saved!");
  };

  // Save consultation notes draft
  const handleSaveNotesDraft = () => {
    if (!activeWorkspaceApt) return;

    const cleanLink = formatMeetingUrl(customMeetingLink);

    if (cleanLink !== (activeWorkspaceApt.meetingLink || "")) {
      appointmentService.updateAppointment(
        activeWorkspaceApt.id,
        { meetingLink: cleanLink || undefined },
        doctorName,
      );
    }

    appointmentService.saveConsultationNotes(
      activeWorkspaceApt.id,
      workspaceNotes,
      doctorName,
    );

    refetchAppointments();
    toast.success("Clinical Notes Draft Saved");
  };

  // Print & Export Professional Clinical Summary Slip
  const handlePrintConsultationSummary = (
    apt: Appointment,
    notes?: ConsultationNotes,
  ) => {
    const currentNotes = notes || apt.consultationNotes || {};
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print consultation slip");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Clinical Consultation Summary - ${apt.patient.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #261B1A; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #5E3E3B; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #5E3E3B; }
            .subtitle { font-size: 13px; color: #635351; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #FAF7F6; padding: 15px; border-radius: 8px; font-size: 13px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #5E3E3B; border-bottom: 1px solid #E8DCD8; padding-bottom: 4px; margin-bottom: 8px; }
            .section-content { font-size: 13px; line-height: 1.6; color: #261B1A; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8DCD8; display: flex; justify-content: space-between; font-size: 12px; color: #635351; }
            .signature { margin-top: 40px; border-top: 1px solid #261B1A; display: inline-block; padding-top: 5px; width: 220px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">32Stories Dental Clinic</div>
              <div class="subtitle">Online Consultation & Clinical Record Summary</div>
            </div>
            <div style="text-align: right; font-size: 12px;">
              <div><strong>Ref:</strong> ${apt.referenceNo}</div>
              <div><strong>Date:</strong> ${apt.confirmedDate || apt.requestedDate || new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <div><strong>Patient Name:</strong> ${apt.patient.name}</div>
              <div><strong>Email:</strong> ${apt.patient.email}</div>
              <div><strong>Phone:</strong> ${apt.patient.phone}</div>
            </div>
            <div>
              <div><strong>Attending Doctor:</strong> ${doctorName}</div>
              <div><strong>Treatment Specialty:</strong> ${apt.treatment}</div>
              <div><strong>Consultation Format:</strong> ${apt.consultationType === "video" ? "Online Video Call" : "In-Clinic"}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">1. Chief Complaint</div>
            <div class="section-content">${currentNotes.chiefComplaint || apt.patientMessage || "None recorded"}</div>
          </div>

          <div class="section">
            <div class="section-title">2. Clinical Findings & Examination</div>
            <div class="section-content">${currentNotes.findings || "Clinical evaluation performed."}</div>
          </div>

          <div class="section">
            <div class="section-title">3. Diagnosis & Clinical Assessment</div>
            <div class="section-content"><strong>${currentNotes.diagnosis || "Assessment completed."}</strong></div>
          </div>

          <div class="section">
            <div class="section-title">4. Recommended Treatment Plan</div>
            <div class="section-content">${currentNotes.recommendedTreatment || apt.treatment || "Standard dental treatment protocol."}</div>
          </div>

          <div class="section">
            <div class="section-title">5. Instructions & Prescriptions</div>
            <div class="section-content">${currentNotes.additionalInstructions || "Maintain optimal oral hygiene. Follow post-consultation care."}</div>
          </div>

          <div class="section">
            <div class="section-title">6. Follow-up Timeline</div>
            <div class="section-content">${currentNotes.followUpRequirements || "As needed upon review."}</div>
          </div>

          <div class="footer">
            <div>32Stories Online Dental System • Official Medical Summary</div>
            <div>
              <div class="signature">${doctorName}<br/><span style="font-size: 10px; color: #635351;">Attending Dental Specialist</span></div>
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  // Patient previous consultation history
  const patientPreviousConsultations = useMemo(() => {
    if (!activeWorkspaceApt?.patient?.email) return [];
    return appointments.filter(
      (a) =>
        a.id !== activeWorkspaceApt.id &&
        a.patient?.email?.toLowerCase() ===
          activeWorkspaceApt.patient.email.toLowerCase() &&
        a.status === "completed",
    );
  }, [activeWorkspaceApt, appointments]);

  return (
    <div className="dashboard-shell flex min-h-screen text-ink font-sans antialiased">
      {/* 1. Doctor Sidebar matching Super Admin layout & collapse toggle */}
      <DoctorSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        assignedCount={myAssignedCount}
        todayCount={todayCount}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <DoctorHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          todayAppointments={todayAppointments}
          onSelectAppointment={handleOpenWorkspace}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto">
          {/* =============================================================== */}
          {/* TAB 1: OVERVIEW (DASHBOARD HUB)                                 */}
          {/* =============================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-5 sm:space-y-6">
              {/* Doctor Welcome Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-7 rounded-3xl border border-line shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 text-mint-deep text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-mint-deep animate-pulse" />
                    <span>Clinical Command Center</span>
                  </div>
                  <h2 className="font-display font-semibold text-xl sm:text-2xl text-ink">
                    Welcome back, {doctorName}
                  </h2>
                  <p className="text-xs text-ink-soft mt-1 max-w-xl">
                    You have <strong>{todayCount} consultations</strong> scheduled
                    for today. Manage assigned appointments, join video calls,
                    record clinical findings, and update treatment plans.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("appointments")}
                    className="py-2.5 px-4 rounded-xl bg-teal-deep hover:bg-teal-mid text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4 text-mint" />
                    <span>View Today's Queue</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("consultations")}
                    className="py-2.5 px-4 rounded-xl border border-line hover:bg-paper text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-teal-deep" />
                    <span>Telehealth Rooms</span>
                  </button>
                </div>
              </div>

              {/* KPI Statistics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-line shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between text-ink-soft text-xs mb-2 font-medium">
                    <span>My Assigned Patients</span>
                    <User className="w-4 h-4 text-teal-deep" />
                  </div>
                  <div className="text-3xl font-display font-bold text-teal-deep">
                    {myAssignedCount}
                  </div>
                  <span className="text-[11px] text-mint-deep font-semibold mt-1 inline-block">
                    In your clinical queue
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-line shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between text-ink-soft text-xs mb-2 font-medium">
                    <span>Today's Appointments</span>
                    <Calendar className="w-4 h-4 text-teal-deep" />
                  </div>
                  <div className="text-3xl font-display font-bold text-teal-deep">
                    {todayCount}
                  </div>
                  <span className="text-[11px] text-ink-soft mt-1 inline-block">
                    Scheduled for today
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-line shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between text-ink-soft text-xs mb-2 font-medium">
                    <span>Completed Consultations</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-display font-bold text-teal-deep">
                    {completedCount}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                    Clinical notes archived
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-line shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between text-ink-soft text-xs mb-2 font-medium">
                    <span>Active Telehealth Calls</span>
                    <Video className="w-4 h-4 text-mint-deep" />
                  </div>
                  <div className="text-3xl font-display font-bold text-teal-deep">
                    {activeVideoCount}
                  </div>
                  <span className="text-[11px] text-teal-deep font-medium mt-1 inline-block">
                    Video rooms enabled
                  </span>
                </div>
              </div>

              {/* Today's Schedule Live Overview */}
              <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-line">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-ink">
                      Today's Consultation Schedule
                    </h3>
                    <p className="text-xs text-ink-soft">
                      Appointments queued for direct examination or video consultation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("appointments")}
                    className="text-xs font-semibold text-teal-deep hover:text-mint-deep inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Schedule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {todayAppointments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-ink-soft">
                    No active consultations remaining for today.
                  </div>
                ) : (
                  <div className="divide-y divide-line">
                    {todayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-teal-deep/10 text-teal-deep flex items-center justify-center font-bold text-xs shrink-0">
                            {apt.patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-ink">
                                {apt.patient.name}
                              </span>
                              <span className="text-xs font-mono text-ink-soft">
                                {apt.referenceNo}
                              </span>
                            </div>
                            <p className="text-xs text-teal-deep font-medium">
                              {apt.treatment} •{" "}
                              {apt.meetingLink || apt.consultationType === "video"
                                ? "Video Call"
                                : "In Clinic"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-ink bg-paper px-2.5 py-1.5 rounded-lg border border-line">
                            {apt.confirmedTime || apt.requestedTime}
                          </span>
                          {apt.meetingLink && (
                            <a
                              href={apt.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1.5 px-3 rounded-lg bg-teal-deep text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5 text-mint" />
                              <span>Join</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenWorkspace(apt)}
                            className="py-1.5 px-3 rounded-lg border border-line hover:bg-paper text-ink text-xs font-semibold cursor-pointer"
                          >
                            Workspace
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: ASSIGNED APPOINTMENTS                                    */}
          {/* =============================================================== */}
          {activeTab === "appointments" && (
            <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
              {/* Header Controls: Scope, Filters, and Search */}
              <div className="p-5 sm:p-6 border-b border-line flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-display font-semibold text-lg text-ink">
                      My Patients
                    </h2>
                  </div>
                  <p className="text-xs text-ink-soft">
                    Clinical appointments, schedule slots, and video rooms assigned specifically to you.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search patient, treatment, ref..."
                      className="text-xs pl-9 pr-3 py-2 rounded-xl border border-line bg-paper/50 focus:bg-white focus:border-mint-deep focus:outline-none w-full sm:w-60 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-paper p-1 rounded-xl border border-line text-xs font-medium overflow-x-auto">
                    {[
                      {
                        key: "today" as const,
                        label: "Today",
                        count: scheduleCounts.today,
                      },
                      {
                        key: "upcoming" as const,
                        label: "Upcoming",
                        count: scheduleCounts.upcoming,
                      },
                      {
                        key: "in_progress" as const,
                        label: "Active",
                        count: scheduleCounts.in_progress,
                      },
                      {
                        key: "completed" as const,
                        label: "Completed",
                        count: scheduleCounts.completed,
                      },
                      {
                        key: "all" as const,
                        label: "All",
                        count: scheduleCounts.all,
                      },
                    ].map((tab) => {
                      const isActive = scheduleFilter === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setScheduleFilter(tab.key)}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            isActive
                              ? "bg-teal-deep text-white font-semibold shadow-xs"
                              : "text-ink-soft hover:text-ink hover:bg-line-soft/60"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-line text-ink-soft"
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Appointments List */}
              {filteredAppointments.length === 0 ? (
                <div className="p-14 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF2F0] text-teal-deep flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <Stethoscope className="w-7 h-7 text-mint-deep" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-ink">
                    No assigned appointments found
                  </h3>
                  <p className="text-xs text-ink-soft max-w-sm mx-auto mt-1 leading-relaxed">
                    You have no consultations assigned under this filter. Check other filters or search query.
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
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-teal-deep/10 text-teal-deep font-bold flex items-center justify-center text-sm shrink-0 shadow-2xs">
                            {apt.patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "P"}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-ink">
                                {apt.patient.name}
                              </span>
                              <span className="text-xs font-mono text-ink-soft bg-paper px-2 py-0.5 rounded border border-line">
                                {apt.referenceNo}
                              </span>
                              {apt.patient.age && (
                                <span className="text-xs text-ink-soft">
                                  ({apt.patient.age} yrs
                                  {apt.patient.gender
                                    ? `, ${apt.patient.gender}`
                                    : ""}
                                  )
                                </span>
                              )}

                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                  apt.status === "completed"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : apt.status === "approved"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}
                              >
                                {apt.status.replace("_", " ")}
                              </span>

                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                  apt.consultationType === "video"
                                    ? "bg-cyan-50 text-cyan-800 border-cyan-200"
                                    : "bg-purple-50 text-purple-700 border-purple-200"
                                }`}
                              >
                                {apt.consultationType === "video"
                                  ? "Online Video"
                                  : "In Clinic"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-teal-deep">
                                {apt.treatment}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-ink-soft flex-wrap">
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
                              {apt.documents && apt.documents.length > 0 && (
                                <span className="text-[11px] text-teal-deep font-semibold flex items-center gap-1 bg-[#FAF2F0] px-2 py-0.5 rounded border border-teal-deep/20">
                                  <Paperclip className="w-3 h-3" />
                                  <span>
                                    {apt.documents.length} Attachment
                                    {apt.documents.length > 1 ? "s" : ""}
                                  </span>
                                </span>
                              )}
                            </div>

                            {apt.patientMessage && (
                              <p className="text-xs text-ink-soft bg-paper p-2 rounded-xl border border-line/70 max-w-xl">
                                <strong className="text-ink">Patient Note:</strong>{" "}
                                {apt.patientMessage}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-2 lg:pt-0">
                          <div className="flex items-center gap-2 text-xs font-semibold text-ink bg-paper px-3 py-2 rounded-xl border border-line">
                            <Calendar className="w-3.5 h-3.5 text-teal-deep" />
                            <span>{dateStr}</span>
                            <Clock className="w-3.5 h-3.5 text-teal-deep ml-1" />
                            <span>{timeStr}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleOpenWorkspace(apt)}
                              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-teal-deep/30 bg-[#FAF2F0] hover:bg-[#262525] hover:text-white text-teal-deep text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>
                                {isCompleted ? "View Notes" : "Open Workspace"}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedPatientInfoApt(apt)}
                              className="p-2 rounded-xl border border-line hover:bg-paper text-ink-soft hover:text-ink transition-colors cursor-pointer"
                              title="View Patient Record"
                            >
                              <User className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: PATIENTS DIRECTORY                                       */}
          {/* =============================================================== */}
          {activeTab === "patients" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-line p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line mb-6">
                  <div>
                    <h2 className="font-display font-semibold text-lg text-ink">
                      Patient Clinical Directory
                    </h2>
                    <p className="text-xs text-ink-soft">
                      Comprehensive patient profiles, medical histories, contact
                      details, and uploaded dental X-rays.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search patients by name or phone..."
                      className="text-xs pl-9 pr-3 py-2 rounded-xl border border-line bg-paper/50 focus:bg-white focus:border-mint-deep focus:outline-none w-full"
                    />
                  </div>
                </div>

                {patientDirectory.length === 0 ? (
                  <div className="p-14 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF2F0] text-teal-deep flex items-center justify-center mx-auto mb-3 shadow-2xs">
                      <User className="w-7 h-7 text-mint-deep" />
                    </div>
                    <h3 className="font-display text-base font-semibold text-ink">
                      No patient profiles found
                    </h3>
                    <p className="text-xs text-ink-soft max-w-sm mx-auto mt-1 leading-relaxed">
                      Only patients assigned to your consultations will appear in your clinical directory.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {patientDirectory.map((item, idx) => {
                      const { patient, appointments: patientApts } = item;
                      const latestApt = patientApts[0];
                      const hasAttachments = patientApts.some(
                        (a) => a.documents && a.documents.length > 0,
                      );

                      return (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-paper/50 border border-line hover:border-mint-deep/60 hover:bg-white transition-all shadow-2xs space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-teal-deep text-white font-bold flex items-center justify-center text-sm shadow-xs">
                                {patient.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase() || "P"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-sm text-ink truncate">
                                  {patient.name}
                                </h3>
                                <p className="text-xs text-ink-soft truncate">
                                  {patient.email || "No email recorded"}
                                </p>
                              </div>
                            </div>

                            <div className="text-xs text-ink-soft space-y-1.5 pt-2 border-t border-line/60">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-mint-deep" />
                                  <span>Phone:</span>
                                </span>
                                <span className="font-medium text-ink">
                                  {patient.phone || "N/A"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span>Preferred Contact:</span>
                                <span className="font-semibold text-teal-deep capitalize">
                                  {patient.preferredContact || "Email"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span>Total Visits / Requests:</span>
                                <span className="font-bold text-ink">
                                  {patientApts.length}
                                </span>
                              </div>

                              {latestApt && (
                                <div className="flex items-center justify-between">
                                  <span>Latest Treatment:</span>
                                  <span className="font-semibold text-teal-deep truncate max-w-35 text-right">
                                    {latestApt.treatment}
                                  </span>
                                </div>
                              )}
                            </div>

                            {hasAttachments && (
                              <div className="p-2 rounded-xl bg-[#FAF2F0] border border-teal-deep/15 text-[11px] text-teal-deep flex items-center gap-1.5 font-medium">
                                <Paperclip className="w-3.5 h-3.5 text-mint-deep" />
                                <span>Dental X-rays / Records on file</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-line/60 flex items-center justify-between gap-2">
                            {latestApt && (
                              <button
                                type="button"
                                onClick={() => setSelectedPatientInfoApt(latestApt)}
                                className="flex-1 py-2 px-3 rounded-xl border border-line hover:bg-paper text-ink font-semibold text-xs text-center transition-colors cursor-pointer"
                              >
                                View Full Record
                              </button>
                            )}
                            {latestApt && (
                              <button
                                type="button"
                                onClick={() => handleOpenWorkspace(latestApt)}
                                className="py-2 px-3 rounded-xl bg-teal-deep hover:bg-teal-mid text-white font-semibold text-xs transition-colors cursor-pointer"
                              >
                                Workspace
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: LIVE CONSULTATIONS (TELEHEALTH ROOMS)                    */}
          {/* =============================================================== */}
          {activeTab === "consultations" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-line p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-5 border-b border-line mb-6">
                  <div>
                    <h2 className="font-display font-semibold text-lg text-ink">
                      Active Telehealth Video Consultations
                    </h2>
                    <p className="text-xs text-ink-soft">
                      Direct video rooms for live clinical evaluations.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700">
                      Telehealth Bridge Active
                    </span>
                  </div>
                </div>

                {doctorAppointments.filter((a) => a.consultationType === "video" || Boolean(a.meetingLink)).length === 0 ? (
                  <div className="p-14 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF2F0] text-teal-deep flex items-center justify-center mx-auto mb-3 shadow-2xs">
                      <Video className="w-7 h-7 text-mint-deep" />
                    </div>
                    <h3 className="font-display text-base font-semibold text-ink">
                      No live video consultations
                    </h3>
                    <p className="text-xs text-ink-soft max-w-sm mx-auto mt-1 leading-relaxed">
                      There are currently no telehealth video appointments assigned to your schedule.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {doctorAppointments
                      .filter((a) => a.consultationType === "video" || Boolean(a.meetingLink))
                      .map((apt) => (
                        <div
                          key={apt.id}
                          className="p-5 rounded-2xl bg-[#FAF7F6] border border-line space-y-4 hover:border-mint-deep/60 transition-colors shadow-2xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs font-mono text-ink-soft">
                                {apt.referenceNo}
                              </span>
                              <h3 className="font-display font-semibold text-base text-ink">
                                {apt.patient.name}
                              </h3>
                              <span className="text-xs font-semibold text-teal-deep">
                                {apt.treatment}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                apt.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-line/70 text-xs text-ink-soft space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span>Scheduled Time:</span>
                              <span className="font-semibold text-ink">
                                {apt.confirmedDate || apt.requestedDate} at{" "}
                                {apt.confirmedTime || apt.requestedTime}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Patient Contact:</span>
                              <span className="font-medium text-ink">
                                {apt.patient.email || apt.patient.phone}
                              </span>
                            </div>
                            {apt.meetingLink && (
                              <div className="flex items-center justify-between pt-1 border-t border-line/60">
                                <span>Meeting URL:</span>
                                <span className="font-mono text-teal-deep truncate max-w-45">
                                  {apt.meetingLink}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            {apt.meetingLink && apt.status !== "completed" && (
                              <a
                                href={apt.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2.5 px-4 rounded-xl bg-teal-deep hover:bg-teal-mid text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                              >
                                <Video className="w-4 h-4 text-mint" />
                                <span>Join Video Call</span>
                                <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenWorkspace(apt)}
                              className="py-2.5 px-4 rounded-xl border border-teal-deep/30 bg-white hover:bg-paper text-teal-deep text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Workspace Notes
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 5: CONSULTATION NOTES ARCHIVE                               */}
          {/* =============================================================== */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-line p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line mb-6">
                  <div>
                    <h2 className="font-display font-semibold text-lg text-ink">
                      Clinical Consultation Notes Archive
                    </h2>
                    <p className="text-xs text-ink-soft">
                      Review all clinical assessments, diagnoses, prescriptions,
                      and print official summary slips.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by diagnosis or treatment..."
                      className="text-xs pl-9 pr-3 py-2 rounded-xl border border-line bg-paper/50 focus:bg-white focus:border-mint-deep focus:outline-none w-full"
                    />
                  </div>
                </div>

                {doctorAppointments.filter(
                  (a) =>
                    a.consultationNotes?.diagnosis ||
                    a.consultationNotes?.findings ||
                    a.status === "completed",
                ).length === 0 ? (
                  <div className="p-14 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF2F0] text-teal-deep flex items-center justify-center mx-auto mb-3 shadow-2xs">
                      <FileText className="w-7 h-7 text-mint-deep" />
                    </div>
                    <h3 className="font-display text-base font-semibold text-ink">
                      No clinical consultation notes found
                    </h3>
                    <p className="text-xs text-ink-soft max-w-sm mx-auto mt-1 leading-relaxed">
                      Clinical notes and consultation summaries for your assigned patients will appear here once recorded.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doctorAppointments
                      .filter(
                        (a) =>
                          a.consultationNotes?.diagnosis ||
                          a.consultationNotes?.findings ||
                          a.status === "completed",
                      )
                      .map((apt) => {
                        const notes = apt.consultationNotes || {};

                        return (
                          <div
                            key={apt.id}
                            className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F6] border border-line space-y-4 hover:border-mint-deep/60 transition-colors shadow-2xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/70">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-display font-semibold text-base text-ink">
                                    {apt.patient.name}
                                  </h3>
                                  <span className="text-xs font-mono text-ink-soft">
                                    {apt.referenceNo}
                                  </span>
                                </div>
                                <span className="text-xs font-semibold text-teal-deep">
                                  Case: {apt.treatment}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs text-ink-soft">
                                  {apt.confirmedDate || apt.requestedDate}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handlePrintConsultationSummary(apt)}
                                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-line bg-white hover:bg-paper text-ink font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 text-teal-deep" />
                                  <span>Print Summary Slip</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenWorkspace(apt)}
                                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-deep hover:bg-teal-mid text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit Notes</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div className="p-3 rounded-xl bg-white border border-line/60">
                                <span className="font-bold text-teal-deep uppercase tracking-wider block text-[10.5px] mb-1">
                                  Chief Complaint
                                </span>
                                <p className="text-ink-soft">
                                  {notes.chiefComplaint ||
                                    apt.patientMessage ||
                                    "None specified"}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-white border border-line/60">
                                <span className="font-bold text-teal-deep uppercase tracking-wider block text-[10.5px] mb-1">
                                  Clinical Diagnosis
                                </span>
                                <p className="font-semibold text-ink">
                                  {notes.diagnosis || "Pending diagnostic entry"}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-white border border-line/60">
                                <span className="font-bold text-teal-deep uppercase tracking-wider block text-[10.5px] mb-1">
                                  Recommended Treatment
                                </span>
                                <p className="text-ink-soft">
                                  {notes.recommendedTreatment || apt.treatment}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-white border border-line/60">
                                <span className="font-bold text-teal-deep uppercase tracking-wider block text-[10.5px] mb-1">
                                  Instructions & Rx
                                </span>
                                <p className="text-ink-soft">
                                  {notes.additionalInstructions ||
                                    "Standard post-care oral hygiene"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 6: TREATMENT UPDATES & CARE PLANS                           */}
          {/* =============================================================== */}
          {activeTab === "treatments" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-line p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line mb-6">
                  <div>
                    <h2 className="font-display font-semibold text-lg text-ink">
                      Patient Treatment Updates & Care Plans
                    </h2>
                    <p className="text-xs text-ink-soft">
                      Adjust major treatment specialty cases, progress statuses,
                      and clinical procedure notes.
                    </p>
                  </div>
                </div>

                {doctorAppointments.length === 0 ? (
                  <div className="p-14 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF2F0] text-teal-deep flex items-center justify-center mx-auto mb-3 shadow-2xs">
                      <Activity className="w-7 h-7 text-mint-deep" />
                    </div>
                    <h3 className="font-display text-base font-semibold text-ink">
                      No treatment plans assigned
                    </h3>
                    <p className="text-xs text-ink-soft max-w-sm mx-auto mt-1 leading-relaxed">
                      Treatment updates and clinical care plans will be available once patients are assigned to your schedule.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-line">
                    {doctorAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-paper/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-ink">
                              {apt.patient.name}
                            </span>
                            <span className="text-xs font-mono text-ink-soft bg-paper px-2 py-0.5 rounded border border-line">
                              {apt.referenceNo}
                            </span>
                            <span className="text-xs font-semibold text-teal-deep bg-[#FAF2F0] px-2.5 py-0.5 rounded-full border border-teal-deep/20">
                              {apt.treatment}
                            </span>
                          </div>
                          <p className="text-xs text-ink-soft">
                            Current Status:{" "}
                            <strong className="text-ink capitalize">
                              {apt.status.replace("_", " ")}
                            </strong>{" "}
                            • Last scheduled:{" "}
                            {apt.confirmedDate || apt.requestedDate}
                          </p>
                          {apt.patientMessage && (
                            <p className="text-xs text-ink-soft italic">
                              "{apt.patientMessage}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenTreatmentModal(apt)}
                            className="py-2 px-4 rounded-xl bg-teal-deep hover:bg-teal-mid text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Update Treatment Plan</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenWorkspace(apt)}
                            className="py-2 px-3.5 rounded-xl border border-line hover:bg-paper text-ink font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Workspace
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: CONSULTATION WORKSPACE (7 SOW Fields + Quick Templates)    */}
      {/* =================================================================== */}
      {activeWorkspaceApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-line shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-line flex items-center justify-between bg-teal-deep text-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-mint">
                    Clinical Workspace
                  </span>
                  <span className="text-xs font-mono text-[#EBD8D5]">
                    Ref: {activeWorkspaceApt.referenceNo}
                  </span>
                </div>
                <h2 className="font-display font-bold text-xl sm:text-2xl mt-1">
                  {activeWorkspaceApt.patient.name}
                </h2>
                <p className="text-xs text-[#EBD8D5] mt-0.5">
                  Treatment: {activeWorkspaceApt.treatment} • Format:{" "}
                  {customMeetingLink || activeWorkspaceApt.consultationType === "video"
                    ? "Online Video Call"
                    : "In-Clinic Visit"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handlePrintConsultationSummary(
                      activeWorkspaceApt,
                      workspaceNotes,
                    )
                  }
                  className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print summary slip"
                >
                  <Printer className="w-3.5 h-3.5 text-mint" />
                  <span className="hidden sm:inline">Print Slip</span>
                </button>
                <button
                  onClick={() => setActiveWorkspaceApt(null)}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleCompleteConsultation}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6"
            >
              {/* Video Consultation Room - Always accessible for assigned appointments */}
              <div className="p-4 rounded-2xl bg-[#FAF2F0] border border-teal-deep/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-deep text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Video className="w-5 h-5 text-mint" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-teal-deep block">
                        Video Consultation Room
                      </span>
                      {customMeetingLink ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Link Active
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full border border-amber-200">
                          Awaiting Video Link
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="text"
                        value={customMeetingLink}
                        onChange={(e) => setCustomMeetingLink(e.target.value)}
                        placeholder="https://meet.google.com/... or paste video room link"
                        className="text-xs font-mono w-full px-2.5 py-1.5 bg-white border border-line rounded-lg text-ink outline-none focus:border-teal-deep focus:ring-1 focus:ring-teal-deep"
                      />
                      {customMeetingLink !== (activeWorkspaceApt.meetingLink || "") && (
                        <button
                          type="button"
                          onClick={() => handleUpdateMeetingLinkFromWorkspace(customMeetingLink)}
                          className="shrink-0 px-3 py-1.5 bg-teal-deep text-white text-xs font-semibold rounded-lg hover:bg-teal-mid transition-colors cursor-pointer"
                        >
                          Save Link
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {customMeetingLink ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(customMeetingLink);
                          toast.success("Meeting link copied to clipboard!");
                        }}
                        className="p-2 rounded-xl border border-line bg-white hover:bg-paper text-ink-soft hover:text-ink text-xs font-semibold transition-colors cursor-pointer"
                        title="Copy meeting link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={
                          customMeetingLink.startsWith("http")
                            ? customMeetingLink
                            : `https://${customMeetingLink}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-[#5E3E3B] text-white text-xs font-semibold hover:bg-[#262525] transition-all cursor-pointer shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5 text-mint" />
                        <span>Join Call</span>
                        <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-ink-soft italic hidden sm:inline">
                      Enter or paste link to enable video call
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      setWorkspaceNotes((prev) => ({
                        ...prev,
                        chiefComplaint: e.target.value,
                      }))
                    }
                    placeholder="Patient's reported dental symptoms, pain location, onset, or treatment inquiry..."
                    className="w-full text-xs p-3 rounded-xl border border-line bg-paper/40 focus:bg-white focus:border-mint-deep focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    2. Consultation Findings & Oral Exam
                  </label>
                  <textarea
                    rows={3}
                    value={workspaceNotes.findings || ""}
                    onChange={(e) =>
                      setWorkspaceNotes((prev) => ({
                        ...prev,
                        findings: e.target.value,
                      }))
                    }
                    placeholder="Clinical observations, tooth condition, soft tissue, occlusion, visual assessment..."
                    className="w-full text-xs p-3 rounded-xl border border-line bg-paper/40 focus:bg-white focus:border-mint-deep focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    3. Diagnosis / Clinical Assessment
                  </label>
                  <textarea
                    rows={3}
                    value={workspaceNotes.diagnosis || ""}
                    onChange={(e) =>
                      setWorkspaceNotes((prev) => ({
                        ...prev,
                        diagnosis: e.target.value,
                      }))
                    }
                    placeholder="Clinical assessment (e.g. Class I Malocclusion, Pulpal Necrosis #19, Missing #14)..."
                    className="w-full text-xs p-3 rounded-xl border border-line bg-paper/40 focus:bg-white focus:border-mint-deep focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    4. Recommended Treatment Plan
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    5. Additional Instructions & Prescriptions
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    6. Follow-up Timeline & Requirements
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
                    placeholder="Required follow-up timeline (e.g. Follow-up in 2 weeks for aligner check)..."
                    className="w-full text-xs p-3 rounded-xl border border-line bg-paper/40 focus:bg-white focus:border-mint-deep focus:outline-none transition-colors"
                  />
                </div>

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

              {/* Patient Previous History */}
              <div className="p-4 rounded-2xl bg-paper border border-line space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-deep">
                  <History className="w-4 h-4 text-teal-deep" />
                  <span>Previous Consultation History for this Patient</span>
                </div>

                {patientPreviousConsultations.length === 0 ? (
                  <p className="text-xs text-ink-soft italic">
                    No prior consultations recorded for this patient. This is
                    their initial clinical record.
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
                            <span className="font-semibold text-ink">
                              Diagnosis:{" "}
                            </span>
                            {prevApt.consultationNotes.diagnosis}
                          </p>
                        )}
                        {prevApt.consultationNotes?.recommendedTreatment && (
                          <p className="text-ink-soft">
                            <span className="font-semibold text-ink">
                              Treatment:{" "}
                            </span>
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
                    Completing marks the appointment finished and saves notes.
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
                    className="py-2.5 px-5 rounded-xl bg-[#5E3E3B] hover:bg-[#262525] active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-mint" />
                    <span>Complete Consultation</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: PATIENT FULL RECORD & UPLOADED X-RAYS                      */}
      {/* =================================================================== */}
      {selectedPatientInfoApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-line shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-line flex items-center justify-between bg-teal-deep text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                  <User className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">
                    {selectedPatientInfoApt.patient.name}
                  </h3>
                  <p className="text-xs text-[#EBD8D5]">
                    Ref: {selectedPatientInfoApt.referenceNo}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatientInfoApt(null)}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              <div className="bg-paper p-4 rounded-2xl border border-line space-y-2.5">
                <h4 className="font-bold text-teal-deep uppercase tracking-wider text-[11px]">
                  Contact & Demographics
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-ink-soft block">Email Address:</span>
                    <span className="font-semibold text-ink">
                      {selectedPatientInfoApt.patient.email || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-soft block">Phone Number:</span>
                    <span className="font-semibold text-ink">
                      {selectedPatientInfoApt.patient.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-soft block">Preferred Contact:</span>
                    <span className="font-semibold text-teal-deep capitalize">
                      {selectedPatientInfoApt.patient.preferredContact || "Email"}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-soft block">Age / Gender:</span>
                    <span className="font-medium text-ink">
                      {selectedPatientInfoApt.patient.age
                        ? `${selectedPatientInfoApt.patient.age} yrs`
                        : "Not specified"}
                      {selectedPatientInfoApt.patient.gender
                        ? `, ${selectedPatientInfoApt.patient.gender}`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-paper p-4 rounded-2xl border border-line space-y-2">
                <h4 className="font-bold text-teal-deep uppercase tracking-wider text-[11px]">
                  Patient Reported Symptoms / Message
                </h4>
                <p className="text-ink leading-relaxed">
                  {selectedPatientInfoApt.patientMessage ||
                    "No additional message was provided during booking."}
                </p>
              </div>

              <div className="bg-paper p-4 rounded-2xl border border-line space-y-3">
                <h4 className="font-bold text-teal-deep uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-mint-deep" />
                  <span>Uploaded Dental Attachments / X-Rays</span>
                </h4>

                {selectedPatientInfoApt.documents &&
                selectedPatientInfoApt.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPatientInfoApt.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl bg-white border border-line flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4 h-4 text-teal-deep shrink-0" />
                          <div className="truncate">
                            <span className="font-medium text-ink truncate block">
                              {doc.name}
                            </span>
                            <span className="text-[10px] text-ink-soft">
                              {doc.size} • {doc.uploadedAt}
                            </span>
                          </div>
                        </div>

                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-3 rounded-lg bg-teal-deep hover:bg-teal-mid text-white text-[11px] font-semibold flex items-center gap-1 shrink-0"
                          >
                            <span>Open File</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-ink-soft italic">
                    No documents or X-rays were attached for this appointment.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPatientInfoApt(null)}
                className="py-2 px-5 rounded-xl bg-teal-deep text-white text-xs font-semibold cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: QUICK TREATMENT UPDATE MODAL                              */}
      {/* =================================================================== */}
      {treatmentModalApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-line shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-line flex items-center justify-between bg-teal-deep text-white">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-mint" />
                <div>
                  <h3 className="font-display font-bold text-base">
                    Update Treatment Plan
                  </h3>
                  <p className="text-xs text-[#EBD8D5]">
                    Patient: {treatmentModalApt.patient.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTreatmentModalApt(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveTreatmentUpdate}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                  Dental Specialty / Treatment Case
                </label>
                <select
                  value={updatedTreatmentType}
                  onChange={(e) => setUpdatedTreatmentType(e.target.value)}
                  className="w-full h-10 text-xs px-3.5 rounded-xl border border-line bg-white text-ink shadow-2xs hover:border-[#5E3E3B]/40 hover:bg-[#FAF7F6]/40 focus:ring-2 focus:ring-[#5E3E3B]/15 focus:border-[#5E3E3B] font-medium cursor-pointer transition-all outline-none"
                >
                  {documentTreatmentCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                  Clinical Progress Status
                </label>
                <select
                  value={updatedTreatmentStatus}
                  onChange={(e) =>
                    setUpdatedTreatmentStatus(e.target.value as AppointmentStatus)
                  }
                  className="w-full h-10 text-xs px-3.5 rounded-xl border border-line bg-white text-ink shadow-2xs hover:border-[#5E3E3B]/40 hover:bg-[#FAF7F6]/40 focus:ring-2 focus:ring-[#5E3E3B]/15 focus:border-[#5E3E3B] font-medium cursor-pointer transition-all outline-none"
                >
                  <option value="approved">Approved & Scheduled</option>
                  <option value="under_review">Under Clinical Review</option>
                  <option value="completed">Completed / Procedure Finished</option>
                  <option value="reschedule_requested">
                    Reschedule Required
                  </option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                  Treatment Progress Notes / Instructions
                </label>
                <textarea
                  rows={3}
                  value={treatmentProgressNote}
                  onChange={(e) => setTreatmentProgressNote(e.target.value)}
                  placeholder="Record treatment progress, phase details, or clinical instructions..."
                  className="w-full text-xs p-3 rounded-xl border border-line bg-paper/50 focus:bg-white focus:border-mint-deep focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setTreatmentModalApt(null)}
                  className="py-2 px-4 rounded-xl border border-line hover:bg-paper font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-teal-deep hover:bg-teal-mid text-white font-semibold cursor-pointer shadow-xs"
                >
                  Save Treatment Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
