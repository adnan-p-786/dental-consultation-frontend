import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Trash2,
  Loader2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Hash,
} from "lucide-react";
import type { Appointment } from "../types";

interface DeleteAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appointmentId: string | number) => Promise<void> | void;
  appointment: Appointment | null;
}

export const DeleteAppointmentModal: React.FC<DeleteAppointmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointment,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!appointment) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(appointment.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete appointment:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled":
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "in_progress":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 gap-5 rounded-2xl border-line">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">
                Delete Appointment
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-soft mt-0.5">
                Are you sure you want to permanently delete this appointment?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Appointment Summary Card */}
        <div className="p-4 rounded-xl bg-[#FBFDFB] border border-line space-y-3">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-line-soft">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-teal-deep font-semibold">
                <Hash className="w-3.5 h-3.5 text-mint-deep shrink-0" />
                <span>{appointment.referenceNo || `APT-${appointment.id}`}</span>
              </div>
              <h4 className="font-bold text-sm text-ink truncate mt-0.5">
                {appointment.patient?.name || "Unknown Patient"}
              </h4>
              <p className="text-xs text-ink-soft truncate">
                {appointment.patient?.email || appointment.patient?.phone || "No contact info"}
              </p>
            </div>

            <Badge
              variant="outline"
              className={`text-[10px] capitalize px-2 py-0.5 font-semibold shrink-0 ${getStatusBadge(
                appointment.status
              )}`}
            >
              {appointment.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-ink-soft">
            <div className="flex items-center gap-1.5 truncate">
              <Stethoscope className="w-3.5 h-3.5 text-mint-deep shrink-0" />
              <span className="truncate text-ink font-medium">
                {appointment.treatment}
              </span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-mint-deep shrink-0" />
              <span className="truncate text-ink font-medium">
                {appointment.confirmedDate || appointment.requestedDate || "Date TBD"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-mint-deep shrink-0" />
              <span className="truncate text-ink font-medium">
                {appointment.confirmedTime || appointment.requestedTime || "Time TBD"}
              </span>
            </div>

            {appointment.assignedDoctor?.name && (
              <div className="flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-mint-deep shrink-0" />
                <span className="truncate text-ink font-medium">
                  {appointment.assignedDoctor.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Warning text */}
        <p className="text-xs text-rose-600 bg-rose-50/60 p-2.5 rounded-lg border border-rose-100 flex items-center gap-2">
          <Trash2 className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>
            This record will be permanently deleted from the database. This action cannot be undone.
          </span>
        </p>

        <DialogFooter className="flex gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 text-xs h-10 border-line hover:bg-slate-50 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 text-xs h-10 bg-rose-600 hover:bg-rose-700 text-white font-medium gap-1.5 shadow-sm"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Delete Appointment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
