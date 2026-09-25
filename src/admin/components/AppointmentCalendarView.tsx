import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Appointment } from "../types";

interface AppointmentCalendarViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
}

export const AppointmentCalendarView: React.FC<
  AppointmentCalendarViewProps
> = ({ appointments, onSelectAppointment }) => {
  const [calendarMode, setCalendarMode] = useState<"month" | "week" | "day">(
    "month",
  );
  const [currentDate, setCurrentDate] = useState(new Date("2026-09-17"));

  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (calendarMode === "month") nextDate.setMonth(nextDate.getMonth() - 1);
    else if (calendarMode === "week") nextDate.setDate(nextDate.getDate() - 7);
    else nextDate.setDate(nextDate.getDate() - 1);
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (calendarMode === "month") nextDate.setMonth(nextDate.getMonth() + 1);
    else if (calendarMode === "week") nextDate.setDate(nextDate.getDate() + 7);
    else nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date("2026-09-17"));
  };

  // Calendar month days generation (September 2026)
  const monthTitle = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Simple clean calendar grid for current view
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Days in month: Sep 2026 has 30 days, Sep 1 2026 is Tuesday (day 2)
  const daysArray = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateString = `2026-09-${dayNum < 10 ? "0" + dayNum : dayNum}`;
    const dayAppointments = appointments.filter(
      (a) => (a.confirmedDate || a.requestedDate) === dateString,
    );
    return { dayNum, dateString, dayAppointments };
  });

  return (
    <div className="space-y-4">
      {/* Calendar Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-line shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-line bg-line-soft/40 p-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="h-8 w-8 text-ink-soft hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-8 px-2.5 text-xs font-semibold text-teal-deep"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8 text-ink-soft hover:text-ink"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h3 className="font-display font-semibold text-lg text-ink ml-2">
            {monthTitle}
          </h3>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-line-soft p-1 rounded-xl">
          {(["month", "week", "day"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setCalendarMode(mode)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                calendarMode === mode
                  ? "bg-white text-teal-deep shadow-xs font-bold"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {mode} view
            </button>
          ))}
        </div>
      </div>

      {/* Month View Grid */}
      {calendarMode === "month" && (
        <div className="bg-white rounded-2xl border border-line shadow-xs overflow-x-auto">
          <div className="min-w-162.5">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-line bg-[#FAF7F6]">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="py-2.5 text-center text-xs font-semibold text-ink-soft uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-line">
              {/* Blank leading slots for Tuesday start (Sun, Mon = 2 slots) */}
              <div className="min-h-26.25 p-2 bg-[#FAFBFB]/50" />
              <div className="min-h-26.25 p-2 bg-[#FAFBFB]/50" />

              {daysArray.map(({ dayNum, dateString, dayAppointments }) => {
                const isToday = dateString === "2026-09-17";
                return (
                  <div
                    key={dateString}
                    className={`min-h-26.25 p-2 transition-colors hover:bg-line-soft/30 flex flex-col justify-between ${
                      isToday ? "bg-teal-50/30" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-semibold flex items-center justify-center rounded-full w-6 h-6 ${
                          isToday
                            ? "bg-teal-deep text-white shadow-xs"
                            : "text-ink"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayAppointments.length > 0 && (
                        <span className="text-[10px] text-ink-soft font-medium">
                          {dayAppointments.length} apt
                        </span>
                      )}
                    </div>

                    {/* Appointments chips */}
                    <div className="space-y-1 overflow-y-auto max-h-20">
                      {dayAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => onSelectAppointment(apt)}
                          className={`p-1.5 rounded-md text-[11px] font-medium border transition-all cursor-pointer truncate shadow-2xs hover:scale-[1.01] ${
                            apt.status === "approved"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : apt.status === "requested"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : apt.status === "completed"
                                  ? "bg-teal-50 text-teal-800 border-teal-200"
                                  : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}
                          title={`${apt.patient.name} - ${apt.treatment} (${apt.requestedTime})`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate font-semibold">
                              {apt.patient.name}
                            </span>
                            {apt.consultationType === "video" && (
                              <Video className="w-2.5 h-2.5 shrink-0 opacity-70" />
                            )}
                          </div>
                          <div className="text-[10px] opacity-80 truncate">
                            {apt.confirmedTime || apt.requestedTime} •{" "}
                            {apt.treatment.split(" ")[0]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Trailing slots for 35 grid total (30 + 2 = 32, so 3 trailing) */}
              <div className="min-h-26.25 p-2 bg-[#FAFBFB]/50" />
              <div className="min-h-26.25 p-2 bg-[#FAFBFB]/50" />
              <div className="min-h-26.25 p-2 bg-[#FAFBFB]/50" />
            </div>
          </div>
        </div>
      )}

      {/* Week / Day View */}
      {calendarMode !== "month" && (
        <div className="bg-white rounded-2xl border border-line shadow-xs p-6 text-center space-y-4">
          <div className="max-w-md mx-auto space-y-2">
            <CalendarIcon className="w-10 h-10 text-teal-deep mx-auto opacity-70" />
            <h4 className="font-semibold text-base text-ink">
              {calendarMode === "week"
                ? "Week Schedule (Sep 14 - Sep 20)"
                : "Daily Schedule (Sep 17, 2026)"}
            </h4>
            <p className="text-xs text-ink-soft">
              Active consultations scheduled for this period. Click any card to
              inspect or reschedule.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-left max-w-4xl mx-auto">
            {appointments.filter(
              (a) =>
                a.status === "approved" ||
                a.status === "requested" ||
                a.status === "proposed",
            ).length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-ink-soft">
                No appointments scheduled for this view.
              </div>
            ) : (
              appointments
                .filter(
                  (a) =>
                    a.status === "approved" ||
                    a.status === "requested" ||
                    a.status === "proposed",
                )
                .map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => onSelectAppointment(apt)}
                    className="p-3.5 rounded-xl border border-line bg-[#FAF7F6] hover:border-mint-deep/60 transition-all cursor-pointer space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant={apt.status} className="text-[10px]">
                        {apt.status}
                      </Badge>
                      <span className="text-xs font-mono text-ink-soft">
                        {apt.confirmedTime || apt.requestedTime}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm text-ink">
                        {apt.patient.name}
                      </h5>
                      <p className="text-xs text-mint-deep font-medium">
                        {apt.treatment}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-line/60 text-[11px] text-ink-soft">
                      <span>
                        {apt.assignedDoctor
                          ? apt.assignedDoctor.name.split(",")[0]
                          : "Unassigned"}
                      </span>
                      {apt.consultationType === "video" ? (
                        <span className="flex items-center gap-1 text-teal-deep font-semibold">
                          <Video className="w-3 h-3" /> Video Call
                        </span>
                      ) : (
                        <span>In-Clinic</span>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
