import React, { useState, useEffect } from "react";

import {
  Mail,
  Phone,
  CheckCircle2,
  RotateCcw,
  Check,
  FileSpreadsheet,
  Bell,
  Video,
  ExternalLink,
  Copy,
  Sparkles,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type {
  Appointment,
  AppointmentStatus,
  Doctor,
  MeetingPlatform,
} from "../types";
import { useDoctorsQuery } from "@/api/Doctor/doctorHooks";
import { useSendReminderMutation } from "@/api/Appointment/appointmentHooks";

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  initialTab?: "details" | "scheduling";

  onUpdateStatus: (
    id: string,
    newStatus: AppointmentStatus,
    note?: string,
  ) => void;

  onAssignDoctor: (id: string, doctorId: string) => void;

  onUpdateSchedule: (
    id: string,
    date: string,
    time: string,
    note?: string,
  ) => void;

  onUpdateMeetingLink: (
    id: string,
    platform: "google_meet" | "zoom" | "teams",
    link: string,
  ) => void;

  onConfirmAppointment?: (
    id: string,
    data: {
      doctorId?: string;
      meetingPlatform?: MeetingPlatform;
      meetingLink?: string;
      date: string;
      time: string;
      note?: string;
    },
  ) => void;

  onSaveClinicalNotes: (
    id: string,
    notes: Appointment["consultationNotes"],
  ) => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  isOpen,
  onClose,
  doctors,
  initialTab = "details",
  onUpdateStatus,
  onAssignDoctor,
  onUpdateSchedule,
  onUpdateMeetingLink,
  onConfirmAppointment,
  onSaveClinicalNotes,
}) => {
  if (!appointment) return null;

  // --------------------------------------------------
  // Local state
  // --------------------------------------------------

  const [activeTab, setActiveTab] = useState<"details" | "scheduling">(
    initialTab || "details",
  );

  const [localDoctors, setLocalDoctors] = useState<Doctor[]>(doctors || []);
  const [assignedFeedback, setAssignedFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || "details");
    }
  }, [isOpen, initialTab]);

  const { data: dbDoctors } = useDoctorsQuery();
  const sendReminderMutation = useSendReminderMutation();

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      setLocalDoctors(doctors);
    } else if (dbDoctors && dbDoctors.length > 0) {
      setLocalDoctors(dbDoctors);
    } else {
      try {
        const saved = localStorage.getItem("dental_doctors_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLocalDoctors(parsed);
          }
        }
      } catch (e) {}
    }
  }, [doctors, dbDoctors]);

  const availableDoctors =
    localDoctors.length > 0
      ? localDoctors
      : dbDoctors && dbDoctors.length > 0
        ? dbDoctors
        : doctors;

  const [selectedDoctorId, setSelectedDoctorId] = useState(
    appointment.assignedDoctorId ? String(appointment.assignedDoctorId) : "",
  );

  const [rescheduleDate, setRescheduleDate] = useState(
    appointment.confirmedDate || appointment.requestedDate,
  );

  const [rescheduleTime, setRescheduleTime] = useState(
    appointment.confirmedTime || appointment.requestedTime,
  );

  const [actionNote, setActionNote] = useState("");

  // Selected video platform
  const [activeMeetingPlatform, setActiveMeetingPlatform] = useState<
    "google_meet" | "zoom" | "teams"
  >(appointment.meetingPlatform || "google_meet");

  // Manually entered video link
  const [manualMeetingLink, setManualMeetingLink] = useState(
    appointment.meetingLink && !appointment.meetingLink.includes("/cdr-")
      ? appointment.meetingLink
      : "",
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [reminderFeedback, setReminderFeedback] = useState<string | null>(null);

  const handleSendReminder = async (type: "24_hour" | "1_hour") => {
    setSendingReminder(type);
    try {
      const data = await sendReminderMutation.mutateAsync({
        id: appointment.id,
        payload: {
          reminderType: type,
          assignedDoctorName: appointment.assignedDoctor?.name,
          meetingLink: appointment.meetingLink,
        },
      });
      if (data?.success) {
        setReminderFeedback(
          type === "24_hour"
            ? "24-hour reminder email sent!"
            : "1-hour urgent reminder email sent!",
        );
      } else {
        setReminderFeedback(data?.message || "Failed to send reminder");
      }
    } catch {
      setReminderFeedback("Network error sending reminder");
    } finally {
      setSendingReminder(null);
      setTimeout(() => setReminderFeedback(null), 3000);
    }
  };

  // --------------------------------------------------
  // Clinical notes
  // --------------------------------------------------

  const [clinicalNotes, setClinicalNotes] = useState({
    chiefComplaint:
      appointment.consultationNotes?.chiefComplaint ||
      appointment.patientMessage ||
      "",

    findings: appointment.consultationNotes?.findings || "",

    diagnosis: appointment.consultationNotes?.diagnosis || "",

    recommendedTreatment:
      appointment.consultationNotes?.recommendedTreatment || "",

    additionalInstructions:
      appointment.consultationNotes?.additionalInstructions || "",

    followUpRequirements:
      appointment.consultationNotes?.followUpRequirements || "",

    internalNotes: appointment.consultationNotes?.internalNotes || "",
  });

  // Keep modal fields in sync whenever the selected appointment updates
  useEffect(() => {
    setSelectedDoctorId(
      appointment.assignedDoctorId ? String(appointment.assignedDoctorId) : "",
    );
    setRescheduleDate(appointment.confirmedDate || appointment.requestedDate);
    setRescheduleTime(appointment.confirmedTime || appointment.requestedTime);
    setActiveMeetingPlatform(appointment.meetingPlatform || "google_meet");
    setManualMeetingLink(
      appointment.meetingLink && !appointment.meetingLink.includes("/cdr-")
        ? appointment.meetingLink
        : "",
    );
    setClinicalNotes({
      chiefComplaint:
        appointment.consultationNotes?.chiefComplaint ||
        appointment.patientMessage ||
        "",
      findings: appointment.consultationNotes?.findings || "",
      diagnosis: appointment.consultationNotes?.diagnosis || "",
      recommendedTreatment:
        appointment.consultationNotes?.recommendedTreatment || "",
      additionalInstructions:
        appointment.consultationNotes?.additionalInstructions || "",
      followUpRequirements:
        appointment.consultationNotes?.followUpRequirements || "",
      internalNotes: appointment.consultationNotes?.internalNotes || "",
    });
  }, [appointment]);

  // --------------------------------------------------
  // Copy meeting link
  // --------------------------------------------------
  // Save manually entered meeting link
  // --------------------------------------------------

  const handleCopyLink = (textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveMeetingLink = (targetLink?: string) => {
    const link = (
      targetLink !== undefined ? targetLink : manualMeetingLink
    ).trim();

    onUpdateMeetingLink(appointment.id, activeMeetingPlatform, link);

    setAssignedFeedback(
      link
        ? `Meeting link (${getPlatformLabel(activeMeetingPlatform)}) saved & assigned successfully!`
        : "Meeting link cleared.",
    );
    setTimeout(() => setAssignedFeedback(null), 3500);
  };

  const handleGenerateGoogleMeet = () => {
    setActiveMeetingPlatform("google_meet");
    const safeRef = (appointment.referenceNo || `apt-${appointment.id}`)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const randPart = Math.random().toString(36).substring(2, 6);
    const generated = `https://meet.google.com/${safeRef.slice(0, 3) || "doc"}-${safeRef.slice(3, 7) || "room"}-${randPart}`;
    setManualMeetingLink(generated);
    handleSaveMeetingLink(generated);
  };

  const handleClearMeetingLink = () => {
    setManualMeetingLink("");
    handleSaveMeetingLink("");
  };

  // --------------------------------------------------
  // Confirm appointment (Doctor, Meeting Link, and Schedule Time)
  // --------------------------------------------------

  const handleConfirmAll = () => {
    const docId =
      selectedDoctorId ||
      (appointment.assignedDoctorId
        ? String(appointment.assignedDoctorId)
        : "");
    const date =
      rescheduleDate || appointment.confirmedDate || appointment.requestedDate;
    const time =
      rescheduleTime || appointment.confirmedTime || appointment.requestedTime;
    const platform =
      activeMeetingPlatform || appointment.meetingPlatform || "google_meet";
    const link = manualMeetingLink.trim();

    // Execute save link function whenever a link is provided
    if (link) {
      handleSaveMeetingLink(link);
    }

    if (onConfirmAppointment) {
      onConfirmAppointment(appointment.id, {
        doctorId: docId || undefined,
        meetingPlatform: platform,
        meetingLink: link || undefined,
        date,
        time,
        note: actionNote || undefined,
      });
    } else {
      if (docId) onAssignDoctor(appointment.id, docId);
      if (link) onUpdateMeetingLink(appointment.id, platform, link);
      onUpdateSchedule(appointment.id, date, time, actionNote);
      onUpdateStatus(
        appointment.id,
        "approved",
        actionNote ||
          "Appointment confirmed with doctor, meeting link, and schedule.",
      );
    }

    onClose();

    const assignedDoc = availableDoctors.find(
      (d) => String(d.id) === String(docId),
    );
    const docLabel = assignedDoc?.name
      ? `with Dr. ${assignedDoc.name.replace(/^Dr\.\s*/i, "")}`
      : "";
    const linkNote = link ? ` & video link saved` : "";
    setAssignedFeedback(
      `Appointment confirmed ${docLabel} for ${date} at ${time}${linkNote}!`.trim(),
    );
    setTimeout(() => setAssignedFeedback(null), 4000);
  };

  // --------------------------------------------------
  // Reschedule appointment
  // --------------------------------------------------

  const handleProposeSchedule = () => {
    onUpdateSchedule(
      appointment.id,
      rescheduleDate,
      rescheduleTime,
      actionNote ||
        `Suggested alternative time slot: ${rescheduleDate} at ${rescheduleTime}`,
    );
    setActionNote("");
  };

  // --------------------------------------------------
  // Select doctor
  // --------------------------------------------------

  const handleSelectDoctor = (docId: string) => {
    const idStr = String(docId);
    setSelectedDoctorId(idStr);
    const targetDoc = availableDoctors.find((d) => String(d.id) === idStr);
    setAssignedFeedback(
      targetDoc?.name
        ? `Selected Dr. ${targetDoc.name.replace(/^Dr\.\s*/i, "")}`
        : "Doctor selected",
    );
    setTimeout(() => setAssignedFeedback(null), 2500);
  };

  // --------------------------------------------------
  // Save clinical notes
  // --------------------------------------------------

  const handleSaveNotes = () => {
    onSaveClinicalNotes(appointment.id, clinicalNotes);
  };

  // --------------------------------------------------
  // Platform label
  // --------------------------------------------------

  const getPlatformLabel = (platform: "google_meet" | "zoom" | "teams") => {
    switch (platform) {
      case "google_meet":
        return "Google Meet";

      case "zoom":
        return "Zoom";

      case "teams":
        return "Microsoft Teams";

      default:
        return platform;
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          max-w-3xl
          w-[95vw]
          sm:w-full
          max-h-[92vh]
          sm:max-h-[90vh]
          p-0
          overflow-hidden
          flex
          flex-col
          bg-[#FCFDFD]
        "
      >
        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="bg-linear-to-r from-teal-deep to-teal-mid text-white p-4 sm:p-6 pb-4 sm:pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-2">
              <span
                className="
                  font-mono
                  text-[11px]
                  sm:text-xs
                  font-semibold
                  px-2
                  py-0.5
                  sm:px-2.5
                  sm:py-1
                  rounded-md
                  bg-white/15
                  text-emerald-200
                  border
                  border-white/20
                "
              >
                {appointment.referenceNo}
              </span>

              <Badge
                variant={appointment.status}
                className="
                  capitalize
                  text-[10px]
                  sm:text-xs
                  font-bold
                  px-2.5
                  py-0.5
                  sm:px-3
                  sm:py-1
                  shadow-xs
                "
              >
                {appointment.status.replace("_", " ")}
              </Badge>

              {appointment.assignedDoctor && (
                <button
                  type="button"
                  onClick={() => setActiveTab("scheduling")}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-[11px] sm:text-xs font-medium cursor-pointer transition-colors border border-white/25"
                  title="Click to view or change assigned doctor"
                >
                  <Avatar className="w-4 h-4 border border-white/40 shrink-0">
                    {appointment.assignedDoctor.avatar && (
                      <AvatarImage
                        src={appointment.assignedDoctor.avatar}
                        alt={appointment.assignedDoctor.name}
                      />
                    )}
                    <AvatarFallback className="text-[8px] bg-teal-800 text-white">
                      Dr
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {appointment.assignedDoctor.name}
                  </span>
                </button>
              )}
            </div>

            <div className="text-[11px] sm:text-xs text-white/80 flex items-center gap-1.5">
              <span>Requested:</span>

              <span className="font-semibold text-white">
                {appointment.requestedDate} at {appointment.requestedTime}
              </span>
            </div>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {appointment.patient.name}
          </DialogTitle>
        </div>

        {/* ==========================================
            FEEDBACK BANNER
        ========================================== */}
        {assignedFeedback && (
          <div className="mx-3.5 sm:mx-6 mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {assignedFeedback}
            </span>
            <button
              type="button"
              onClick={() => setAssignedFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* ==========================================
            BODY
        ========================================== */}

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "details" | "scheduling")}
          className="
            flex-1
            overflow-y-auto
            px-3.5
            sm:px-6
            py-4
          "
        >
          {/* ========================================
              TAB LIST
          ======================================== */}

          <TabsList
            className="
              grid
              grid-cols-2
              sm:grid-cols-2
              h-auto
              w-full
              bg-line-soft
              p-1
              gap-1
            "
          >
            <TabsTrigger value="details" className="py-2 text-xs">
              Case Details
            </TabsTrigger>

            <TabsTrigger value="scheduling" className="py-2 text-xs">
              Schedule & Doctor
            </TabsTrigger>
          </TabsList>

          {/* ========================================
              TAB 1 - CASE DETAILS
          ======================================== */}

          <TabsContent value="details" className="space-y-4 pt-2">
            {/* Patient profile */}

            <div
              className="
                p-4
                rounded-xl
                border
                border-line
                bg-white
                shadow-xs
                grid
                grid-cols-1
                md:grid-cols-3
                gap-3
              "
            >
              {/* Patient */}

              <div className="flex items-center gap-3">
                <Avatar className="w-11 h-11 border border-line">
                  <AvatarFallback className="bg-teal-50 text-teal-deep font-bold text-sm">
                    {appointment.patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="text-xs text-ink-soft">Patient Name</div>

                  <div className="font-semibold text-sm text-ink truncate">
                    {appointment.patient.name}
                  </div>

                  {appointment.patient.age && (
                    <div className="text-[11px] text-ink-soft">
                      {appointment.patient.age} yrs •{" "}
                      {appointment.patient.gender}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}

              <div className="space-y-1">
                <div className="text-xs text-ink-soft flex items-center gap-1">
                  <Mail className="w-3 h-3 text-mint-deep" />
                  Email
                </div>

                <a
                  href={`mailto:${appointment.patient.email}`}
                  className="
                    text-xs
                    font-medium
                    text-teal-deep
                    hover:underline
                    truncate
                    block
                  "
                >
                  {appointment.patient.email}
                </a>

                <div className="text-[11px] text-ink-soft">
                  Prefers: {appointment.patient.preferredContact}
                </div>
              </div>

              {/* Phone */}

              <div className="space-y-1">
                <div className="text-xs text-ink-soft flex items-center gap-1">
                  <Phone className="w-3 h-3 text-mint-deep" />
                  Phone
                </div>

                <a
                  href={`tel:${appointment.patient.phone}`}
                  className="
                    text-xs
                    font-medium
                    text-teal-deep
                    hover:underline
                    truncate
                    block
                  "
                >
                  {appointment.patient.phone}
                </a>

                {appointment.patient.location && (
                  <div className="text-[11px] text-ink-soft">
                    {appointment.patient.location}
                  </div>
                )}
              </div>
            </div>

            <div
              className="
                p-4
                rounded-xl
                border
                border-line
                bg-white
                shadow-xs
                space-y-2
              "
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Treatment
                </span>
              </div>

              <p
                className="
                  text-sm
                  text-ink
                  leading-relaxed
                  bg-[#FAF7F6]
                  p-3
                  rounded-lg
                  border
                  border-line-soft
                "
              >
                {appointment.treatment || "No treatment mentioned."}
              </p>
            </div>

            {/* Patient message */}

            <div
              className="
                p-4
                rounded-xl
                border
                border-line
                bg-white
                shadow-xs
                space-y-2
              "
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Patient Case Description / Symptoms
                </span>
              </div>

              <p
                className="
                  text-sm
                  text-ink
                  leading-relaxed
                  bg-[#FAF7F6]
                  p-3
                  rounded-lg
                  border
                  border-line-soft
                "
              >
                {appointment.patientMessage ||
                  "No specific notes provided by patient upon booking."}
              </p>
            </div>

            {/* Documents */}

            <div
              className="
                p-4
                rounded-xl
                border
                border-line
                bg-white
                shadow-xs
                space-y-3
              "
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Uploaded Supporting Documents & Scans
                </span>

                <span className="text-xs text-ink-soft">
                  {appointment.documents?.length || 0} file(s) attached
                </span>
              </div>

              {appointment.documents && appointment.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {appointment.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="
                        flex
                        items-center
                        justify-between
                        p-3
                        rounded-lg
                        border
                        border-line
                        bg-[#FAF7F6]
                        hover:border-mint-deep/50
                        transition-colors
                      "
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileSpreadsheet className="w-6 h-6 text-teal-deep shrink-0" />

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-ink truncate">
                            {doc.name}
                          </p>

                          <p className="text-[10px] text-ink-soft">
                            {doc.type} • {doc.size}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="
                          h-7
                          text-xs
                          text-mint-deep
                          px-2
                          cursor-pointer
                          hover:bg-teal-50
                        "
                        onClick={() => {
                          if (doc.url) {
                            window.open(doc.url, "_blank");
                          }
                        }}
                      >
                        Preview / View File
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="
                    py-4
                    text-center
                    text-xs
                    text-ink-soft
                    bg-[#FAF7F6]
                    rounded-lg
                    border
                    border-dashed
                    border-line
                  "
                >
                  No scan files or photos attached to this request.
                </div>
              )}
            </div>
          </TabsContent>

          {/* ========================================
              TAB 2 - SCHEDULING
          ======================================== */}

          <TabsContent value="scheduling" className="space-y-4 pt-2">
            {/* Doctor assignment */}

            <div
              className="
                p-4
                rounded-xl
                border
                border-line
                bg-white
                shadow-xs
                space-y-3
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-ink">
                    Assign Doctor
                  </h4>
                </div>

                {appointment.assignedDoctor && (
                  <Badge
                    variant="outline"
                    className="
                      text-xs
                      text-teal-deep
                      border-teal-200
                      bg-teal-50
                    "
                  >
                    Currently Assigned
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {availableDoctors.map((doc) => {
                  const isSelected =
                    String(selectedDoctorId) === String(doc.id);

                  return (
                    <button
                      type="button"
                      key={doc.id}
                      onClick={() => handleSelectDoctor(String(doc.id))}
                      className={`
                        w-full
                        text-left
                        p-3.5
                        rounded-xl
                        border-2
                        transition-all
                        cursor-pointer
                        flex
                        items-center
                        gap-3
                        select-none
                        ${
                          isSelected
                            ? "border-teal-deep bg-teal-50/70 shadow-xs ring-2 ring-teal-deep/30"
                            : "border-line bg-white hover:border-teal-300 hover:bg-[#FAF7F6]"
                        }
                      `}
                    >
                      <Avatar className="w-12 h-12 border-2 border-line shrink-0">
                        {doc.avatar && (
                          <AvatarImage
                            src={doc.avatar}
                            alt={doc.name}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="text-xs font-bold bg-teal-50 text-teal-deep">
                          {doc.name
                            .replace(/^Dr\.\s*/i, "")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="text-xs font-bold text-ink truncate">
                            {doc.name}
                          </div>
                          {isSelected ? (
                            <span className="text-[10px] font-bold text-teal-deep bg-teal-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                              <Check className="w-3 h-3 text-teal-deep" />
                              {String(appointment.assignedDoctorId) ===
                              String(doc.id)
                                ? "Assigned"
                                : "Selected"}
                            </span>
                          ) : (
                            <span className="text-[10px] text-teal-deep bg-teal-50 border border-teal-200 hover:bg-teal-100 font-semibold shrink-0 px-2.5 py-0.5 rounded-full">
                              Select
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-ink-soft truncate mt-0.5 font-medium">
                          {doc.specialization}
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={`
                              w-2
                              h-2
                              rounded-full
                              ${
                                doc.status === "available"
                                  ? "bg-emerald-500"
                                  : doc.status === "busy"
                                    ? "bg-amber-500"
                                    : "bg-zinc-400"
                              }
                            `}
                          />

                          <span className="text-[10px] text-ink-soft capitalize">
                            {doc.status} • {doc.workingHours || "9am-5pm"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {availableDoctors.length === 0 && (
                <div className="p-6 text-center bg-zinc-50 border border-dashed rounded-xl space-y-1">
                  <p className="text-xs font-medium text-ink-soft">
                    No registered doctors available.
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Add doctors in the Doctors tab to assign them to
                    consultations.
                  </p>
                </div>
              )}

              {selectedDoctorId && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/80 border border-teal-200 mt-2">
                  <div className="text-xs text-teal-900 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-deep shrink-0" />
                    <span>
                      Selected Doctor:{" "}
                      <strong>
                        {availableDoctors.find(
                          (d) => String(d.id) === String(selectedDoctorId),
                        )?.name || "Doctor"}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-teal-800 bg-teal-100/70 border border-teal-200 px-2.5 py-0.5 rounded-md font-medium">
                    {String(appointment.assignedDoctorId) ===
                    String(selectedDoctorId)
                      ? "Assigned to appointment"
                      : "Selected (will confirm with appointment)"}
                  </span>
                </div>
              )}
            </div>

            {/* Video provider & Meeting Link Assignment */}
            {(!appointment.consultationType ||
              appointment.consultationType === "video") && (
              <div className="p-4 rounded-xl border border-line bg-white shadow-xs space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-deep flex items-center justify-center">
                      <Video className="w-4 h-4 text-teal-deep" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink">
                        Video Consultation Meeting Link
                      </h4>
                      <p className="text-[11px] text-ink-soft">
                        Assign or generate a video room URL for this
                        consultation.
                      </p>
                    </div>
                  </div>

                  {manualMeetingLink.trim() &&
                  !manualMeetingLink.includes("/cdr-") ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-semibold gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Active Link Assigned
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-amber-800 bg-amber-50 border-amber-300 text-[11px]"
                    >
                      No Link Assigned
                    </Badge>
                  )}
                </div>

                {/* Platform Selector Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {(["google_meet", "zoom", "teams"] as const).map(
                    (platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => setActiveMeetingPlatform(platform)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          activeMeetingPlatform === platform
                            ? "border-teal-deep bg-teal-deep text-white shadow-xs"
                            : "border-line bg-white text-ink-soft hover:border-mint-deep hover:text-ink"
                        }`}
                      >
                        {getPlatformLabel(platform)}
                      </button>
                    ),
                  )}
                </div>

                {/* Link Input & Quick Generation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-teal-deep" />
                      Meeting Link URL
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type="url"
                        value={manualMeetingLink}
                        onChange={(e) => setManualMeetingLink(e.target.value)}
                        placeholder="e.g. https://meet.google.com/abc-defg-hij or https://zoom.us/j/..."
                        className="text-xs pr-8"
                      />
                      {manualMeetingLink && (
                        <button
                          type="button"
                          onClick={() => setManualMeetingLink("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink text-xs cursor-pointer p-0.5"
                          title="Clear input"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSaveMeetingLink()}
                      className="bg-teal-deep hover:bg-teal-800 text-white text-xs h-9 px-3.5 font-semibold gap-1.5 shrink-0 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Link
                    </Button> */}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule */}

            <div
              className="
                p-4
                rounded-xl
                border
                border-line
                bg-white
                shadow-xs
                space-y-3
              "
            >
              <h4 className="text-sm font-semibold text-ink">
                Schedule & Time Slots
              </h4>

              <p className="text-xs text-ink-soft">
                Accept requested time or suggest an alternative slot to the
                patient.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">
                    Appointment Date
                  </label>

                  <Input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">
                    Appointment Time
                  </label>

                  <Input
                    type="text"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="text-xs"
                  />

                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span className="text-[10px] font-semibold text-ink-soft mr-0.5">
                      Quick Slots:
                    </span>
                    {[
                      "09:30 AM",
                      "11:00 AM",
                      "02:30 PM",
                      "04:00 PM",
                      "05:30 PM",
                    ].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setRescheduleTime(slot)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          rescheduleTime === slot
                            ? "bg-[#5E3E3B] text-white border-[#5E3E3B] font-semibold shadow-2xs"
                            : "bg-[#FAF7F6] text-ink-soft border-line hover:border-mint-deep hover:text-ink"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Reason / Message to Patient (Optional for Reschedule)
                </label>

                <Input
                  type="text"
                  placeholder="e.g. Morning schedule is booked; offering afternoon consultation slot."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleProposeSchedule}
                  className="
                    bg-blue-700
                    hover:bg-blue-800
                    text-white
                    text-xs
                    h-9
                    gap-1.5
                  "
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Propose This New Time & Notify Patient
                </Button>

                {appointment.status === "approved" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>
                        <strong>Automatic Reminders Active:</strong> 24h & 1h
                        consultation reminders will be emailed automatically by
                        system.
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      disabled={Boolean(sendingReminder)}
                      onClick={() => handleSendReminder("24_hour")}
                      className="text-xs h-8 text-teal-800 hover:bg-teal-50"
                      title="Send an immediate preview of the 24h reminder email"
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      {sendingReminder === "24_hour"
                        ? "Sending..."
                        : "Test Ping Now"}
                    </Button>
                  </div>
                )}

                {reminderFeedback && (
                  <span className="text-xs font-semibold text-emerald-700 self-center">
                    {reminderFeedback}
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ========================================
              TAB 3 - CLINICAL NOTES
          ======================================== */}

          <TabsContent value="workspace" className="space-y-4 pt-2">
            <div
              className="
                p-4
                rounded-xl
                border
                border-line
                bg-white
                shadow-xs
                space-y-3
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-ink">
                    Doctor Consultation Workspace
                  </h4>

                  <p className="text-xs text-ink-soft">
                    Clinical findings, diagnosis, and post-consultation
                    recommendations.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  className="
                    bg-[#5E3E3B]
                    hover:bg-[#262525]
                    text-white
                    text-xs
                    h-8
                    gap-1
                    cursor-pointer
                  "
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Notes
                </Button>
              </div>

              <div className="space-y-3">
                {/* Chief complaint */}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">
                    Chief Complaint
                  </label>

                  <textarea
                    rows={2}
                    value={clinicalNotes.chiefComplaint}
                    onChange={(e) =>
                      setClinicalNotes({
                        ...clinicalNotes,
                        chiefComplaint: e.target.value,
                      })
                    }
                    className="
                      w-full
                      text-xs
                      p-2.5
                      rounded-lg
                      border
                      border-line
                      bg-[#FDFEFE]
                      text-ink
                      focus:border-mint-deep
                      focus:ring-2
                      focus:ring-mint-deep/15
                      outline-none
                    "
                    placeholder="Patient primary symptom or reason for consultation..."
                  />
                </div>

                {/* Findings + Diagnosis */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">
                      Consultation Findings
                    </label>

                    <textarea
                      rows={3}
                      value={clinicalNotes.findings}
                      onChange={(e) =>
                        setClinicalNotes({
                          ...clinicalNotes,
                          findings: e.target.value,
                        })
                      }
                      className="
                        w-full
                        text-xs
                        p-2.5
                        rounded-lg
                        border
                        border-line
                        bg-[#FDFEFE]
                        text-ink
                        focus:border-mint-deep
                        focus:ring-2
                        focus:ring-mint-deep/15
                        outline-none
                      "
                      placeholder="Visible clinical observations or scan evaluations..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">
                      Diagnosis / Assessment
                    </label>

                    <textarea
                      rows={3}
                      value={clinicalNotes.diagnosis}
                      onChange={(e) =>
                        setClinicalNotes({
                          ...clinicalNotes,
                          diagnosis: e.target.value,
                        })
                      }
                      className="
                        w-full
                        text-xs
                        p-2.5
                        rounded-lg
                        border
                        border-line
                        bg-[#FDFEFE]
                        text-ink
                        focus:border-mint-deep
                        focus:ring-2
                        focus:ring-mint-deep/15
                        outline-none
                      "
                      placeholder="Doctor diagnosis or assessment summary..."
                    />
                  </div>
                </div>

                {/* Treatment */}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">
                    Recommended Treatment Plan
                  </label>

                  <textarea
                    rows={2}
                    value={clinicalNotes.recommendedTreatment}
                    onChange={(e) =>
                      setClinicalNotes({
                        ...clinicalNotes,
                        recommendedTreatment: e.target.value,
                      })
                    }
                    className="
                      w-full
                      text-xs
                      p-2.5
                      rounded-lg
                      border
                      border-line
                      bg-[#FDFEFE]
                      text-ink
                      focus:border-mint-deep
                      focus:ring-2
                      focus:ring-mint-deep/15
                      outline-none
                    "
                    placeholder="Next steps, procedure recommendations, or scheduled clinic visit..."
                  />
                </div>

                {/* Additional instructions + Follow up */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">
                      Additional Instructions
                    </label>

                    <textarea
                      rows={2}
                      value={clinicalNotes.additionalInstructions}
                      onChange={(e) =>
                        setClinicalNotes({
                          ...clinicalNotes,
                          additionalInstructions: e.target.value,
                        })
                      }
                      className="
                        w-full
                        text-xs
                        p-2.5
                        rounded-lg
                        border
                        border-line
                        bg-[#FDFEFE]
                        text-ink
                        focus:border-mint-deep
                        focus:ring-2
                        focus:ring-mint-deep/15
                        outline-none
                      "
                      placeholder="Medications, hygiene instructions, or diet guidelines..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink">
                      Follow-up Requirements
                    </label>

                    <textarea
                      rows={2}
                      value={clinicalNotes.followUpRequirements}
                      onChange={(e) =>
                        setClinicalNotes({
                          ...clinicalNotes,
                          followUpRequirements: e.target.value,
                        })
                      }
                      className="
                        w-full
                        text-xs
                        p-2.5
                        rounded-lg
                        border
                        border-line
                        bg-[#FDFEFE]
                        text-ink
                        focus:border-mint-deep
                        focus:ring-2
                        focus:ring-mint-deep/15
                        outline-none
                      "
                      placeholder="Follow-up timeframe or required in-person tests..."
                    />
                  </div>
                </div>

                {/* Internal notes */}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink">
                    Internal Notes
                  </label>

                  <textarea
                    rows={3}
                    value={clinicalNotes.internalNotes}
                    onChange={(e) =>
                      setClinicalNotes({
                        ...clinicalNotes,
                        internalNotes: e.target.value,
                      })
                    }
                    className="
                      w-full
                      text-xs
                      p-2.5
                      rounded-lg
                      border
                      border-line
                      bg-[#FDFEFE]
                      text-ink
                      focus:border-mint-deep
                      focus:ring-2
                      focus:ring-mint-deep/15
                      outline-none
                    "
                    placeholder="Private internal notes..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ========================================
              TAB 4 - HISTORY
          ======================================== */}

          <TabsContent value="history" className="space-y-3 pt-2">
            <div
              className="
                p-4
                rounded-xl
                border
                border-line
                bg-white
                shadow-xs
              "
            >
              <h4 className="text-sm font-semibold text-ink mb-3">
                Audit Trail & Status History
              </h4>

              <div
                className="
                  relative
                  pl-6
                  space-y-4
                  before:absolute
                  before:left-2.5
                  before:top-2
                  before:bottom-2
                  before:w-0.5
                  before:bg-line
                "
              >
                {appointment.timeline.map((log) => (
                  <div key={log.id} className="relative">
                    <span
                      className="
                        absolute
                        -left-4.75
                        top-1
                        w-3
                        h-3
                        rounded-full
                        bg-teal-deep
                        ring-4
                        ring-emerald-50
                      "
                    />

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink">
                          {log.action}
                        </span>

                        <span className="text-[11px] text-ink-soft">
                          {log.timestamp}
                        </span>
                      </div>

                      <span className="text-[11px] text-teal-deep font-medium block">
                        By {log.actor}
                      </span>

                      {log.details && (
                        <p
                          className="
                            text-xs
                            text-ink-soft
                            mt-1
                            bg-line-soft/60
                            p-2
                            rounded
                          "
                        >
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ==========================================
            FOOTER
        ========================================== */}

        <DialogFooter
          className="
            px-6
            py-4
            bg-white
            border-t
            border-line
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
          "
        >
          <Button size="sm" variant="outline" onClick={onClose} className="">
            Close
          </Button>

          {appointment.status !== "completed" && (
            <Button
              size="sm"
              onClick={handleConfirmAll}
              className="
                      bg-emerald-700
                      hover:bg-emerald-800
                      text-white
                      text-xs
                      h-9
                      gap-1.5
                      font-semibold
                      shadow-xs
                    "
              title="Confirm doctor assignment, meeting link, and scheduled time"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {appointment.status === "approved"
                ? "Confirm Appointment"
                : "Confirm Appointment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
