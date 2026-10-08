import React, { useState, useMemo } from "react";
import {
  Search,
  Users,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  RefreshCw,
  UserCheck,
  UserX,
  Filter,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { usePatientsQuery, useDeletePatientMutation } from "@/api/User/userHooks";
import type { PatientRecord } from "@/api/User/userApi";
import { DeletePatientModal } from "./DeletePatientModal";

export const PatientManagementView: React.FC = () => {
  const { data: patients = [], isLoading } = usePatientsQuery();
  const deletePatientMutation = useDeletePatientMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [patientToDelete, setPatientToDelete] = useState<PatientRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Gender filter
      if (selectedGender !== "all") {
        if (!patient.gender || patient.gender.toLowerCase() !== selectedGender.toLowerCase()) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.toLowerCase();
        const email = (patient.email || "").toLowerCase();
        const phone = (patient.phoneNumber || "").toLowerCase();
        const address = (patient.address || "").toLowerCase();
        const idStr = String(patient.id);

        return (
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          address.includes(q) ||
          idStr.includes(q)
        );
      }

      return true;
    });
  }, [patients, searchQuery, selectedGender]);

  // Statistics
  const totalCount = patients.length;

  const handleDeleteClick = (patient: PatientRecord) => {
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (patientId: number) => {
    try {
      await deletePatientMutation.mutateAsync(patientId);
      toast.success("Patient profile removed successfully", {
        description: "The patient record has been deleted from the database.",
      });
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete patient:", err);
      const errMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to delete patient. Please try again.";
      toast.error(errMsg);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Top Banner & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-line shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F4ECE9] flex items-center justify-center text-[#5E3E3B] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-xl text-ink">
                Patients Details
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Complete directory of registered patients
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-paper border border-line text-xs">
              <UserCheck className="w-3.5 h-3.5 text-mint-deep" />
              <span className="font-semibold text-ink">
                {totalCount} Total Patients
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-line shadow-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, email, phone, or address..."
            className="pl-9 h-10 text-xs rounded-xl bg-paper/60 border-line focus-visible:ring-1 focus-visible:ring-mint-deep"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-light hover:text-ink cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-ink-soft font-medium">
            <Filter className="w-3.5 h-3.5 text-ink-light" />
            <span className="hidden sm:inline">Gender:</span>
          </div>
          <Select value={selectedGender} onValueChange={setSelectedGender}>
            <SelectTrigger className="w-[140px] h-10 text-xs rounded-xl border-line bg-paper/60">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-line">
              <SelectItem value="all" className="text-xs">All Genders</SelectItem>
              <SelectItem value="male" className="text-xs">Male</SelectItem>
              <SelectItem value="female" className="text-xs">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Patients Table Card */}
      <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-ink-soft">
            <RefreshCw className="w-7 h-7 animate-spin text-mint-deep" />
            <p className="text-xs font-medium">Loading patients directory...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-paper border border-line flex items-center justify-center mx-auto mb-3 text-ink-light">
              <UserX className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-ink">No patients found</h4>
            <p className="text-xs text-ink-soft max-w-sm mx-auto mt-1">
              {searchQuery || selectedGender !== "all"
                ? "No patients matched your current search criteria. Try clearing the filter or search bar."
                : "There are no registered patients yet in the dental consultation system."}
            </p>
            {(searchQuery || selectedGender !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGender("all");
                }}
                className="mt-4 text-xs h-8 px-3 rounded-xl border-line cursor-pointer"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-line bg-paper/50 hover:bg-paper/50">
                  <TableHead className="text-xs font-semibold text-ink h-11 pl-6">
                    Patient Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-ink h-11">
                    Contact Details
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-ink h-11">
                    Demographics
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-ink h-11">
                    Residential Address
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-ink h-11">
                    Registered On
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-ink h-11 text-right pr-6">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => {
                  const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "Unnamed Patient";
                  const initials = `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`.toUpperCase() || "PT";
                  const formattedDate = patient.createdAt
                    ? new Date(patient.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  return (
                    <TableRow
                      key={patient.id}
                      className="border-line hover:bg-paper/30 transition-colors"
                    >
                      {/* Column 1: Patient Identity */}
                      <TableCell className="py-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-line-soft shrink-0">
                            <AvatarFallback className="bg-[#5E3E3B] text-white text-xs font-bold tracking-wider">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-ink truncate">
                                {fullName}
                              </span>
                              <Badge
                                variant="outline"
                                className="bg-paper text-ink-soft border-line text-[10px] px-1.5 py-0 font-normal uppercase"
                              >
                                #{patient.id}
                              </Badge>
                            </div>
                            <span className="text-[11px] text-mint-deep font-medium">
                              Patient Account
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Column 2: Contact Info */}
                      <TableCell className="py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-ink">
                            <Mail className="w-3.5 h-3.5 text-mint-deep shrink-0" />
                            <span className="truncate max-w-[180px]">{patient.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                            <Phone className="w-3.5 h-3.5 text-mint-deep shrink-0" />
                            <span>{patient.phoneNumber || "No phone"}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Column 3: Demographics */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {patient.gender ? (
                            <Badge
                              variant="outline"
                              className="capitalize text-xs px-2 py-0.5 bg-[#FAF7F6] text-ink border-line font-medium"
                            >
                              {patient.gender}
                            </Badge>
                          ) : (
                            <span className="text-xs text-ink-light italic">Gender unset</span>
                          )}

                          {patient.age ? (
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-0.5 bg-mint/10 text-teal-deep border-mint/20 font-medium"
                            >
                              {patient.age} yrs
                            </Badge>
                          ) : (
                            <span className="text-xs text-ink-light italic">Age unset</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Column 4: Residential Address */}
                      <TableCell className="py-3.5 max-w-[220px]">
                        {patient.address ? (
                          <div className="flex items-start gap-1.5 text-xs text-ink-soft">
                            <MapPin className="w-3.5 h-3.5 text-mint-deep shrink-0 mt-0.5" />
                            <span className="line-clamp-2" title={patient.address}>
                              {patient.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-light italic">
                            No address provided
                          </span>
                        )}
                      </TableCell>

                      {/* Column 5: Registered Date */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                          <Calendar className="w-3.5 h-3.5 text-ink-light shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                      </TableCell>

                      {/* Column 6: Delete Action Button */}
                      <TableCell className="py-3.5 text-right pr-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(patient)}
                          className="h-8 px-3 text-xs text-rose-600 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-100/70 border-rose-200/80 gap-1.5 rounded-xl cursor-pointer font-medium transition-colors"
                          title="Delete patient"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Patient Confirmation Modal */}
      <DeletePatientModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPatientToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        patient={patientToDelete}
      />
    </div>
  );
};
export default PatientManagementView;
