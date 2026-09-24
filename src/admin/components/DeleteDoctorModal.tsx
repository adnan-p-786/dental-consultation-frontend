import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, Trash2, Loader2, Stethoscope, Clock} from "lucide-react";
import type { Doctor } from "../types";

interface DeleteDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (doctorId: string) => Promise<void> | void;
  doctor: Doctor | null;
}

export const DeleteDoctorModal: React.FC<DeleteDoctorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  doctor,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!doctor) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(doctor.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete doctor:", err);
    } finally {
      setIsDeleting(false);
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
                Are you sure want to remove !
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Doctor Summary Card */}
        <div className="p-4 rounded-xl bg-[#FBFDFB] border border-line space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border border-line-soft shrink-0">
              <AvatarImage src={doctor.avatar} />
              <AvatarFallback className="bg-teal-50 text-teal-deep font-bold text-xs">
                {doctor.name.replace("Dr. ", "").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-ink truncate">
                {doctor.name}
              </h4>
              <p className="text-xs text-mint-deep font-medium truncate flex items-center gap-1">
                <Stethoscope className="w-3 h-3 shrink-0" />
                {doctor.specialization}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/60 text-xs text-ink-soft">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-mint-deep shrink-0" />
              <span className="truncate">{doctor.workingHours}</span>
            </div>
            <div className="text-right">
              <span className="font-medium text-teal-deep">
                {doctor.activeAppointments || 0} active appointments
              </span>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={onClose}
            className="text-xs h-9 px-4 cursor-pointer font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 px-4 gap-1.5 shadow-xs cursor-pointer font-medium disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Removing Doctor...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Remove Doctor</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
