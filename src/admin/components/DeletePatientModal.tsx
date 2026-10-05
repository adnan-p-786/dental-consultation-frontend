import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Trash2,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import type { PatientRecord } from "@/api/User/userApi";

interface DeletePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (patientId: number) => Promise<void> | void;
  patient: PatientRecord | null;
}

export const DeletePatientModal: React.FC<DeletePatientModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patient,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!patient) return null;

  const fullName = `${patient.firstName} ${patient.lastName}`.trim() || "Patient";
  const initials = `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`.toUpperCase() || "PT";

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(patient.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete patient:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isDeleting && onClose()}
    >
      <DialogContent className="sm:max-w-[490px] p-6 gap-5 rounded-2xl border-line">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-ink">
                Delete Patient Profile
              </DialogTitle>
              <p className="text-xs text-ink-soft mt-0.5">
                Are you sure you want to permanently remove this patient account?
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Patient Summary Card */}
        <div className="p-4 rounded-xl bg-[#FBFDFB] border border-line space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border border-line-soft shrink-0">
              <AvatarFallback className="bg-[#5E3E3B] text-white font-bold text-xs tracking-wider">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-ink truncate">
                  {fullName}
                </h4>
                <Badge
                  variant="outline"
                  className="bg-paper text-ink-soft border-line text-[10px] px-2 py-0.5 font-normal uppercase"
                >
                  ID #{patient.id}
                </Badge>
              </div>
              <p className="text-xs text-ink-soft truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3 shrink-0 text-ink-light" />
                <span>{patient.email}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-line/60 text-xs text-ink-soft">
            <div className="flex items-center gap-1.5 truncate">
              <Phone className="w-3.5 h-3.5 text-mint-deep shrink-0" />
              <span className="truncate">{patient.phoneNumber || "No phone"}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate justify-end">
              <span className="capitalize font-medium text-ink">
                {patient.gender || "Gender unspecified"}
                {patient.age ? ` • ${patient.age} yrs` : ""}
              </span>
            </div>
          </div>

          {patient.address && (
            <div className="pt-2 border-t border-line/60 text-xs text-ink-soft flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-mint-deep shrink-0 mt-0.5" />
              <span className="line-clamp-2">{patient.address}</span>
            </div>
          )}

          {patient.createdAt && (
            <div className="pt-2 border-t border-line/60 text-[11px] text-ink-light flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-ink-light shrink-0" />
              <span>Registered on {new Date(patient.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
            </div>
          )}
        </div>

        {/* Warning Note */}
        <div className="px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11.5px] text-amber-900 leading-relaxed">
          <p className="font-semibold text-amber-950 mb-0.5">Clinical Records Safe Notice</p>
          Deleting this user removes their login and profile details. Historic appointments and clinical consultations remain securely archived in the system.
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
                <span>Removing Patient...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Patient</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
