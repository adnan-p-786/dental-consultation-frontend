import React, { useState, useMemo, useRef } from "react";
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { AddDoctorModal } from "./AddDoctorModal";
import { DeleteDoctorModal } from "./DeleteDoctorModal";
import { useAppointmentsQuery } from "@/api/Appointment/appointmentHooks";
import type { Doctor, Appointment } from "../types";

interface DoctorManagementViewProps {
  doctors: Doctor[];
  appointments?: Appointment[];
  onToggleStatus?: (doctorId: string) => void;
  onAddDoctor?: (doctor: Doctor) => void;
  onUpdateDoctor?: (doctor: Doctor) => void;
  onDeleteDoctor?: (doctorId: string) => void;
}

export const DoctorManagementView: React.FC<DoctorManagementViewProps> = ({
  doctors,
  appointments: passedAppointments,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
}) => {
  // Query fallback to ensure appointments are always live
  const { data: queryAppointments = [] } = useAppointmentsQuery();
  const appointments =
    passedAppointments && passedAppointments.length > 0
      ? passedAppointments
      : queryAppointments;

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  // Maintain a persistent, stable order of doctor IDs so changing status / availability never changes card positions
  const doctorOrderRef = useRef<string[]>([]);

  const orderedDoctors = useMemo(() => {
    const currentOrder = doctorOrderRef.current;
    const orderMap = new Map<string, number>();
    currentOrder.forEach((id, idx) => orderMap.set(id, idx));

    // Register any newly added doctors into the stable sequence
    doctors.forEach((doc) => {
      if (!orderMap.has(doc.id)) {
        orderMap.set(doc.id, currentOrder.length);
        currentOrder.push(doc.id);
      }
    });

    return [...doctors].sort((a, b) => {
      const idxA = orderMap.get(a.id) ?? 0;
      const idxB = orderMap.get(b.id) ?? 0;
      return idxA - idxB;
    });
  }, [doctors]);

  // Normalize date string to YYYY-MM-DD
  const normalizeDateStr = (dateVal?: string | Date | null): string => {
    if (!dateVal) return "";
    if (typeof dateVal === "string") {
      const match = dateVal.match(/^\d{4}-\d{2}-\d{2}/);
      if (match) return match[0];
      const parsed = new Date(dateVal);
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, "0");
        const d = String(parsed.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
      return dateVal.split("T")[0];
    }
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, "0");
    const d = String(dateVal.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Get local date in YYYY-MM-DD
  const getTodayLocalStr = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Bulletproof match between an appointment and a doctor
  const isAppointmentForDoctor = (apt: Appointment, doc: Doctor): boolean => {
    const docId = String(doc.id || "").trim();
    const aptDocId = String(
      apt.assignedDoctorId ||
        apt.assignedDoctor?.id ||
        (apt as any).assigned_doctor_id ||
        "",
    ).trim();

    // 1. Direct ID match (handles raw ID, string ID, and user-ID prefixes)
    if (docId && aptDocId) {
      if (aptDocId === docId) return true;
      if (
        aptDocId.replace(/^user-/, "") === docId.replace(/^user-/, "")
      )
        return true;
    }

    // 2. Email match
    const docEmail = (doc.email || "").toLowerCase().trim();
    const aptEmail = (
      apt.assignedDoctor?.email ||
      (apt as any).assignedDoctorEmail ||
      ""
    )
      .toLowerCase()
      .trim();
    if (docEmail && aptEmail && docEmail === aptEmail) {
      return true;
    }

    // 3. Name match
    const cleanName = (val?: string) =>
      (val || "")
        .toLowerCase()
        .replace(/^dr\.?\s*/i, "")
        .replace(/^doctor\s*/i, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();

    const docNameClean = cleanName(doc.name);
    const aptDocNameClean = cleanName(
      apt.assignedDoctorName ||
        apt.assignedDoctor?.name ||
        (apt as any).assigned_doctor_name,
    );

    if (docNameClean && aptDocNameClean) {
      if (docNameClean === aptDocNameClean) return true;
      if (docNameClean.length >= 3 && aptDocNameClean.includes(docNameClean))
        return true;
      if (aptDocNameClean.length >= 3 && docNameClean.includes(aptDocNameClean))
        return true;
    }

    return false;
  };

  // Dynamically map each doctor to their active scheduled appointments for today
  const doctorTodayAppointmentsMap = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    const todayStr = getTodayLocalStr();

    orderedDoctors.forEach((doc) => {
      const docTodayApts = appointments.filter((apt) => {
        if (!isAppointmentForDoctor(apt, doc)) return false;
        const aptDate = normalizeDateStr(
          apt.confirmedDate || apt.requestedDate,
        );
        if (aptDate !== todayStr) return false;
        // Inactive appointment statuses excluded
        const inactiveStatuses = ["cancelled", "rejected", "no_show"];
        return !inactiveStatuses.includes(apt.status);
      });

      // Sort chronologically by time
      docTodayApts.sort((a, b) => {
        const timeA = a.confirmedTime || a.requestedTime || "";
        const timeB = b.confirmedTime || b.requestedTime || "";
        return timeA.localeCompare(timeB);
      });

      map.set(doc.id, docTodayApts);
    });

    return map;
  }, [orderedDoctors, appointments]);

  const specialties = [
    "all",
    ...Array.from(
      new Set(orderedDoctors.map((d) => d.specialization.split("&")[0].trim())),
    ),
  ];

  const filteredDoctors = orderedDoctors.filter((doc) => {
    if (selectedSpecialty === "all") return true;
    return doc.specialization
      .toLowerCase()
      .includes(selectedSpecialty.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-line shadow-xs">
        <div>
          <h3 className="font-display font-semibold text-xl text-ink">
            Doctor Management
          </h3>
          <p className="text-xs text-ink-soft mt-1">
            Manage dental providers, clinical credentials, qualifications, and
            medical staff directory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-paper border border-line text-xs font-semibold text-teal-deep">
              <span>{doctors.length} Doctors Registered</span>
            </div>
          </div>

          {onAddDoctor && (
            <Button
              onClick={() => {
                setEditingDoctor(null);
                setIsAddModalOpen(true);
              }}
              className="bg-[#5E3E3B] text-white hover:bg-[#262525] text-xs h-9 px-3.5 shadow-xs gap-1.5 cursor-pointer font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Doctor
            </Button>
          )}
        </div>
      </div>

      {/* Specialty Filter */}
      {specialties.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-soft mr-1">
            Specialty:
          </span>
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                selectedSpecialty === spec
                  ? "bg-[#5E3E3B] text-white shadow-xs"
                  : "bg-white text-ink-soft border border-line hover:border-mint-deep"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      )}

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredDoctors.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-line shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-deep flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-base text-ink">
                No Doctors Registered
              </h4>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                There are currently no doctor profiles in the database. When
                dental providers are added, their profiles, working hours, and
                schedules will appear here.
              </p>
            </div>
            {onAddDoctor && (
              <Button
                onClick={() => {
                  setEditingDoctor(null);
                  setIsAddModalOpen(true);
                }}
                className="bg-[#5E3E3B] text-white hover:bg-[#262525] text-xs h-9 shadow-xs gap-1.5 mx-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add First Doctor
              </Button>
            )}
          </div>
        )}
        {filteredDoctors.map((doc) => {
          const todayApts = doctorTodayAppointmentsMap.get(doc.id) || [];
          const todayCount = todayApts.length;

          return (
            <Card
              key={doc.id}
              className="overflow-hidden border-line hover:border-mint-deep/60 hover:shadow-md transition-all duration-200"
            >
              <div className="p-5 space-y-4">
                {/* Doctor Head */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="w-14 h-14 border-2 border-line-soft shrink-0">
                      <AvatarImage src={doc.avatar} />
                      <AvatarFallback className="bg-teal-50 text-teal-deep font-bold">
                        {doc.name.replace("Dr. ", "").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4
                        className="font-semibold text-sm text-ink truncate"
                        title={doc.name}
                      >
                        {doc.name}
                      </h4>
                      <p
                        className="text-xs text-mint-deep font-medium truncate"
                        title={doc.specialization}
                      >
                        {doc.specialization}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      doc.status === "available"
                        ? "approved"
                        : doc.status === "busy"
                          ? "requested"
                          : "no_show"
                    }
                    className="text-[10px] capitalize font-bold shrink-0 whitespace-nowrap ml-auto"
                  >
                    {doc.status.replace("_", " ")}
                  </Badge>
                </div>

                {/* Working Hours & Room */}
                <div className="space-y-2 p-3 rounded-xl bg-[#FAF7F6] border border-line text-xs">
                  <div className="flex items-start justify-between gap-2 text-ink-soft">
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-mint-deep shrink-0 mt-0.5" />
                      Hours:
                    </span>
                    <span className="font-medium text-ink text-right">
                      {doc.workingHours}
                    </span>
                  </div>
                  {doc.room && (
                    <div className="flex items-center justify-between text-ink-soft">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-mint-deep" />
                        Location:
                      </span>
                      <span className="font-medium text-ink">{doc.room}</span>
                    </div>
                  )}

                  {/* Real-time Dynamic Active Schedule */}
                  <div className="space-y-1.5 pt-1.5 border-t border-line/50">
                    <div className="flex items-center justify-between text-xs text-ink-soft">
                      <span className="font-medium">Current Active Schedule:</span>
                      <span
                        className={`font-semibold ${
                          todayCount > 0 ? "text-teal-700" : "text-ink-soft"
                        }`}
                      >
                        {todayCount === 0
                          ? "0 appointments today"
                          : `${todayCount} appointment${todayCount > 1 ? "s" : ""} today`}
                      </span>
                    </div>

                    {todayCount > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {todayApts.slice(0, 3).map((apt) => (
                          <div
                            key={apt.id}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200/60 text-[11px] text-teal-900 font-medium"
                            title={`${apt.patient?.name || "Patient"} (${apt.treatment || "Consultation"}) at ${apt.confirmedTime || apt.requestedTime || "Today"}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-semibold text-teal-950">
                              {apt.confirmedTime || apt.requestedTime || "Scheduled"}
                            </span>
                            <span className="text-teal-700/80 truncate max-w-[85px]">
                              • {apt.patient?.name || "Patient"}
                            </span>
                          </div>
                        ))}
                        {todayCount > 3 && (
                          <span className="text-[10px] text-ink-soft self-center font-medium pl-0.5">
                            +{todayCount - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-ink-soft/75 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>No slots booked today</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-1 text-xs">
                  <a
                    href={`mailto:${doc.email}`}
                    className="flex items-center gap-2 text-ink-soft hover:text-teal-deep truncate"
                  >
                    <Mail className="w-3 h-3 text-mint-deep shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </a>
                  <a
                    href={`tel:${doc.phone}`}
                    className="flex items-center gap-2 text-ink-soft hover:text-teal-deep"
                  >
                    <Phone className="w-3 h-3 text-mint-deep shrink-0" />
                    <span>{doc.phone}</span>
                  </a>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-line flex justify-between gap-2">
                  {onUpdateDoctor && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingDoctor({ ...doc, activeAppointments: todayCount });
                        setIsAddModalOpen(true);
                      }}
                      className="text-xs h-8 w-1/2 text-teal-deep hover:text-teal-700 hover:bg-teal-50 gap-1.5 cursor-pointer font-medium flex-1 sm:flex-initial"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Button>
                  )}
                  {onDeleteDoctor && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDoctorToDelete({ ...doc, activeAppointments: todayCount })
                      }
                      className="text-xs h-8 w-1/2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 cursor-pointer"
                      title="Remove Doctor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Doctor Modal */}
      {(onAddDoctor || onUpdateDoctor) && (
        <AddDoctorModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingDoctor(null);
          }}
          onAddDoctor={onAddDoctor || (() => {})}
          onUpdateDoctor={onUpdateDoctor}
          onDeleteDoctor={onDeleteDoctor}
          doctorToEdit={editingDoctor}
        />
      )}

      {/* Delete Doctor Confirmation Modal */}
      {onDeleteDoctor && (
        <DeleteDoctorModal
          isOpen={Boolean(doctorToDelete)}
          onClose={() => setDoctorToDelete(null)}
          onConfirm={(doctorId) => onDeleteDoctor(doctorId)}
          doctor={doctorToDelete}
        />
      )}
    </div>
  );
};
