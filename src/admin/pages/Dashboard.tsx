import { useState, useMemo, useEffect } from "react";
import {
  MoreVertical,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Video,
  AlertCircle,
  Eye,
  CalendarCheck,
  Check,
  UserCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminSidebar, type AdminTab } from "../components/AdminSidebar";
import { AdminHeader } from "../components/AdminHeader";
import { AppointmentDetailModal } from "../components/AppointmentDetailModal";
import { NewAppointmentModal } from "../components/NewAppointmentModal";
import { DeleteAppointmentModal } from "../components/DeleteAppointmentModal";
import { AppointmentCalendarView } from "../components/AppointmentCalendarView";
import { DoctorManagementView } from "../components/DoctorManagementView";
import { ReportsView } from "../components/ReportsView";
import { SettingsView } from "../components/SettingsView";
import { initialDoctors } from "../data/mockData";
import type {
  Appointment,
  AppointmentStatus,
  Doctor,
  TreatmentType,
} from "../types";
import { appointmentService } from "@/lib/appointmentService";
import { useAuth } from "@/auth/AuthContext";
import {
  useAppointmentsQuery,
  useUpdateAppointmentMutation,
  useCreateAppointmentMutation,
  useDeleteAppointmentMutation,
} from "@/api/Appointment/appointmentHooks";
import {
  useDoctorsQuery,
  useUpdateDoctorStatusMutation,
  useDeleteDoctorMutation,
} from "@/api/Doctor/doctorHooks";

