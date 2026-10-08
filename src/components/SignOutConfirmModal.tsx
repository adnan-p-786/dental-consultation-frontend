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
import { LogOut, AlertCircle, Loader2 } from "lucide-react";

export interface SignOutUser {
  id?: number | string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  message?: string;
  user?: SignOutUser | null;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Sign Out",
  message = "Are you sure want to signout?",
  user,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "superadmin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "doctor":
        return "Doctor";
      default:
        return "Patient";
    }
  };

  const getInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[440px] p-6 gap-5 rounded-3xl border border-line bg-white shadow-2xl"
        data-testid="signout-modal"
        aria-describedby="signout-dialog-description"
      >
        <DialogHeader className="space-y-3 text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-bold text-ink">
                {title}
              </DialogTitle>
              <DialogDescription
                id="signout-dialog-description"
                className="text-xs sm:text-sm text-ink-soft leading-relaxed mt-0.5"
                data-testid="signout-message"
              >
                {message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {user && (
          <div className="p-3.5 rounded-2xl bg-[#FAF7F6] border border-line flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-deep text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {getInitials()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-ink-soft truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-white border border-line text-teal-deep shrink-0 shadow-xs">
              {getRoleBadge(user.role)}
            </span>
          </div>
        )}

        <div className="flex items-start gap-2.5 text-xs text-ink-soft bg-amber-50/70 border border-amber-200/60 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            You will be signed out of your current session. You can sign back in anytime with your credentials.
          </span>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-line mt-1">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-xs font-medium cursor-pointer rounded-xl hover:bg-line-soft border-line h-9 sm:h-10 px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all h-9 sm:h-10 px-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignOutConfirmModal;
