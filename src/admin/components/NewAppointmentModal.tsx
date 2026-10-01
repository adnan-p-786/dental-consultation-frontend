import React, { useState, useEffect } from "react";
import { useActiveTreatmentsQuery } from "@/api/Treatment/treatmentHooks";
import { apiClient } from "@/api/Api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  Stethoscope,
} from "lucide-react";
import type { Appointment, Doctor, TreatmentType } from "../types";
import { treatmentOptions } from "../data/mockData";
import { appointmentService } from "@/lib/appointmentService";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onCreateAppointment: (appointment: Appointment) => void;
}

const formatDisplayTime = (timeStr?: string) => {
  if (!timeStr) return "";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  doctors,
  onCreateAppointment,
}) => {
  const [treatment, setTreatment] = useState<TreatmentType>(
    "General Dental Consultation",
  );
  const [activeTreatments, setActiveTreatments] = useState<string[]>([
    ...treatmentOptions,
  ]);
  const { data: dbActiveTreatments, isLoading: loadingTreatments } =
    useActiveTreatmentsQuery({ enabled: isOpen });
  const [patientName, setPatientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState<"email" | "phone">(
    "email",
  );
  const [requestedDate, setRequestedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [requestedTime, setRequestedTime] = useState("10:00");
  const [assignedDoctorId, setAssignedDoctorId] = useState("");
  const [patientMessage, setPatientMessage] = useState("");
  const [supportingFile, setSupportingFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dbActiveTreatments && dbActiveTreatments.length > 0) {
      const names: string[] = dbActiveTreatments.map((t) => t.name);
      setActiveTreatments(names);
      setTreatment((prev) => (names.includes(prev) ? prev : names[0]));
    }
  }, [dbActiveTreatments]);

  const handleClose = () => {
    setTreatment(activeTreatments[0] || "General Dental Consultation");
    setPatientName("");
    setEmail("");
    setPhone("");
    setPreferredContact("email");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setRequestedDate(tomorrow.toISOString().split("T")[0]);
    setRequestedTime("10:00");
    setAssignedDoctorId("");
    setPatientMessage("");
    setSupportingFile(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSupportingFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation matching Appointment.tsx
    if (!patientName.trim()) {
      setError("Please enter patient full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter patient email address.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter patient phone number.");
      return;
    }

    if (!requestedDate) {
      setError("Please select a preferred appointment date.");
      return;
    }

    if (!requestedTime) {
      setError("Please pick a preferred appointment time.");
      return;
    }

    try {
      setLoading(true);

      const formattedTime =
        formatDisplayTime(requestedTime) || requestedTime || "10:00 AM";

      const data = new FormData();
      data.append("patientName", patientName.trim());
      data.append("patientEmail", email.trim().toLowerCase());
      data.append("phoneNumber", phone.trim());
      data.append("contactMethod", preferredContact.toLowerCase());
      data.append("tratmentType", treatment);
      data.append("preferredDate", requestedDate);
      data.append("preferredTime", formattedTime);
      data.append("status", "pending");

      if (patientMessage.trim()) {
        data.append("additionalDescription", patientMessage.trim());
      }

      if (supportingFile) {
        data.append("supportingDocument", supportingFile);
      }

      data.append("sendAcknowledgmentEmail", "false");

      const response = await apiClient.post(
        "/appointment/create-appointment",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const serverAppointment = response.data?.data;
      if (serverAppointment) {
        const mapped = appointmentService.mapDbRecord(serverAppointment);
        if (assignedDoctorId) {
          mapped.assignedDoctorId = assignedDoctorId;
          mapped.assignedDoctor = doctors.find(
            (d) => d.id === assignedDoctorId,
          );
        }

        // Sync with local appointments cache
        const all = appointmentService.getAppointments();
        appointmentService.saveAppointments([mapped, ...all]);

        onCreateAppointment(mapped);
        handleClose();
      }
    } catch (err: any) {
      console.error("Failed to create appointment:", err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to submit appointment request. Please make sure the backend server is running.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-4 sm:p-6 bg-white max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ink">
            Create New Appointment
          </DialogTitle>
          <DialogDescription className="text-xs text-ink-soft">
            Directly register an appointment booking into the database with the
            same fields as the booking portal.
          </DialogDescription>
        </DialogHeader>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5 text-xs animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1">
              <p className="font-semibold text-rose-800">Submission Failed</p>
              <p className="text-rose-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* 1. Major Treatment / Case Requirement */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink flex items-center gap-1">
              Major Treatment / Case Requirement{" "}
              <span className="text-rose-500">*</span>
            </label>
            <Select
              value={treatment}
              onValueChange={(val: TreatmentType) => setTreatment(val)}
              disabled={loadingTreatments}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue
                  placeholder={
                    loadingTreatments
                      ? "Loading active treatments..."
                      : "Select treatment"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {activeTreatments.map((opt: string) => (
                  <SelectItem key={opt} value={opt} hideIndicator>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  required
                  placeholder="e.g. Katherine Pierce"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="text-xs h-9 pr-8"
                />
                <User className="w-3.5 h-3.5 text-ink-soft/60 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  required
                  type="email"
                  placeholder="e.g. katherine@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs h-9 pr-8"
                />
                <Mail className="w-3.5 h-3.5 text-ink-soft/60 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  required
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs h-9 pr-8"
                />
                <Phone className="w-3.5 h-3.5 text-ink-soft/60 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Preferred Contact Method */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                Preferred Contact Method{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 h-9">
                {(["email", "phone"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPreferredContact(method)}
                    className={`h-full rounded-lg border text-xs font-medium transition-all text-center cursor-pointer capitalize flex items-center justify-center gap-1.5 ${
                      preferredContact === method
                        ? "bg-[#5E3E3B] text-white border-[#5E3E3B] font-semibold shadow-2xs"
                        : "bg-[#FAF7F6] text-ink border-line hover:border-mint-deep/50"
                    }`}
                  >
                    {method === "email" ? (
                      <Mail className="w-3 h-3" />
                    ) : (
                      <Phone className="w-3 h-3" />
                    )}
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Preferred Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                Preferred Appointment Date{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  required
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="text-xs h-9 pr-8"
                />
                <Calendar className="w-3.5 h-3.5 text-ink-soft/60 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                Preferred Appointment Time{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  required
                  type="time"
                  value={requestedTime}
                  onChange={(e) => setRequestedTime(e.target.value)}
                  className="text-xs h-9 cursor-pointer"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <span className="text-[10px] font-semibold text-ink-soft mr-0.5">
                  Quick Slots:
                </span>
                {[
                  { label: "09:30 AM", value: "09:30" },
                  { label: "11:00 AM", value: "11:00" },
                  { label: "02:30 PM", value: "14:30" },
                  { label: "04:00 PM", value: "16:00" },
                  { label: "05:30 PM", value: "17:30" },
                ].map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => setRequestedTime(slot.value)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                      requestedTime === slot.value
                        ? "bg-[#5E3E3B] text-white border-[#5E3E3B] font-semibold shadow-2xs"
                        : "bg-[#FAF7F6] text-ink-soft border-line hover:border-mint-deep hover:text-ink"
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Assign Doctor (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-teal-deep" />
              Assign Doctor (Optional)
            </label>
            <Select
              value={assignedDoctorId}
              onValueChange={(val) =>
                setAssignedDoctorId(val === "unassigned" ? "" : val)
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Leave unassigned or select doctor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned" hideIndicator>
                  -- Leave Unassigned --
                </SelectItem>
                {doctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id} hideIndicator>
                    {doc.name}{" "}
                    {doc.specialization ? `(${doc.specialization})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 5. Additional Description / Symptoms / Message */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink">
              Additional Description / Symptoms / Medical History
            </label>
            <textarea
              rows={3}
              placeholder="Provide any additional information about the dental case or reason for appointment..."
              value={patientMessage}
              onChange={(e) => setPatientMessage(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-line bg-white text-ink placeholder:text-ink-soft/50 focus:border-mint-deep focus:ring-2 focus:ring-mint-deep/15 focus:outline-none resize-y"
            />
          </div>

          {/* 6. Optional Supporting Documents / Images */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink">
              Optional Supporting Documents / Images / Scans
            </label>
            <label
              htmlFor="supportingFileModal"
              className="border border-dashed border-line rounded-xl p-4 text-center bg-[#FAF7F6] hover:bg-white hover:border-mint-deep transition-all cursor-pointer group block"
            >
              <Upload className="w-5 h-5 text-mint-deep mx-auto mb-1.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-xs font-medium text-ink block">
                Click to attach a document or scan (.jpg, .jpeg, .png, .pdf)
              </span>

              {supportingFile && (
                <div className="mt-2.5 inline-flex items-center gap-2 bg-white border border-line px-3 py-1 rounded-lg text-xs text-mint-deep font-medium shadow-2xs">
                  <span className="truncate max-w-xs">
                    Selected: {supportingFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSupportingFile(null);
                    }}
                    className="w-4 h-4 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-600 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
              )}

              <input
                id="supportingFileModal"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <DialogFooter className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-[#5E3E3B] text-white hover:bg-[#262525] text-xs cursor-pointer flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? "Creating in DB..." : "Create Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
