import React, { useState } from "react";
import {
  Bell,
  Calendar,
  Video,
  Menu,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Appointment } from "@/admin/types";

interface DoctorHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  availability?: "available" | "busy" | "offline";
  onAvailabilityChange?: (status: "available" | "busy" | "offline") => void;
  todayAppointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onOpenMobileMenu?: () => void;
}

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({
  searchQuery: _searchQuery,
  onSearchChange: _onSearchChange,
  todayAppointments,
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
            className="shrink-0 rounded-xl border border-line bg-white p-2 text-ink-soft transition-colors hover:bg-line-soft hover:text-teal-deep md:hidden cursor-pointer"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Date & Clinic Status Chip */}
        <div className="hidden items-center gap-2 rounded-full border border-line bg-paper/80 px-3 py-1.5 text-xs font-medium text-ink-soft shadow-xs lg:flex">
          <Calendar className="w-3.5 h-3.5 text-mint-deep" />
          <span>{activeDate}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 font-semibold">Doctor On Duty</span>
        </div>


        {/* Notification Bell with Today's Appointments */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative h-10 w-10 rounded-xl border-line bg-white shadow-xs hover:bg-line-soft cursor-pointer"
              title="Notifications"
              aria-label="Open appointment notifications"
            >
              <Bell className="h-4 w-4 text-ink-soft" />
              {todayAppointments.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-deep px-1 text-[10px] font-bold text-white shadow-xs">
                  {todayAppointments.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 rounded-xl border border-line bg-white shadow-xl p-1.5 z-50"
          >
            <DropdownMenuLabel className="flex items-center justify-between py-1.5 px-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5E3E3B]">
                Today's Consultations
              </span>
              <Badge className="bg-[#FAF2F0] text-[#5E3E3B] text-[10px]">
                {todayAppointments.length} Scheduled
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto space-y-1 py-1">
              {todayAppointments.length === 0 ? (
                <div className="p-4 text-center text-xs text-ink-soft">
                  No consultations scheduled for today yet.
                </div>
              ) : (
                todayAppointments.slice(0, 5).map((apt) => (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => onSelectAppointment(apt)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-[#FAF2F0] transition-colors flex items-start gap-2.5 text-xs cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-deep/10 text-teal-deep flex items-center justify-center shrink-0">
                      {apt.consultationType === "video" ? (
                        <Video className="w-4 h-4 text-mint-deep" />
                      ) : (
                        <Stethoscope className="w-4 h-4 text-teal-deep" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink truncate">
                          {apt.patient.name}
                        </span>
                        <span className="text-[10px] text-ink-soft">
                          {apt.confirmedTime || apt.requestedTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-teal-deep truncate">
                        {apt.treatment}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
export default DoctorHeader;
