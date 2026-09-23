import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Video,
  Building2,
  FileText,
  User,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Search,
  ChevronRight,
  Download,
  Printer,
  History,
  ShieldCheck,
  Stethoscope,
  XCircle,
  RefreshCw,
  LogOut,
  Mail,
  Phone,
  Sparkles,
  PlayCircle,
  Info,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { appointmentService } from "@/lib/appointmentService";
import type {
  Appointment,
  AppointmentStatus,
  ConsultationNotes,
} from "@/admin/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { toast } from "react-toastify";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const SOW_STEPS: { status: AppointmentStatus; label: string; step: number }[] = [
  { status: "pending", label: "Requested", step: 1 },
  { status: "under_review", label: "Under Review", step: 2 },
  { status: "proposed", label: "Proposed", step: 3 },
  { status: "approved", label: "Approved", step: 4 },
  { status: "completed", label: "Completed", step: 5 },
];

export const PatientPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "completed" | "cancelled"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load appointments for this patient
  const fetchAppointments = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Get from localStorage service
      const localApts = appointmentService.getPatientAppointments({
        email: user.email,
        phone: user.phoneNumber,
        name: `${user.firstName} ${user.lastName}`,
      });

      // 2. Fetch from backend database
      let backendApts: Appointment[] = [];
      try {
        const res = await axios.get(
          `/api/appointment/get-appointments?email=${encodeURIComponent(user.email)}`
        );
        if (res.data?.success && Array.isArray(res.data.data)) {
          backendApts = res.data.data.map((b: any) => ({
            id: String(b.id),
            referenceNo: `APT-2026-${String(b.id).padStart(4, "0")}`,
            patient: {
              name: b.patientName,
              email: b.patientEmail,
              phone: b.phoneNumber || "",
              preferredContact: (b.contactMethod || "email") as any,
            },
            treatment: b.tratmentType as any,
            consultationType: "video",
            status: (b.status?.toLowerCase() || "pending") as AppointmentStatus,
            requestedDate: b.preferredDate,
            requestedTime: b.preferredTime || "Morning",
            patientMessage: b.additionalDescription || "",
            meetingLink: `https://meet.google.com/cdr-${String(b.id).padStart(3, "0")}-apt`,
            meetingPlatform: "google_meet",
            timeline: [
              {
                id: `tl_${b.id}`,
                timestamp: new Date(b.createdAt || Date.now()).toLocaleDateString(),
                action: "Appointment Request Submitted",
                actor: b.patientName,
              },
            ],
          }));
        }
      } catch (backendErr) {
        console.warn("Backend appointments fetch skipped:", backendErr);
      }

      // 3. Merge: Local appointments take priority for updated notes, status, and doctors
      const map = new Map<string, Appointment>();

      // First add backend
      backendApts.forEach((apt) => map.set(apt.id, apt));

      // Then overlay local updates (which include doctor notes, confirmed times, etc.)
      localApts.forEach((apt) => {
        const existing = map.get(apt.id);
        if (existing) {
          map.set(apt.id, {
            ...existing,
            ...apt,
            consultationNotes: apt.consultationNotes || existing.consultationNotes,
            meetingLink: apt.meetingLink || existing.meetingLink,
          });
        } else {
          map.set(apt.id, apt);
        }
      });

      const merged = Array.from(map.values()).sort((a, b) => {
        return Number(b.id) - Number(a.id);
      });

      setAppointments(merged);
    } catch (err) {
      console.error("Error loading patient appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    const handleUpdate = () => {
      fetchAppointments();
    };

    window.addEventListener("dental_appointments_updated", handleUpdate);
    return () => {
      window.removeEventListener("dental_appointments_updated", handleUpdate);
    };
  }, [user?.email]);

  // Filtering
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Tab filter
      if (activeFilter === "active") {
        if (["completed", "cancelled", "no_show"].includes(apt.status)) {
          return false;
        }
      } else if (activeFilter === "completed") {
        if (apt.status !== "completed") return false;
      } else if (activeFilter === "cancelled") {
        if (apt.status !== "cancelled") return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRef = apt.referenceNo?.toLowerCase().includes(q);
        const matchTreatment = apt.treatment?.toLowerCase().includes(q);
        const matchDoctor = apt.assignedDoctor?.name?.toLowerCase().includes(q);
        return matchRef || matchTreatment || matchDoctor;
      }

      return true;
    });
  }, [appointments, activeFilter, searchQuery]);

  // Find the next upcoming/active appointment to highlight in the hero
  const activeMeetingAppointment = useMemo(() => {
    return appointments.find(
      (a) =>
        (a.status === "approved" || a.status === "proposed") &&
        (a.meetingLink || a.consultationType === "video")
    );
  }, [appointments]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const active = appointments.filter(
      (a) => !["completed", "cancelled", "no_show"].includes(a.status)
    ).length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const online = appointments.filter(
      (a) => a.consultationType === "video" || a.meetingLink
    ).length;
    return { total, active, completed, online };
  }, [appointments]);

  // Copy meeting link
  const handleCopyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Meeting link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Cancel Appointment handler
  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;
    try {
      setIsCancelling(true);

      // Sync with backend if numeric ID
      if (!isNaN(Number(appointmentToCancel.id))) {
        await axios
          .patch(`/api/appointment/cancel-appointment/${appointmentToCancel.id}`)
          .catch((e) => console.warn("Backend cancel error:", e));
      }

      // Sync with local appointmentService
      appointmentService.updateAppointment(
        appointmentToCancel.id,
        { status: "cancelled" },
        `${user?.firstName} ${user?.lastName} (Patient)`
      );

      toast.info("Appointment has been cancelled.");
      setIsCancelConfirmOpen(false);
      setAppointmentToCancel(null);
      if (selectedAppointment?.id === appointmentToCancel.id) {
        setIsDetailOpen(false);
      }
      fetchAppointments();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      toast.error("Failed to cancel appointment. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border font-medium px-2.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Approved & Scheduled
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 border font-medium px-2.5 py-1">
            <Check className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Consultation Completed
          </Badge>
        );
      case "proposed":
        return (
          <Badge className="bg-amber-50 text-amber-800 border-amber-200 border font-medium px-2.5 py-1">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Slot Proposed by Clinic
          </Badge>
        );
      case "under_review":
        return (
          <Badge className="bg-teal-50 text-teal-800 border-teal-200 border font-medium px-2.5 py-1">
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-teal-600 animate-spin" />
            Under Review
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 border font-medium px-2.5 py-1">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
            Cancelled
          </Badge>
        );
      case "reschedule_requested":
        return (
          <Badge className="bg-orange-50 text-orange-700 border-orange-200 border font-medium px-2.5 py-1">
            <Clock className="w-3.5 h-3.5 mr-1 text-orange-500" />
            Reschedule Requested
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-50/80 text-amber-800 border-amber-200 border font-medium px-2.5 py-1">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            Pending Review
          </Badge>
        );
    }
  };

  // Step Progress index
  const getStepIndex = (status: AppointmentStatus) => {
    switch (status) {
      case "pending":
      case "requested":
        return 1;
      case "under_review":
        return 2;
      case "proposed":
      case "reschedule_requested":
        return 3;
      case "approved":
        return 4;
      case "completed":
        return 5;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans text-ink">
      {/* Main Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-line sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-teal-deep flex items-center justify-center text-paper shadow-xs group-hover:bg-mint-deep transition-colors">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#EFF6F2]">
                <path
                  d="M12 3C8.5 3 6 5.2 6 8.6c0 2.6.7 4.3 1.3 6.6.5 1.9.9 4.4 2 5.5.5.5 1.1.3 1.4-.4.5-1.2.6-3.4 1.3-3.4s.8 2.2 1.3 3.4c.3.7.9.9 1.4.4 1.1-1.1 1.5-3.6 2-5.5.6-2.3 1.3-4 1.3-6.6C18 5.2 15.5 3 12 3z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-medium text-lg leading-tight text-teal-deep">
                Cedarview Dental
              </span>
              <span className="text-[10px] font-semibold text-mint-deep tracking-wider uppercase">
                Patient Portal
              </span>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#EDF6F2] border border-line">
              <div className="w-7 h-7 rounded-lg bg-teal-deep text-white flex items-center justify-center text-xs font-semibold">
                {user?.firstName?.charAt(0) || "P"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-teal-deep leading-tight">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-ink-soft leading-none">
                  {user?.email}
                </span>
              </div>
            </div>

            <Link
              to="/appointment"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-deep hover:bg-mint-deep text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Welcome Banner & Quick Stats */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-line shadow-xs relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <h1 className="font-display text-2xl sm:text-3xl font-medium text-ink mb-2">
              Welcome back, {user?.firstName || "Patient"}!
            </h1>
            <p className="text-sm text-ink-soft leading-relaxed">
              Track the live review status of your dental appointment requests,
              access online video consultation rooms, and inspect doctor findings
              and clinical notes in one place.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-line">
            <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-line/70">
              <span className="text-xs text-ink-soft block mb-1">
                Total Requests
              </span>
              <span className="text-xl font-bold text-ink">{stats.total}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-line/70">
              <span className="text-xs text-ink-soft block mb-1">
                Active & Upcoming
              </span>
              <span className="text-xl font-bold text-teal-deep">
                {stats.active}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-line/70">
              <span className="text-xs text-ink-soft block mb-1">
                Video Consultations
              </span>
              <span className="text-xl font-bold text-mint-deep">
                {stats.online}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-line/70">
              <span className="text-xs text-ink-soft block mb-1">
                Completed Visits
              </span>
              <span className="text-xl font-bold text-emerald-600">
                {stats.completed}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: PROMINENT MEETING ACCESS BANNER (If video appointment approved) */}
        {activeMeetingAppointment && (
          <div className="rounded-3xl border-2 border-emerald-500/30 bg-linear-to-r from-emerald-50/80 via-teal-50/50 to-white p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Video className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-emerald-600 text-white font-semibold text-[11px]">
                      Ready to Join
                    </Badge>
                    <span className="text-xs font-semibold text-emerald-800">
                      Ref: {activeMeetingAppointment.referenceNo}
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-medium text-ink">
                    Online Video Consultation
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-soft mt-0.5">
                    <strong>Treatment:</strong> {activeMeetingAppointment.treatment} &bull;{" "}
                    <strong>Scheduled:</strong>{" "}
                    {activeMeetingAppointment.confirmedDate ||
                      activeMeetingAppointment.requestedDate}{" "}
                    ({activeMeetingAppointment.confirmedTime ||
                      activeMeetingAppointment.requestedTime})
                  </p>
                  {activeMeetingAppointment.assignedDoctor && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-teal-deep font-medium">
                      <Stethoscope className="w-3.5 h-3.5 text-mint-deep" />
                      <span>
                        Dentist: {activeMeetingAppointment.assignedDoctor.name} (
                        {activeMeetingAppointment.assignedDoctor.specialization})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
                {activeMeetingAppointment.meetingLink ? (
                  <>
                    <a
                      href={activeMeetingAppointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Join Consultation</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyMeetingLink(
                          activeMeetingAppointment.meetingLink || ""
                        )
                      }
                      className="h-11 px-3 text-xs border-emerald-200 hover:bg-emerald-50 text-emerald-800"
                      title="Copy meeting link"
                    >
                      {copiedLink ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-emerald-700" />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    disabled
                    variant="outline"
                    className="text-xs text-ink-soft bg-white"
                  >
                    Meeting link generating...
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAppointment(activeMeetingAppointment);
                    setIsDetailOpen(true);
                  }}
                  className="h-11 px-3.5 text-xs border-line bg-white hover:bg-paper"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: APPOINTMENT STATUS & TRACKING TABS */}
        <div className="space-y-4">
          {/* Header & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">
                My Appointments & Consultations
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Review live status updates, alternative proposed schedules, and
                history records.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-paper rounded-2xl border border-line text-xs font-medium">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeFilter === "all"
                    ? "bg-teal-deep text-white shadow-xs font-semibold"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setActiveFilter("active")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeFilter === "active"
                    ? "bg-teal-deep text-white shadow-xs font-semibold"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Active ({stats.active})
              </button>
              <button
                onClick={() => setActiveFilter("completed")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeFilter === "completed"
                    ? "bg-teal-deep text-white shadow-xs font-semibold"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Completed ({stats.completed})
              </button>
              <button
                onClick={() => setActiveFilter("cancelled")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeFilter === "cancelled"
                    ? "bg-teal-deep text-white shadow-xs font-semibold"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by reference #, treatment, or dentist..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-line bg-white text-ink placeholder:text-ink-soft/60 focus:border-mint-deep focus:ring-2 focus:ring-mint-deep/15 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className="bg-white rounded-3xl p-12 border border-line text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-deep mx-auto mb-2" />
              <p className="text-xs text-ink-soft">
                Loading your appointment records...
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-line text-center max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF6F2] text-teal-deep flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-medium text-lg text-ink">
                  No appointments found
                </h3>
                <p className="text-xs text-ink-soft mt-1">
                  {searchQuery
                    ? "No appointments match your search criteria. Try a different search term."
                    : activeFilter === "active"
                    ? "You have no active appointment requests pending right now."
                    : "You haven't requested any dental consultations yet."}
                </p>
              </div>
              <Link
                to="/appointment"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-deep hover:bg-mint-deep text-white text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Request an Appointment</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => {
                const stepIdx = getStepIndex(apt.status);
                const isCancelled = apt.status === "cancelled";

                return (
                  <Card
                    key={apt.id}
                    className="p-5 sm:p-6 bg-white border border-line rounded-3xl hover:border-mint-deep/50 transition-all shadow-2xs space-y-5"
                  >
                    {/* Top Row: Ref, Treatment & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/70">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-teal-deep bg-[#EDF6F2] px-2.5 py-0.5 rounded-md">
                            {apt.referenceNo}
                          </span>
                          <span className="text-xs text-ink-soft flex items-center gap-1">
                            {apt.consultationType === "video" ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-teal-700 bg-teal-50 border-teal-200"
                              >
                                <Video className="w-3 h-3 mr-1" /> Online Video
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-slate-700 bg-slate-50 border-slate-200"
                              >
                                <Building2 className="w-3 h-3 mr-1" /> In Clinic
                              </Badge>
                            )}
                          </span>
                        </div>
                        <h3 className="font-display font-medium text-base text-ink">
                          {apt.treatment}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {renderStatusBadge(apt.status)}
                      </div>
                    </div>

                    {/* SOW Visual Workflow Stepper (Only for non-cancelled) */}
                    {!isCancelled && (
                      <div className="py-2">
                        <div className="relative flex items-center justify-between max-w-2xl mx-auto">
                          {/* Background Connector Bar */}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-100 z-0" />
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-teal-deep transition-all duration-300 z-0"
                            style={{
                              width: `${((stepIdx - 1) / (SOW_STEPS.length - 1)) * 100}%`,
                            }}
                          />

                          {/* Step Nodes */}
                          {SOW_STEPS.map((s) => {
                            const isPast = stepIdx > s.step;
                            const isCurrent = stepIdx === s.step;

                            return (
                              <div
                                key={s.step}
                                className="relative z-10 flex flex-col items-center text-center"
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                    isCurrent
                                      ? "bg-teal-deep text-white ring-4 ring-teal-50 shadow-xs"
                                      : isPast
                                      ? "bg-mint-deep text-white"
                                      : "bg-slate-200 text-slate-500"
                                  }`}
                                >
                                  {isPast ? <Check className="w-3 h-3" /> : s.step}
                                </div>
                                <span
                                  className={`text-[10px] mt-1 font-medium hidden sm:block ${
                                    isCurrent
                                      ? "text-teal-deep font-bold"
                                      : isPast
                                      ? "text-ink"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs pt-1">
                      <div className="p-3 rounded-xl bg-[#F8FAF9] border border-line/60">
                        <span className="text-ink-soft block text-[11px] mb-0.5">
                          Requested Slot
                        </span>
                        <div className="font-semibold text-ink flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-deep shrink-0" />
                          <span>
                            {apt.requestedDate} &bull; {apt.requestedTime}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F8FAF9] border border-line/60">
                        <span className="text-ink-soft block text-[11px] mb-0.5">
                          Assigned Dentist
                        </span>
                        <div className="font-semibold text-ink flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-mint-deep shrink-0" />
                          <span>
                            {apt.assignedDoctor?.name ||
                              (apt.status === "approved"
                                ? "Dr. Clinic Specialist"
                                : "Assigning upon review")}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F8FAF9] border border-line/60">
                        <span className="text-ink-soft block text-[11px] mb-0.5">
                          Meeting / Visit Access
                        </span>
                        <div className="font-semibold text-ink truncate">
                          {apt.status === "approved" && apt.meetingLink ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              Video Link Ready
                            </span>
                          ) : apt.status === "completed" ? (
                            <span className="text-blue-700 flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              Clinical Notes Saved
                            </span>
                          ) : isCancelled ? (
                            <span className="text-rose-600">Request Inactive</span>
                          ) : (
                            <span className="text-amber-700">Under Clinic Review</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/70">
                      <div className="flex items-center gap-2">
                        {apt.status === "approved" && apt.meetingLink && (
                          <a
                            href={apt.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Join Video Call</span>
                          </a>
                        )}

                        {apt.consultationNotes?.diagnosis && (
                          <Badge className="bg-blue-50 text-blue-800 border-blue-200 border text-xs font-medium">
                            Diagnosis: {apt.consultationNotes.diagnosis}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setIsDetailOpen(true);
                          }}
                          className="text-xs h-8 px-3 border-line hover:bg-paper"
                        >
                          <span>Full Details & Notes</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>

                        {!["completed", "cancelled", "no_show"].includes(
                          apt.status
                        )}
                        {!["completed", "cancelled", "no_show"].includes(
                          apt.status
                        ) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAppointmentToCancel(apt);
                              setIsCancelConfirmOpen(true);
                            }}
                            className="text-xs h-8 px-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: APPOINTMENT DETAIL & CLINICAL CONSULTATION NOTES */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-6 bg-white max-h-[90vh] overflow-y-auto rounded-3xl">
          {selectedAppointment && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-teal-deep bg-[#EDF6F2] px-2.5 py-1 rounded-md">
                    {selectedAppointment.referenceNo}
                  </span>
                  {renderStatusBadge(selectedAppointment.status)}
                </div>
                <DialogTitle className="font-display text-xl font-semibold text-ink mt-2">
                  {selectedAppointment.treatment}
                </DialogTitle>
                <DialogDescription className="text-xs text-ink-soft">
                  Requested on {selectedAppointment.requestedDate} &bull;{" "}
                  {selectedAppointment.consultationType === "video"
                    ? "Online Video Consultation"
                    : "In-Clinic Visit"}
                </DialogDescription>
              </DialogHeader>

              {/* Online Video Meeting Section */}
              {selectedAppointment.meetingLink && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-emerald-600" />
                      Consultation Meeting Access
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">
                      {selectedAppointment.meetingPlatform || "Google Meet"}
                    </Badge>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    Your dentist has confirmed this slot. Click below to join the
                    secure video consultation room.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={selectedAppointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Join Call Room</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyMeetingLink(selectedAppointment.meetingLink || "")
                      }
                      className="text-xs h-8 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                    >
                      {copiedLink ? "Link Copied" : "Copy Link"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Schedule & Dentist Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-line">
                  <span className="text-ink-soft block font-medium mb-1">
                    Appointment Schedule
                  </span>
                  <p className="font-semibold text-ink text-sm">
                    {selectedAppointment.confirmedDate ||
                      selectedAppointment.requestedDate}
                  </p>
                  <p className="text-ink-soft">
                    {selectedAppointment.confirmedTime ||
                      selectedAppointment.requestedTime}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-line">
                  <span className="text-ink-soft block font-medium mb-1">
                    Care Provider
                  </span>
                  <p className="font-semibold text-ink text-sm">
                    {selectedAppointment.assignedDoctor?.name ||
                      "Clinic Assigned Dentist"}
                  </p>
                  <p className="text-ink-soft">
                    {selectedAppointment.assignedDoctor?.specialization ||
                      "General Dentistry"}
                  </p>
                </div>
              </div>

              {/* Patient Message / Complaint */}
              {selectedAppointment.patientMessage && (
                <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-line text-xs">
                  <span className="text-ink-soft block font-semibold mb-1">
                    Patient Symptoms & Inquiry Notes
                  </span>
                  <p className="text-ink leading-relaxed">
                    {selectedAppointment.patientMessage}
                  </p>
                </div>
              )}

              {/* CLINICAL CONSULTATION HISTORY & DOCTOR NOTES (SOW §8) */}
              {selectedAppointment.consultationNotes && (
                <div className="border border-line rounded-2xl p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <span className="font-display font-semibold text-sm text-teal-deep flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-mint-deep" />
                      Doctor Consultation Record & Clinical Summary
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.print()}
                      className="text-xs h-7 px-2 text-teal-deep hover:bg-[#EDF6F2]"
                      title="Print consultation record"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Print
                    </Button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {selectedAppointment.consultationNotes.chiefComplaint && (
                      <div>
                        <span className="font-semibold text-ink-soft block">
                          1. Chief Complaint:
                        </span>
                        <p className="text-ink mt-0.5">
                          {selectedAppointment.consultationNotes.chiefComplaint}
                        </p>
                      </div>
                    )}

                    {selectedAppointment.consultationNotes.findings && (
                      <div>
                        <span className="font-semibold text-ink-soft block">
                          2. Clinical Findings & Observations:
                        </span>
                        <p className="text-ink mt-0.5">
                          {selectedAppointment.consultationNotes.findings}
                        </p>
                      </div>
                    )}

                    {selectedAppointment.consultationNotes.diagnosis && (
                      <div>
                        <span className="font-semibold text-ink-soft block">
                          3. Diagnosis / Assessment:
                        </span>
                        <p className="text-teal-deep font-semibold mt-0.5">
                          {selectedAppointment.consultationNotes.diagnosis}
                        </p>
                      </div>
                    )}

                    {selectedAppointment.consultationNotes.recommendedTreatment && (
                      <div>
                        <span className="font-semibold text-ink-soft block">
                          4. Recommended Treatment Plan:
                        </span>
                        <p className="text-ink mt-0.5">
                          {selectedAppointment.consultationNotes.recommendedTreatment}
                        </p>
                      </div>
                    )}

                    {selectedAppointment.consultationNotes.additionalInstructions && (
                      <div>
                        <span className="font-semibold text-ink-soft block">
                          5. Care & Oral Hygiene Instructions:
                        </span>
                        <p className="text-ink mt-0.5">
                          {selectedAppointment.consultationNotes.additionalInstructions}
                        </p>
                      </div>
                    )}

                    {selectedAppointment.consultationNotes.followUpRequirements && (
                      <div>
                        <span className="font-semibold text-ink-soft block">
                          6. Follow-up Timeline:
                        </span>
                        <p className="text-ink mt-0.5">
                          {selectedAppointment.consultationNotes.followUpRequirements}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                  className="text-xs h-9 px-4"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CANCEL CONFIRMATION DIALOG */}
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full p-6 bg-white rounded-3xl">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5" />
            </div>
            <DialogTitle className="font-display text-lg font-semibold text-ink">
              Cancel Consultation Request?
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-soft leading-relaxed mt-1">
              Are you sure you want to cancel appointment{" "}
              <strong>{appointmentToCancel?.referenceNo}</strong> (
              {appointmentToCancel?.treatment})? The clinic will be notified
              automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-line mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={isCancelling}
              onClick={() => setIsCancelConfirmOpen(false)}
              className="text-xs"
            >
              Keep Appointment
            </Button>
            <Button
              size="sm"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Footer/>
    </div>
  );
};

export default PatientPortal;
