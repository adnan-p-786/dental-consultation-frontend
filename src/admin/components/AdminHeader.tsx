import React, { useState } from "react";
import {
  Search,
  Bell,
  Clock,
  Calendar,
  CheckCircle2,
  Video,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Appointment } from "../types";

interface AdminHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewAppointmentClick: () => void;
  pendingAppointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onOpenMobileMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchQuery,
  onSearchChange,
  pendingAppointments,
  onSelectAppointment,
  onOpenMobileMenu,
}) => {
  const [activeDate] = useState(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-line bg-white/90 px-3 shadow-[0_1px_0_rgb(94_62_59_/_4%)] backdrop-blur-md gap-2 sm:px-6 sm:gap-4">
      {/* Mobile Hamburger & Search Bar */}
      <div className="flex min-w-0 max-w-md flex-1 items-center gap-2.5">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="shrink-0 rounded-xl border border-line bg-white p-2 text-ink-soft transition-colors hover:bg-line-soft hover:text-teal-deep md:hidden"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="relative hidden w-full max-w-sm sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <Input
            type="text"
            placeholder="Search appointments, patients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search appointments and patients"
            className="h-10 rounded-xl border-line bg-paper/70 pl-9 text-xs shadow-xs transition-shadow placeholder:text-ink-soft/70 focus:bg-white focus:shadow-sm"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Clinic Today Date & Status Chip */}
        <div className="hidden items-center gap-2 rounded-full border border-line bg-paper/80 px-3 py-1.5 text-xs font-medium text-ink-soft shadow-xs lg:flex">
          <Calendar className="w-3.5 h-3.5 text-mint-deep" />
          <span>{activeDate}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 font-semibold">Clinic Active</span>
        </div>

        {/* Notification Bell with Pending Requests Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative h-10 w-10 rounded-xl border-line bg-white shadow-xs hover:bg-line-soft"
              title="Notifications"
              aria-label="Open appointment notifications"
            >
              <Bell className="h-4 w-4 text-ink-soft" />
              {pendingAppointments.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-white shadow-xs">
                  {pendingAppointments.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl border-line bg-white p-2 shadow-lg">
            <DropdownMenuLabel className="flex items-center justify-between py-2">
              <span className="font-semibold text-sm text-ink">
                Appointment Requests
              </span>
              <Badge variant="requested" className="text-[10px]">
                {pendingAppointments.length} pending
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {pendingAppointments.length === 0 ? (
              <div className="py-6 text-center text-xs text-ink-soft">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5 opacity-80" />
                All appointment requests have been processed!
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-1">
                {pendingAppointments.slice(0, 5).map((apt) => (
                  <DropdownMenuItem
                    key={apt.id}
                    onClick={() => onSelectAppointment(apt)}
                    className="flex flex-col items-start gap-1 p-2.5 rounded-lg cursor-pointer hover:bg-line-soft transition-colors"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-xs text-ink">
                        {apt.patient.name}
                      </span>
                      <span className="text-[10px] font-mono text-ink-soft">
                        {apt.referenceNo}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                      <Clock className="w-3 h-3 text-mint-deep" />
                      <span>
                        {apt.requestedDate} • {apt.requestedTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                        {apt.treatment}
                      </span>
                      {apt.consultationType === "video" && (
                        <span className="flex items-center gap-1 text-[10px] text-teal-deep font-medium">
                          <Video className="w-2.5 h-2.5" /> Video
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
