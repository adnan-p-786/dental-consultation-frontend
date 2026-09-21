import React, { useState } from 'react';
import {
  Search,
  Bell,
  PlusCircle,
  Clock,
  Calendar,
  CheckCircle2,
  Video,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Appointment } from '../types';

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
  onNewAppointmentClick,
  pendingAppointments,
  onSelectAppointment,
  onOpenMobileMenu,
}) => {
  const [activeDate] = useState(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-line bg-white/90 px-3 sm:px-6 backdrop-blur-md gap-2 sm:gap-4">
      {/* Mobile Hamburger & Search Bar */}
      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-md">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl border border-line bg-white text-ink-soft hover:text-teal-deep hover:bg-line-soft transition-colors shrink-0"
            title="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3.5">
        {/* Clinic Today Date & Status Chip */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper border border-line text-xs font-medium text-ink-soft">
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
              className="relative h-10 w-10 rounded-xl border-line hover:bg-line-soft"
              title="Notifications"
            >
              <Bell className="h-4 w-4 text-ink-soft" />
              {pendingAppointments.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-white shadow-xs">
                  {pendingAppointments.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <DropdownMenuLabel className="flex items-center justify-between py-2">
              <span className="font-semibold text-sm text-ink">Appointment Requests</span>
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
                      <span className="font-semibold text-xs text-ink">{apt.patient.name}</span>
                      <span className="text-[10px] font-mono text-ink-soft">{apt.referenceNo}</span>
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
                      {apt.consultationType === 'video' && (
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

        {/* Quick New Appointment Button */}
        <Button
          onClick={onNewAppointmentClick}
          className="gap-2 rounded-xl bg-teal-deep text-white hover:bg-teal-mid shadow-xs font-semibold"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Appointment</span>
        </Button>
      </div>
    </header>
  );
};
