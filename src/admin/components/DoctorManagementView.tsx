import React, { useState } from "react";
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  Star,
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
import type { Doctor } from "../types";

interface DoctorManagementViewProps {
  doctors: Doctor[];
  onToggleStatus: (doctorId: string) => void;
  onAddDoctor?: (doctor: Doctor) => void;
  onUpdateDoctor?: (doctor: Doctor) => void;
  onDeleteDoctor?: (doctorId: string) => void;
}

export const DoctorManagementView: React.FC<DoctorManagementViewProps> = ({
  doctors,
  onToggleStatus,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const specialties = [
    "all",
    ...Array.from(
      new Set(doctors.map((d) => d.specialization.split("&")[0].trim())),
    ),
  ];

  const filteredDoctors = doctors.filter((doc) => {
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
            Doctor & Availability Management
          </h3>
          <p className="text-xs text-ink-soft mt-1">
            Configure working hours, availability schedules, and room
            assignments for dental providers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-paper border border-line text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-ink">
                {doctors.filter((d) => d.status === "available").length}{" "}
                Available
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-paper border border-line text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-semibold text-ink">
                {doctors.filter((d) => d.status === "busy").length} In Session
              </span>
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
        {filteredDoctors.map((doc) => (
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
                    <h4 className="font-semibold text-sm text-ink truncate" title={doc.name}>
                      {doc.name}
                    </h4>
                    <p className="text-xs text-mint-deep font-medium truncate" title={doc.specialization}>
                      {doc.specialization}
                    </p>
                    {doc.rating && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-bold text-ink">
                          {doc.rating}
                        </span>
                        <span className="text-[10px] text-ink-soft">
                          (50+ consultations)
                        </span>
                      </div>
                    )}
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
              <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF7F6] border border-line text-xs">
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
                <div className="flex items-center justify-between text-ink-soft pt-1 border-t border-line/50">
                  <span>Current Active Schedule:</span>
                  <span className="font-bold text-teal-deep">
                    {doc.activeAppointments} appointments today
                  </span>
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
              <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus(doc.id)}
                  className="text-xs h-8 flex-1 cursor-pointer"
                >
                  Toggle Availability
                </Button>
                {onUpdateDoctor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingDoctor(doc);
                      setIsAddModalOpen(true);
                    }}
                    className="text-xs h-8 text-teal-deep hover:text-teal-700 hover:bg-teal-50 p-2 cursor-pointer"
                    title="Edit Doctor"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                )}
                {onDeleteDoctor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDoctorToDelete(doc)}
                    className="text-xs h-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 cursor-pointer"
                    title="Remove Doctor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
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
