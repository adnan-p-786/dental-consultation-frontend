import React, { useState } from "react";
import {
  Mail,
  Phone,
  Video,
  CheckCircle2,
  RotateCcw,
  UserCheck,
  ExternalLink,
  Copy,
  Check,
  FileSpreadsheet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Appointment, AppointmentStatus, Doctor } from "../types";

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
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
  onUpdateStatus,
  onAssignDoctor,
  onUpdateSchedule,
  onUpdateMeetingLink,
  onSaveClinicalNotes,
}) => {
  if (!appointment) return null;

  // Local state for actions
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    appointment.assignedDoctorId || "",
  );
  const [rescheduleDate, setRescheduleDate] = useState(
    appointment.confirmedDate || appointment.requestedDate,
  );
  const [rescheduleTime, setRescheduleTime] = useState(
    appointment.confirmedTime || appointment.requestedTime,
  );
  const [actionNote, setActionNote] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeMeetingPlatform, setActiveMeetingPlatform] = useState<
    "google_meet" | "zoom" | "teams"
  >(appointment.meetingPlatform || "google_meet");

  // Clinical workspace notes state
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

  const handleCopyLink = () => {
    if (appointment.meetingLink) {
      navigator.clipboard.writeText(appointment.meetingLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleGenerateMeeting = () => {
    const randomCode =
      Math.random().toString(36).substring(2, 6) +
      "-" +
      Math.random().toString(36).substring(2, 6);
    let generatedUrl = "";
    if (activeMeetingPlatform === "google_meet") {
      generatedUrl = `https://meet.google.com/cdr-${randomCode}`;
    } else if (activeMeetingPlatform === "zoom") {
      generatedUrl = `https://zoom.us/j/9${Math.floor(100000000 + Math.random() * 900000000)}`;
    } else {
      generatedUrl = `https://teams.microsoft.com/l/meetup-join/cda-${randomCode}`;
    }
    onUpdateMeetingLink(appointment.id, activeMeetingPlatform, generatedUrl);
  };

  const handleApproveCurrent = () => {
    onUpdateStatus(
      appointment.id,
      "approved",
      "Approved requested date and time.",
    );
  };

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

  const handleAssign = (docId: string) => {
    setSelectedDoctorId(docId);
    onAssignDoctor(appointment.id, docId);
  };

  const handleSaveNotes = () => {
    onSaveClinicalNotes(appointment.id, clinicalNotes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[92vh] sm:max-h-[90vh] p-0 overflow-hidden flex flex-col bg-[#FCFDFD]">
        {/* Header Ribbon */}
        <div className="bg-linear-to-r from-teal-deep to-teal-mid text-white p-4 sm:p-6 pb-4 sm:pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-white/15 text-emerald-200 border border-white/20">
                {appointment.referenceNo}
              </span>
              <Badge
                variant={appointment.status}
                className="capitalize text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 shadow-xs"
              >
                {appointment.status.replace("_", " ")}
              </Badge>
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
          <DialogDescription className="text-emerald-100 text-xs sm:text-sm mt-0.5 sm:mt-1">
            {appointment.treatment} •{" "}
            {appointment.consultationType === "video"
              ? "Online Video Consultation"
              : "In-Clinic Appointment"}
          </DialogDescription>
        </div>

        {/* Modal Body with Tabs */}
        <Tabs
          defaultValue="details"
          className="flex-1 overflow-y-auto px-3.5 sm:px-6 py-4"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto w-full bg-line-soft p-1 gap-1">
            <TabsTrigger value="details" className="py-2 text-xs">
              Case Details
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="py-2 text-xs">
              Schedule & Doctor
            </TabsTrigger>
            <TabsTrigger value="workspace" className="py-2 text-xs">
              Clinical Notes
            </TabsTrigger>
            <TabsTrigger value="history" className="py-2 text-xs">
              Timeline ({appointment.timeline.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Case Details */}
          <TabsContent value="details" className="space-y-4 pt-2">
            {/* Patient profile summary card */}
            <div className="p-4 rounded-xl border border-line bg-white shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
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

              <div className="space-y-1">
                <div className="text-xs text-ink-soft flex items-center gap-1">
                  <Mail className="w-3 h-3 text-mint-deep" /> Email
                </div>
                <a
                  href={`mailto:${appointment.patient.email}`}
                  className="text-xs font-medium text-teal-deep hover:underline truncate block"
                >
                  {appointment.patient.email}
                </a>
                <div className="text-[11px] text-ink-soft">
                  Prefers: {appointment.patient.preferredContact}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-ink-soft flex items-center gap-1">
                  <Phone className="w-3 h-3 text-mint-deep" /> Phone
                </div>
                <a
                  href={`tel:${appointment.patient.phone}`}
                  className="text-xs font-medium text-teal-deep hover:underline truncate block"
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

            {/* Patient Request Message */}
            <div className="p-4 rounded-xl border border-line bg-white shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Patient Case Description / Symptoms
                </span>
                <span className="text-xs text-mint-deep font-medium">
                  Primary Requirement
                </span>
              </div>
              <p className="text-sm text-ink leading-relaxed bg-[#FAF7F6] p-3 rounded-lg border border-line-soft">
                {appointment.patientMessage ||
                  "No specific notes provided by patient upon booking."}
              </p>
            </div>

            {/* Supporting Documents / Scans */}
            <div className="p-4 rounded-xl border border-line bg-white shadow-xs space-y-3">
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
                      className="flex items-center justify-between p-3 rounded-lg border border-line bg-[#FAF7F6] hover:border-mint-deep/50 transition-colors"
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
                        className="h-7 text-xs text-mint-deep px-2"
                      >
                        Preview
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-ink-soft bg-[#FAF7F6] rounded-lg border border-dashed border-line">
                  No scan files or photos attached to this request.
                </div>
              )}
            </div>

            {/* Video Meeting Card */}
            {appointment.consultationType === "video" && (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-teal-deep" />
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-deep">
                      Video Consultation Link
                    </span>
                  </div>
                  {appointment.meetingLink ? (
                    <Badge variant="approved" className="text-[10px]">
                      Ready to Join
                    </Badge>
                  ) : (
                    <Badge variant="requested" className="text-[10px]">
                      Link Not Generated
                    </Badge>
                  )}
                </div>

                {appointment.meetingLink ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex-1 bg-white border border-line rounded-lg px-3 py-2 text-xs font-mono text-ink truncate select-all">
                      {appointment.meetingLink}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="gap-1.5 h-9"
                    >
                      {copiedLink ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedLink ? "Copied" : "Copy"}
                    </Button>
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#5E3E3B] text-white hover:bg-[#262525] transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Join Consultation
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleGenerateMeeting}
                      className="gap-1.5 bg-[#5E3E3B] text-white hover:bg-[#262525] text-xs h-9 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Generate Video Consultation Room
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Scheduling & Doctor Assignment */}
          <TabsContent value="scheduling" className="space-y-4 pt-2">
            {/* Assign Doctor Section */}
            <div className="p-4 rounded-xl border border-line bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-ink">
                    Assigned Dental Specialist
                  </h4>
                  <p className="text-xs text-ink-soft">
                    Assign a doctor matching the required treatment
                    specialization.
                  </p>
                </div>
                {appointment.assignedDoctor && (
                  <Badge
                    variant="outline"
                    className="text-xs text-teal-deep border-teal-200 bg-teal-50"
                  >
                    Currently Assigned
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctorId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleAssign(doc.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? "border-teal-deep bg-[#FAF2F0] ring-2 ring-teal-deep/15"
                          : "border-line bg-white hover:border-mint-deep/40 hover:bg-[#FAF7F6]"
                      }`}
                    >
                      <Avatar className="w-10 h-10 border border-line shrink-0">
                        <AvatarImage src={doc.avatar} />
                        <AvatarFallback>{doc.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-ink truncate">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-ink-soft truncate">
                          {doc.specialization}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              doc.status === "available"
                                ? "bg-emerald-500"
                                : doc.status === "busy"
                                  ? "bg-amber-500"
                                  : "bg-zinc-400"
                            }`}
                          />
                          <span className="text-[10px] text-ink-soft capitalize">
                            {doc.status} ({doc.activeAppointments} active)
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <UserCheck className="w-5 h-5 text-teal-deep shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date & Time Confirmation or Reschedule */}
            <div className="p-4 rounded-xl border border-line bg-white shadow-xs space-y-3">
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
                  className="bg-blue-700 hover:bg-blue-800 text-white text-xs h-9 gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Propose This New Time & Notify Patient
                </Button>
                {appointment.status !== "approved" && (
                  <Button
                    size="sm"
                    onClick={handleApproveCurrent}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Current Requested Slot
                  </Button>
                )}
              </div>
            </div>

            {/* Video Provider Preference */}
            <div className="p-4 rounded-xl border border-line bg-white shadow-xs space-y-3">
              <h4 className="text-sm font-semibold text-ink">
                Video Consultation Provider
              </h4>
              <div className="flex items-center gap-3">
                {(["google_meet", "zoom", "teams"] as const).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setActiveMeetingPlatform(platform)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                      activeMeetingPlatform === platform
                        ? "border-teal-deep bg-teal-deep text-white shadow-xs"
                        : "border-line bg-white text-ink-soft hover:border-mint-deep"
                    }`}
                  >
                    {platform.replace("_", " ")}
                  </button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateMeeting}
                  className="text-xs h-8 ml-auto"
                >
                  Generate Room URL
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Clinical Notes Workspace (PDF Section 7) */}
          <TabsContent value="workspace" className="space-y-4 pt-2">
            <div className="p-4 rounded-xl border border-line bg-white shadow-xs space-y-3">
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
                  className="bg-[#5E3E3B] hover:bg-[#262525] text-white text-xs h-8 gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Notes
                </Button>
              </div>

              <div className="space-y-3">
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
                    className="w-full text-xs p-2.5 rounded-lg border border-line bg-[#FDFEFE] text-ink focus:border-mint-deep focus:ring-2 focus:ring-mint-deep/15 outline-none"
                    placeholder="Patient primary symptom or reason for consultation..."
                  />
                </div>

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
                      className="w-full text-xs p-2.5 rounded-lg border border-line bg-[#FDFEFE] text-ink focus:border-mint-deep focus:ring-2 focus:ring-mint-deep/15 outline-none"
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
                      className="w-full text-xs p-2.5 rounded-lg border border-line bg-[#FDFEFE] text-ink focus:border-mint-deep focus:ring-2 focus:ring-mint-deep/15 outline-none"
                      placeholder="Doctor diagnosis or assessment summary..."
                    />
                  </div>
                </div>

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
                    className="w-full text-xs p-2.5 rounded-lg border border-line bg-[#FDFEFE] text-ink focus:border-mint-deep focus:ring-2 focus:ring-mint-deep/15 outline-none"
                    placeholder="Next steps, procedure recommendations, or scheduled clinic visit..."
                  />
                </div>

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
                      className="w-full text-xs p-2.5 rounded-lg border border-line bg-[#FDFEFE] text-ink focus:border-mint-deep focus:ring-2 focus:ring-mint-deep/15 outline-none"
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
                      className="w-full text-xs p-2.5 rounded-lg border border-line bg-[#FDFEFE] text-ink focus:border-mint-deep focus:ring-2 focus:ring-mint-deep/15 outline-none"
                      placeholder="Follow-up timeframe or required in-person tests..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: Timeline Audit Trail */}
          <TabsContent value="history" className="space-y-3 pt-2">
            <div className="p-4 rounded-xl border border-line bg-white shadow-xs">
              <h4 className="text-sm font-semibold text-ink mb-3">
                Audit Trail & Status History
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                {appointment.timeline.map((log) => (
                  <div key={log.id} className="relative">
                    <span className="absolute -left-4.75 top-1 w-3 h-3 rounded-full bg-teal-deep ring-4 ring-emerald-50" />
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
                        <p className="text-xs text-ink-soft mt-1 bg-line-soft/60 p-2 rounded">
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

        {/* Modal Actions Footer */}
        <DialogFooter className="px-6 py-4 bg-white border-t border-line flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Direct Status Actions based on current status */}
            {appointment.status !== "completed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdateStatus(
                    appointment.id,
                    "completed",
                    "Marked completed by admin.",
                  )
                }
                className="text-xs text-teal-deep border-teal-200 hover:bg-teal-50"
              >
                Mark Completed
              </Button>
            )}

            {appointment.status !== "no_show" &&
              appointment.status !== "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onUpdateStatus(
                      appointment.id,
                      "no_show",
                      "Patient was absent.",
                    )
                  }
                  className="text-xs text-zinc-700 hover:bg-zinc-100"
                >
                  Mark No-Show
                </Button>
              )}

            {appointment.status !== "cancelled" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onUpdateStatus(
                    appointment.id,
                    "cancelled",
                    "Cancelled by clinic administration.",
                  )
                }
                className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Cancel Appointment
              </Button>
            )}
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="bg-[#5E3E3B] text-white hover:bg-[#262525] cursor-pointer"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