function Dashboard() {
  const { data: dbAppointments = [], refetch: refetchAppointments } =
    useAppointmentsQuery();
  const { data: dbDoctors = [] } = useDoctorsQuery();

  const updateAppointmentMutation = useUpdateAppointmentMutation();
  const createAppointmentMutation = useCreateAppointmentMutation();
  const updateDoctorStatusMutation = useUpdateDoctorStatusMutation();
  const deleteDoctorMutation = useDeleteDoctorMutation();
  const deleteAppointmentMutation = useDeleteAppointmentMutation();

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    return appointmentService.getAppointments();
  });

  // Sync fresh appointments from query cache
  useEffect(() => {
    if (dbAppointments && dbAppointments.length > 0) {
      setAppointments(dbAppointments);
    }
  }, [dbAppointments]);

  // Sync to appointmentService whenever appointments change (without dispatching refetch event)
  useEffect(() => {
    appointmentService.saveAppointments(appointments, false);
  }, [appointments]);

  // Listen to cross-component appointment updates
  useEffect(() => {
    const handleSync = () => {
      refetchAppointments();
    };
    window.addEventListener("dental_appointments_updated", handleSync);
    return () =>
      window.removeEventListener("dental_appointments_updated", handleSync);
  }, [refetchAppointments]);

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const saved = localStorage.getItem("dental_doctors_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialDoctors;
  });

  // Sync doctors to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("dental_doctors_v1", JSON.stringify(doctors));
    } catch (e) {}
  }, [doctors]);

  // Sync doctors from query cache
  useEffect(() => {
    if (dbDoctors && dbDoctors.length > 0) {
      setDoctors((prev) => {
        const existingIds = new Set(dbDoctors.map((d) => d.id));
        const customDoctors = prev.filter((d) => !existingIds.has(d.id));
        return [...dbDoctors, ...customDoctors];
      });
    }
  }, [dbDoctors]);
  const { user, isSuperAdmin } = useAuth();
  const isSuper = isSuperAdmin || user?.role === "superadmin";
  const currentActor = isSuper ? "Super Admin" : "Clinic Admin";

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Prevent regular admin from getting stuck on restricted tabs
  useEffect(() => {
    if (!isSuper && (activeTab === "settings" || activeTab === "reports")) {
      setActiveTab("overview");
    }
  }, [isSuper, activeTab]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768 && window.innerWidth < 1120;
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Responsive sidebar auto-collapse on tablet / medium viewports
  useEffect(() => {
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // Auto-collapse when crossing under 1120px from wide screens
      if (lastWidth >= 1120 && currentWidth < 1120 && currentWidth >= 768) {
        setSidebarCollapsed(true);
      } else if (lastWidth < 1120 && currentWidth >= 1120) {
        setSidebarCollapsed(false);
      }
      if (currentWidth >= 768) {
        setMobileMenuOpen(false);
      }
      lastWidth = currentWidth;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("all");
  const [selectedDoctorFilter, setSelectedDoctorFilter] =
    useState<string>("all");
  const [appointmentViewMode, setAppointmentViewMode] = useState<
    "table" | "calendar"
  >("table");

  // Modals state
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Keep selected appointment synchronized with latest data
  useEffect(() => {
    if (selectedAppointment) {
      const fresh = appointments.find((a) => a.id === selectedAppointment.id);
      if (fresh && fresh !== selectedAppointment) {
        setSelectedAppointment(fresh);
      }
    }
  }, [appointments]);

  const kpis = useMemo(() => {
    const todayDate = new Date().toISOString().split("T")[0];
    return {
      newRequests: appointments.filter(
        (a) => a.status === "requested" || a.status === "pending",
      ).length,
      pendingApprovals: appointments.filter(
        (a) =>
          a.status === "requested" ||
          a.status === "pending" ||
          a.status === "under_review",
      ).length,
      todayAppointments: appointments.filter(
        (a) =>
          (a.confirmedDate || a.requestedDate) === todayDate &&
          a.status === "approved",
      ).length,
      upcomingAppointments: appointments.filter(
        (a) => a.status === "approved" || a.status === "proposed",
      ).length,
      completedConsultations: appointments.filter(
        (a) => a.status === "completed",
      ).length,
      cancelledAppointments: appointments.filter(
        (a) => a.status === "cancelled",
      ).length,
      reschedulingRequests: appointments.filter(
        (a) => a.status === "reschedule_requested",
      ).length,
      noShowAppointments: appointments.filter((a) => a.status === "no_show")
        .length,
    };
  }, [appointments]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = apt.patient.name.toLowerCase().includes(query);
        const matchesEmail = apt.patient.email.toLowerCase().includes(query);
        const matchesPhone = apt.patient.phone.toLowerCase().includes(query);
        const matchesRef = apt.referenceNo.toLowerCase().includes(query);
        const matchesTreatment = apt.treatment.toLowerCase().includes(query);
        const matchesDoc = apt.assignedDoctor?.name
          .toLowerCase()
          .includes(query);
        if (
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesRef &&
          !matchesTreatment &&
          !matchesDoc
        ) {
          return false;
        }
      }

      // Status filter
      if (selectedStatusFilter !== "all") {
        if (selectedStatusFilter === "pending") {
          if (apt.status !== "pending" && apt.status !== "requested")
            return false;
        } else if (selectedStatusFilter === "requested") {
          if (apt.status !== "requested" && apt.status !== "pending")
            return false;
        } else if (apt.status !== selectedStatusFilter) {
          return false;
        }
      }

      // Doctor filter
      if (
        selectedDoctorFilter !== "all" &&
        apt.assignedDoctorId !== selectedDoctorFilter
      ) {
        return false;
      }

      return true;
    });
  }, [appointments, searchQuery, selectedStatusFilter, selectedDoctorFilter]);

  // Actions
  const [detailModalTab, setDetailModalTab] = useState<
    "details" | "scheduling"
  >("details");

  const handleOpenDetail = (
    apt: Appointment,
    tab: "details" | "scheduling" = "details",
  ) => {
    setSelectedAppointment(apt);
    setDetailModalTab(tab);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: AppointmentStatus,
    note?: string,
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const updated: Appointment = {
            ...apt,
            status: newStatus,
            timeline: [
              {
                id: `tl-${Date.now()}`,
                timestamp: new Date().toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                action: `Status changed to ${newStatus.replace("_", " ")}`,
                actor: currentActor,
                details: note,
              },
              ...apt.timeline,
            ],
          };
          if (selectedAppointment?.id === id) {
            setSelectedAppointment(updated);
          }
          return updated;
        }
        return apt;
      }),
    );

    const targetApt = appointments.find((a) => a.id === id);

    if (!isNaN(Number(id))) {
      try {
        await updateAppointmentMutation.mutateAsync({
          id,
          payload: {
            status: newStatus,
            note: note,
            assignedDoctorId: targetApt?.assignedDoctorId,
            assignedDoctorName: targetApt?.assignedDoctor?.name,
            meetingLink: targetApt?.meetingLink,
            meetingPlatform: targetApt?.meetingPlatform,
            confirmedDate: targetApt?.confirmedDate || targetApt?.requestedDate,
            confirmedTime: targetApt?.confirmedTime || targetApt?.requestedTime,
          },
        });
      } catch (err) {
        console.error("Failed to sync status to DB:", err);
      }
    }
  };

  const handleAssignDoctor = async (id: string, doctorId: string) => {
    let doctorObj = doctors.find((d) => String(d.id) === String(doctorId));
    if (!doctorObj) {
      try {
        const saved = localStorage.getItem("dental_doctors_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          doctorObj = parsed.find(
            (d: any) => String(d.id) === String(doctorId),
          );
        }
      } catch (e) {}
    }

    const targetApt = appointments.find((a) => String(a.id) === String(id));
    const nextStatus =
      targetApt?.status === "requested" || targetApt?.status === "pending"
        ? "under_review"
        : targetApt?.status || "under_review";

    const updatedApt: Appointment = {
      ...(targetApt || ({} as Appointment)),
      id: String(id),
      assignedDoctorId: String(doctorId),
      assignedDoctor: doctorObj,
      status: nextStatus,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          action: `Assigned to ${doctorObj?.name || "Doctor"}`,
          actor: currentActor,
        },
        ...(targetApt?.timeline || []),
      ],
    };

    setSelectedAppointment(updatedApt);
    setAppointments((prev) =>
      prev.map((apt) => (String(apt.id) === String(id) ? updatedApt : apt)),
    );

    appointmentService.updateAppointment(String(id), {
      assignedDoctorId: String(doctorId),
      assignedDoctor: doctorObj,
      status: nextStatus,
    });

    if (!isNaN(Number(id))) {
      try {
        await updateAppointmentMutation.mutateAsync({
          id,
          payload: {
            status: nextStatus,
            assignedDoctorId: String(doctorId),
            assignedDoctorName: doctorObj?.name,
          },
        });
      } catch (err) {
        console.error("Failed to sync doctor assignment to DB:", err);
      }
    }
  };

  const handleUpdateSchedule = async (
    id: string,
    date: string,
    time: string,
    note?: string,
  ) => {
    const targetApt = appointments.find((a) => a.id === id);

    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const updated: Appointment = {
            ...apt,
            confirmedDate: date,
            confirmedTime: time,
            status: "proposed",
            timeline: [
              {
                id: `tl-${Date.now()}`,
                timestamp: new Date().toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                action: `Proposed New Slot: ${date} at ${time}`,
                actor: currentActor,
                details: note,
              },
              ...apt.timeline,
            ],
          };
          if (selectedAppointment?.id === id) {
            setSelectedAppointment(updated);
          }
          return updated;
        }
        return apt;
      }),
    );

    if (!isNaN(Number(id))) {
      try {
        await updateAppointmentMutation.mutateAsync({
          id,
          payload: {
            preferredDate: date,
            preferredTime: time,
            confirmedDate: date,
            confirmedTime: time,
            status: "proposed",
            note: note,
            assignedDoctorId: targetApt?.assignedDoctorId,
            assignedDoctorName: targetApt?.assignedDoctor?.name,
            meetingLink: targetApt?.meetingLink,
            meetingPlatform: targetApt?.meetingPlatform,
          },
        });
      } catch (err) {
        console.error("Failed to sync schedule to DB:", err);
      }
    }
  };

  const handleUpdateMeetingLink = async (
    id: string,
    platform: "google_meet" | "zoom" | "teams",
    link: string,
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const updated: Appointment = {
            ...apt,
            meetingPlatform: platform,
            meetingLink: link,
            timeline: [
              {
                id: `tl-${Date.now()}`,
                timestamp: new Date().toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                action: `Video Meeting Link Generated (${platform.replace("_", " ")})`,
                actor: currentActor,
                details: link,
              },
              ...apt.timeline,
            ],
          };
          if (selectedAppointment?.id === id) {
            setSelectedAppointment(updated);
          }
          return updated;
        }
        return apt;
      }),
    );

    if (!isNaN(Number(id))) {
      try {
        await updateAppointmentMutation.mutateAsync({
          id,
          payload: {
            meetingPlatform: platform,
            meetingLink: link,
          },
        });
      } catch (err) {
        console.error("Failed to sync meeting link to DB:", err);
      }
    }
  };

  const handleSaveClinicalNotes = async (
    id: string,
    notes: Appointment["consultationNotes"],
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const updated: Appointment = {
            ...apt,
            consultationNotes: notes,
            timeline: [
              {
                id: `tl-${Date.now()}`,
                timestamp: new Date().toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                action: "Clinical Consultation Notes Saved",
                actor: currentActor,
              },
              ...apt.timeline,
            ],
          };
          if (selectedAppointment?.id === id) {
            setSelectedAppointment(updated);
          }
          return updated;
        }
        return apt;
      }),
    );

    if (notes) {
      appointmentService.saveConsultationNotes(id, notes, currentActor);
    }

    if (!isNaN(Number(id))) {
      try {
        await updateAppointmentMutation.mutateAsync({
          id,
          payload: {
            consultationNotes: notes,
          },
        });
      } catch (err) {
        console.error("Failed to sync clinical notes to DB:", err);
      }
    }
  };

  const handleCreateNewAppointment = async (
    data: Appointment | Partial<Appointment>,
  ) => {
    // If already created and mapped from DB by modal
    if ("id" in data && data.id && "referenceNo" in data && data.referenceNo) {
      const fullApt = data as Appointment;
      setAppointments((prev) => [
        fullApt,
        ...prev.filter((a) => a.id !== fullApt.id),
      ]);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("patientName", data.patient?.name || "Patient");
      formData.append(
        "patientEmail",
        data.patient?.email || "patient@example.com",
      );
      formData.append("phoneNumber", data.patient?.phone || "");
      formData.append(
        "contactMethod",
        (data.patient?.preferredContact || "email").toLowerCase(),
      );
      formData.append(
        "tratmentType",
        data.treatment || "General Dental Consultation",
      );
      formData.append(
        "preferredDate",
        data.requestedDate || new Date().toISOString().split("T")[0],
      );
      formData.append("preferredTime", data.requestedTime || "10:00 AM");
      formData.append("status", data.status || "pending");
      if (data.patientMessage) {
        formData.append("additionalDescription", data.patientMessage);
      }
      formData.append("sendAcknowledgmentEmail", "false");

      const json = await createAppointmentMutation.mutateAsync(formData);

      if (json.success && json.data) {
        const mapped = appointmentService.mapDbRecord(json.data);
        if (data.assignedDoctorId) {
          mapped.assignedDoctorId = data.assignedDoctorId;
          mapped.assignedDoctor = doctors.find(
            (d) => d.id === data.assignedDoctorId,
          );
        }
        setAppointments((prev) => [mapped, ...prev]);
        return;
      }
    } catch (e) {
      console.error("Failed to save new appointment to DB:", e);
    }

    const referenceNo = `CD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      referenceNo,
      patient: data.patient!,
      treatment: data.treatment as TreatmentType,
      consultationType: data.consultationType || "video",
      status: data.status || "pending",
      requestedDate: data.requestedDate || "2026-09-18",
      requestedTime: data.requestedTime || "10:00 AM",
      assignedDoctorId: data.assignedDoctorId,
      assignedDoctor: doctors.find((d) => d.id === data.assignedDoctorId),
      patientMessage: data.patientMessage,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          action: "Direct Appointment Created",
          actor: `${currentActor} (Direct Booking)`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setAppointments([newApt, ...appointments]);
  };

  const handleToggleDoctorStatus = (doctorId: string) => {
    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id === doctorId) {
          const nextStatus =
            d.status === "available"
              ? "busy"
              : d.status === "busy"
                ? "on_leave"
                : "available";
          if (!isNaN(Number(doctorId))) {
            updateDoctorStatusMutation
              .mutateAsync({ id: doctorId, status: nextStatus })
              .catch((err) =>
                console.error("Failed to sync status to backend:", err),
              );
          }
          return { ...d, status: nextStatus };
        }
        return d;
      }),
    );
  };

  const handleAddDoctor = (newDoctor: Doctor) => {
    setDoctors((prev) => [newDoctor, ...prev]);
  };

  const handleUpdateDoctor = (updatedDoctor: Doctor) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === updatedDoctor.id ? updatedDoctor : d)),
    );
  };

  const handleDeleteDoctor = (doctorId: string) => {
    setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    if (!isNaN(Number(doctorId))) {
      deleteDoctorMutation
        .mutateAsync(doctorId)
        .catch((err) =>
          console.error("Failed to delete doctor from backend:", err),
        );
    }
  };

  const handleConfirmDeleteAppointment = async (
    appointmentId: string | number,
  ) => {
    try {
      // 1. Optimistic local update
      setAppointments((prev) =>
        prev.filter((a) => String(a.id) !== String(appointmentId)),
      );
      appointmentService.deleteAppointment(String(appointmentId));

      // 2. Persist to backend database
      if (!isNaN(Number(appointmentId))) {
        await deleteAppointmentMutation.mutateAsync(appointmentId);
      }
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete appointment:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F6] text-ink font-sans antialiased">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        pendingRequestsCount={kpis.pendingApprovals}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewAppointmentClick={() => setIsNewModalOpen(true)}
          pendingAppointments={appointments.filter(
            (a) =>
              a.status === "requested" ||
              a.status === "pending" ||
              a.status === "under_review",
          )}
          onSelectAppointment={handleOpenDetail}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5 sm:space-y-6">
              {/* Welcome banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-line shadow-xs">
                <div>
                  <h2 className="font-display font-semibold text-xl sm:text-2xl text-ink">
                    Admin Portal & Clinical Control
                  </h2>
                  <p className="text-xs text-ink-soft mt-1">
                    Manage online tele-consultations, doctor schedules,
                    approvals, and clinical records.
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("appointments")}
                    className="text-xs font-semibold border-line hover:bg-line-soft h-9 flex-1 sm:flex-none"
                  >
                    View All Appointments ({appointments.length})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsNewModalOpen(true)}
                    className="text-xs font-semibold bg-[#5E3E3B] text-white hover:bg-[#262525] h-9 shadow-xs flex-1 sm:flex-none cursor-pointer"
                  >
                    + Add New Appointment
                  </Button>
                </div>
              </div>

              {/* KPI Stat Cards (PDF Section 6: Dashboard Metrics) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 shadow-xs flex flex-col justify-between">
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-amber-900 leading-tight">
                    New Requests
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-amber-900 mt-1.5 sm:mt-2">
                    {kpis.newRequests}
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-amber-700">
                    Needs review
                  </span>
                </div>

                <div className="p-2.5 sm:p-3.5 rounded-xl border border-purple-200 bg-purple-50/70 shadow-xs flex flex-col justify-between">
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-purple-900 leading-tight">
                    Pending Approvals
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-purple-900 mt-1.5 sm:mt-2">
                    {kpis.pendingApprovals}
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-purple-700">
                    Action required
                  </span>
                </div>

                <div className="p-2.5 sm:p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 shadow-xs flex flex-col justify-between">
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-emerald-900 leading-tight">
                    Today's Consults
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-emerald-900 mt-1.5 sm:mt-2">
                    {kpis.todayAppointments}
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-emerald-700">
                    Live schedule
                  </span>
                </div>

                <div className="p-2.5 sm:p-3.5 rounded-xl border border-teal-200 bg-teal-50/70 shadow-xs flex flex-col justify-between">
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-teal-900 leading-tight">
                    Upcoming
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-teal-900 mt-1.5 sm:mt-2">
                    {kpis.upcomingAppointments}
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-teal-700">
                    Confirmed
                  </span>
                </div>

                <div className="p-2.5 sm:p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 shadow-xs flex flex-col justify-between">
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-blue-900 leading-tight">
                    Completed
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-blue-900 mt-1.5 sm:mt-2">
                    {kpis.completedConsultations}
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-blue-700">
                    Finished
                  </span>
                </div>

                <div className="p-2.5 sm:p-3.5 rounded-xl border border-orange-200 bg-orange-50/70 shadow-xs flex flex-col justify-between">
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-orange-900 leading-tight">
                    Reschedules
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-orange-900 mt-1.5 sm:mt-2">
                    {kpis.reschedulingRequests}
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-orange-700">
                    Requested
                  </span>
                </div>

                <div className="p-2.5 sm:p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 shadow-xs flex flex-col justify-between">
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-rose-900 leading-tight">
                    Cancelled
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-rose-900 mt-1.5 sm:mt-2">
                    {kpis.cancelledAppointments}
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-rose-700">
                    Patient/Clinic
                  </span>
                </div>

                <div className="p-2.5 sm:p-3.5 rounded-xl border border-zinc-300 bg-zinc-100 shadow-xs flex flex-col justify-between">
                  <span className="text-[10.5px] sm:text-[11px] font-semibold text-zinc-800 leading-tight">
                    No-Show
                  </span>
                  <div className="text-lg sm:text-xl font-bold text-zinc-900 mt-1.5 sm:mt-2">
                    {kpis.noShowAppointments}
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-zinc-600">
                    Missed
                  </span>
                </div>
              </div>

              {/* Two Column Grid: Pending Review Queue + Today's Agenda */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Urgent Queue */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <h3 className="font-semibold text-base text-ink">
                        Pending Request Approvals & Reviews (
                        {kpis.pendingApprovals})
                      </h3>
                    </div>
                    <span className="text-xs text-ink-soft">
                      Requires Admin Scheduling
                    </span>
                  </div>

                  <div className="space-y-3">
                    {appointments
                      .filter(
                        (a) =>
                          a.status === "requested" ||
                          a.status === "pending" ||
                          a.status === "under_review",
                      )
                      .map((apt) => (
                        <div
                          key={apt.id}
                          className="p-4 rounded-xl border border-line bg-white shadow-xs hover:border-mint-deep/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-ink-soft">
                                {apt.referenceNo}
                              </span>
                              <Badge
                                variant={apt.status}
                                className="capitalize text-[10px]"
                              >
                                {apt.status.replace("_", " ")}
                              </Badge>
                              <span className="text-xs text-teal-deep font-semibold">
                                {apt.treatment}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-sm text-ink truncate">
                                {apt.patient.name}
                              </h4>
                              <span className="text-xs text-ink-soft">
                                Preferred: {apt.requestedDate} at{" "}
                                {apt.requestedTime}
                              </span>
                            </div>

                            {apt.patientMessage && (
                              <p className="text-xs text-ink-soft line-clamp-1 italic">
                                "{apt.patientMessage}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDetail(apt)}
                              className="text-xs h-8"
                            >
                              Review & Assign
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(
                                  apt.id,
                                  "approved",
                                  "One-click approved.",
                                )
                              }
                              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}

                    {kpis.pendingApprovals === 0 && (
                      <div className="p-8 text-center bg-white rounded-xl border border-line text-ink-soft text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        No pending requests in queue!
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Today's Consultation Schedule */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-teal-deep" />
                      <h3 className="font-semibold text-base text-ink">
                        Today's Consultations
                      </h3>
                    </div>
                    <Badge variant="approved" className="text-[10px]">
                      {kpis.todayAppointments} Live
                    </Badge>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-line shadow-xs space-y-3">
                    {appointments.filter(
                      (a) =>
                        a.status === "approved" || a.status === "completed",
                    ).length === 0 ? (
                      <div className="py-8 text-center text-xs text-ink-soft">
                        <CalendarCheck className="w-8 h-8 text-ink-soft/40 mx-auto mb-2" />
                        No consultations scheduled for today.
                      </div>
                    ) : (
                      appointments
                        .filter(
                          (a) =>
                            a.status === "approved" || a.status === "completed",
                        )
                        .slice(0, 4)
                        .map((apt) => (
                          <div
                            key={apt.id}
                            onClick={() => handleOpenDetail(apt)}
                            className="p-3 rounded-lg border border-line/70 bg-[#FAF7F6] hover:border-mint-deep cursor-pointer transition-all space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-teal-deep">
                                {apt.confirmedTime || apt.requestedTime}
                              </span>
                              <Badge
                                variant={apt.status}
                                className="text-[9px]"
                              >
                                {apt.status}
                              </Badge>
                            </div>
                            <div className="text-xs font-semibold text-ink">
                              {apt.patient.name}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-ink-soft">
                              <span className="truncate">{apt.treatment}</span>
                              {apt.consultationType === "video" && (
                                <span className="flex items-center gap-1 text-teal-deep font-semibold">
                                  <Video className="w-3 h-3" /> Meet
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPOINTMENTS MANAGEMENT (PDF Section 3, 4, 6) */}
          {activeTab === "appointments" && (
            <div className="space-y-5">
              {/* Header with Search, Filter & View Toggle */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 sm:p-5 rounded-2xl border border-line shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 min-w-0 flex-1">
                  {/* Status filter buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                    {[
                      { id: "all", label: "All" },
                      { id: "pending", label: "Pending" },
                      { id: "requested", label: "Requested" },
                      { id: "under_review", label: "Under Review" },
                      { id: "proposed", label: "Proposed" },
                      { id: "approved", label: "Approved" },
                      { id: "completed", label: "Completed" },
                      { id: "reschedule_requested", label: "Reschedules" },
                      { id: "rejected", label: "Rejected" },
                      { id: "cancelled", label: "Cancelled" },
                      { id: "no_show", label: "No Show" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setSelectedStatusFilter(st.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                          selectedStatusFilter === st.id
                            ? "bg-[#5E3E3B] text-white shadow-xs"
                            : "bg-[#FAF7F6] text-ink-soft hover:text-ink hover:bg-line"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* Doctor filter dropdown */}
                  <Select
                    value={selectedDoctorFilter}
                    onValueChange={(value) => setSelectedDoctorFilter(value)}
                  >
                    <SelectTrigger
                      className="
      h-9
      w-full sm:w-[190px]
      px-3
      rounded-lg
      border border-line
      bg-white
      text-xs font-semibold text-ink-soft
      hover:text-ink
      cursor-pointer
      outline-none
      focus:ring-2 focus:ring-primary/20
      flex items-center justify-between
    "
                    >
                      <SelectValue placeholder="All Doctors" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All Doctors</SelectItem>

                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name.split(",")[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  {/* View Mode Toggle: Table vs Calendar */}
                  <div className="flex items-center gap-1 bg-line-soft p-1 rounded-xl">
                    <button
                      onClick={() => setAppointmentViewMode("table")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        appointmentViewMode === "table"
                          ? "bg-white text-teal-deep shadow-xs font-bold"
                          : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      List Table
                    </button>
                    <button
                      onClick={() => setAppointmentViewMode("calendar")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        appointmentViewMode === "calendar"
                          ? "bg-white text-teal-deep shadow-xs font-bold"
                          : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      Calendar
                    </button>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setIsNewModalOpen(true)}
                    className="h-8.5 px-3 text-xs font-semibold bg-[#5E3E3B] text-white hover:bg-[#262525] shadow-xs cursor-pointer"
                  >
                    + Add
                  </Button>
                </div>
              </div>

              {/* View 1: Tabular Appointments List */}
              {appointmentViewMode === "table" && (
                <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-line flex items-center justify-between bg-[#FCFDFD]">
                    <div className="text-xs font-semibold text-ink">
                      Showing {filteredAppointments.length} appointment records
                    </div>
                    {selectedStatusFilter !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStatusFilter("all")}
                        className="text-xs h-7 text-mint-deep"
                      >
                        Reset filters
                      </Button>
                    )}
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference / Patient</TableHead>
                        <TableHead>Treatment Required</TableHead>
                        <TableHead>Schedule Slot</TableHead>
                        <TableHead>Assigned Doctor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Consultation Link</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((apt) => (
                        <TableRow
                          key={apt.id}
                          className="cursor-pointer hover:bg-[#FAF7F6]"
                          onClick={() => handleOpenDetail(apt)}
                        >
                          {/* Patient / Ref */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9 border border-line">
                                <AvatarFallback className="text-xs font-bold bg-teal-50 text-teal-deep">
                                  {apt.patient.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-xs text-ink">
                                  {apt.patient.name}
                                </div>
                                <div className="font-mono text-[10px] text-ink-soft">
                                  {apt.referenceNo}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Treatment */}
                          <TableCell>
                            <div className="text-xs font-medium text-ink">
                              {apt.treatment}
                            </div>
                          </TableCell>

                          {/* Schedule */}
                          <TableCell>
                            <div className="text-xs font-semibold text-ink">
                              {apt.confirmedDate || apt.requestedDate}
                            </div>
                            <div className="text-[11px] text-mint-deep font-medium">
                              {apt.confirmedTime || apt.requestedTime}
                            </div>
                          </TableCell>

                          {/* Doctor */}
                          <TableCell>
                            {apt.assignedDoctor ? (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetail(apt, "scheduling");
                                }}
                                title="Click to view or reassign doctor"
                                className="flex items-center gap-2 group cursor-pointer hover:opacity-85 transition-opacity"
                              >
                                <Avatar className="w-7 h-7 border border-line shrink-0">
                                  {apt.assignedDoctor.avatar && (
                                    <AvatarImage
                                      src={apt.assignedDoctor.avatar}
                                      alt={apt.assignedDoctor.name}
                                      className="object-cover"
                                    />
                                  )}
                                  <AvatarFallback className="text-[10px] font-bold bg-teal-50 text-teal-deep">
                                    {apt.assignedDoctor.name
                                      .replace(/^Dr\.\s*/i, "")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-semibold text-ink group-hover:text-teal-deep group-hover:underline">
                                  {apt.assignedDoctor.name.split(",")[0]}
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetail(apt, "scheduling");
                                }}
                                className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-semibold bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                                Assign Doctor
                              </button>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Badge
                              variant={apt.status}
                              className="capitalize text-[10px]"
                            >
                              {apt.status.replace("_", " ")}
                            </Badge>
                          </TableCell>

                          {/* Meeting link */}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {apt.meetingLink ? (
                              <a
                                href={apt.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-teal-deep bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors"
                              >
                                <Video className="w-3 h-3 text-teal-deep" />
                                Join Call
                              </a>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDetail(apt)}
                                className="text-[11px] h-7 text-ink-soft hover:text-teal-deep p-1"
                              >
                                + Add Link
                              </Button>
                            )}
                          </TableCell>

                          {/* Actions Menu */}
                          <TableCell
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-ink-soft"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleOpenDetail(apt)}
                                >
                                  <Eye className="w-3.5 h-3.5 mr-2" /> Inspect
                                  Details
                                </DropdownMenuItem>
                                {apt.status !== "approved" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(
                                        apt.id,
                                        "approved",
                                        "Approved by admin.",
                                      )
                                    }
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                                    Approve Slot
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleOpenDetail(apt)}
                                >
                                  <RotateCcw className="w-3.5 h-3.5 mr-2 text-blue-600" />{" "}
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {apt.status !== "rejected" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(
                                        apt.id,
                                        "rejected",
                                        "Appointment request rejected by admin.",
                                      )
                                    }
                                    className="text-rose-600"
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-2" />{" "}
                                    Reject Request
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(
                                      apt.id,
                                      "cancelled",
                                      "Cancelled by admin.",
                                    )
                                  }
                                  className="text-red-600"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-2" />{" "}
                                  Cancel Booking
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAppointmentToDelete(apt);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-500" />{" "}
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}

                      {filteredAppointments.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-10 text-xs text-ink-soft"
                          >
                            No appointments found matching your search and
                            filter criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* View 2: Calendar Schedule View */}
              {appointmentViewMode === "calendar" && (
                <AppointmentCalendarView
                  appointments={filteredAppointments}
                  onSelectAppointment={handleOpenDetail}
                />
              )}
            </div>
          )}

          {/* TAB 3: DOCTOR MANAGEMENT (PDF Section 10) */}
          {activeTab === "doctors" && (
            <DoctorManagementView
              doctors={doctors}
              onToggleStatus={handleToggleDoctorStatus}
              onAddDoctor={isSuper ? handleAddDoctor : undefined}
              onUpdateDoctor={isSuper ? handleUpdateDoctor : undefined}
              onDeleteDoctor={isSuper ? handleDeleteDoctor : undefined}
            />
          )}

          {/* TAB 4: REPORTS & ANALYTICS (PDF Section 11) */}
          {activeTab === "reports" && (
            <ReportsView appointments={appointments} doctors={doctors} />
          )}

          {/* TAB 5: CLINIC SETTINGS (PDF Section 14) */}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        doctors={doctors}
        initialTab={detailModalTab}
        onUpdateStatus={handleUpdateStatus}
        onAssignDoctor={handleAssignDoctor}
        onUpdateSchedule={handleUpdateSchedule}
        onUpdateMeetingLink={handleUpdateMeetingLink}
        onSaveClinicalNotes={handleSaveClinicalNotes}
      />

      {/* New Appointment Modal */}
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        doctors={doctors}
        onCreateAppointment={handleCreateNewAppointment}
      />

      {/* Delete Appointment Confirmation Modal */}
      <DeleteAppointmentModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAppointmentToDelete(null);
        }}
        onConfirm={handleConfirmDeleteAppointment}
        appointment={appointmentToDelete}
      />
    </div>
  );
}

export default Dashboard;
