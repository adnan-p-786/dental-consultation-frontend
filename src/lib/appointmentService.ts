import type { Appointment, ConsultationNotes, AppointmentStatus, AuditLog } from "@/admin/types";

const STORAGE_KEY = "dental_appointments_v1";

const notifyChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("dental_appointments_updated"));
  }
};

export const appointmentService = {
  getAppointments(): Appointment[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Appointment[];
    } catch (err) {
      console.error("Failed to load appointments:", err);
      return [];
    }
  },

  getDoctorAppointments(doctor: { id?: string | number; name?: string; email?: string }): Appointment[] {
    const all = this.getAppointments();
    if (!doctor) return [];

    const docIdStr = doctor.id ? String(doctor.id) : "";
    const docEmail = (doctor.email || "").toLowerCase().trim();
    const docName = (doctor.name || "").toLowerCase().trim();

    return all.filter((apt) => {
      // Direct ID match
      if (apt.assignedDoctorId && docIdStr && String(apt.assignedDoctorId) === docIdStr) {
        return true;
      }
      // Email match
      if (apt.assignedDoctor?.email && docEmail && apt.assignedDoctor.email.toLowerCase() === docEmail) {
        return true;
      }
      // Name match (flexible for "Dr. First Last" or "First Last")
      if (apt.assignedDoctor?.name && docName) {
        const aptDocName = apt.assignedDoctor.name.toLowerCase().replace(/^dr\.?\s*/i, "");
        const targetDocName = docName.toLowerCase().replace(/^dr\.?\s*/i, "");
        if (aptDocName.includes(targetDocName) || targetDocName.includes(aptDocName)) {
          return true;
        }
      }
      return false;
    });
  },

  getPatientAppointments(patient: { email?: string; phone?: string; name?: string }): Appointment[] {
    const all = this.getAppointments();
    if (!patient) return [];

    const patientEmail = (patient.email || "").toLowerCase().trim();
    const patientPhone = (patient.phone || "").replace(/\D/g, "");
    const patientName = (patient.name || "").toLowerCase().trim();

    return all.filter((apt) => {
      // Email match
      if (apt.patient?.email && patientEmail && apt.patient.email.toLowerCase().trim() === patientEmail) {
        return true;
      }
      // Phone match
      if (apt.patient?.phone && patientPhone) {
        const aptPhone = apt.patient.phone.replace(/\D/g, "");
        if (aptPhone && (aptPhone === patientPhone || aptPhone.endsWith(patientPhone) || patientPhone.endsWith(aptPhone))) {
          return true;
        }
      }
      // Name match
      if (apt.patient?.name && patientName) {
        const aptName = apt.patient.name.toLowerCase().trim();
        if (aptName === patientName) {
          return true;
        }
      }
      return false;
    });
  },

  getAppointmentById(id: string): Appointment | undefined {
    return this.getAppointments().find((a) => a.id === id);
  },

  saveAppointments(appointments: Appointment[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
      notifyChange();
    } catch (err) {
      console.error("Failed to save appointments:", err);
    }
  },

  createAppointment(
    data: Omit<Appointment, "id" | "referenceNo" | "status" | "timeline" | "createdAt"> & {
      status?: AppointmentStatus;
      id?: string;
      referenceNo?: string;
    }
  ): Appointment {
    const existing = this.getAppointments();
    const id = data.id || `apt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const referenceNo =
      data.referenceNo || `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialStatus: AppointmentStatus = data.status || "pending";

    const initialTimeline: AuditLog[] = [
      {
        id: `tl_${Date.now()}`,
        timestamp: new Date().toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        action: "Appointment Request Submitted",
        actor: data.patient.name,
        details: `Requested ${data.treatment} (${data.consultationType === "video" ? "Online Video" : "In Clinic"})`,
      },
    ];

    const newAppointment: Appointment = {
      ...data,
      id,
      referenceNo,
      status: initialStatus,
      timeline: initialTimeline,
      createdAt: new Date().toISOString(),
    };

    this.saveAppointments([newAppointment, ...existing]);
    return newAppointment;
  },

  updateAppointment(id: string, updates: Partial<Appointment>, actorName = "System"): Appointment | null {
    const all = this.getAppointments();
    let updatedObj: Appointment | null = null;

    const newAppointments = all.map((apt) => {
      if (apt.id === id) {
        const timeline = [...apt.timeline];
        if (updates.status && updates.status !== apt.status) {
          timeline.unshift({
            id: `tl_${Date.now()}`,
            timestamp: new Date().toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            action: `Status updated to ${updates.status.replace("_", " ")}`,
            actor: actorName,
          });
        }
        updatedObj = {
          ...apt,
          ...updates,
          timeline,
        };
        return updatedObj;
      }
      return apt;
    });

    if (updatedObj) {
      this.saveAppointments(newAppointments);
    }
    return updatedObj;
  },

  saveConsultationNotes(id: string, notes: ConsultationNotes, actorName = "Doctor"): Appointment | null {
    const all = this.getAppointments();
    let updatedObj: Appointment | null = null;

    const newAppointments = all.map((apt) => {
      if (apt.id === id) {
        const timeline = [
          {
            id: `tl_${Date.now()}`,
            timestamp: new Date().toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            action: "Consultation notes updated",
            actor: actorName,
          },
          ...apt.timeline,
        ];
        updatedObj = {
          ...apt,
          consultationNotes: {
            ...apt.consultationNotes,
            ...notes,
          },
          timeline,
        };
        return updatedObj;
      }
      return apt;
    });

    if (updatedObj) {
      this.saveAppointments(newAppointments);
    }
    return updatedObj;
  },

  completeConsultation(id: string, notes: ConsultationNotes, actorName = "Doctor"): Appointment | null {
    const all = this.getAppointments();
    let updatedObj: Appointment | null = null;

    const newAppointments = all.map((apt) => {
      if (apt.id === id) {
        const timeline = [
          {
            id: `tl_${Date.now()}`,
            timestamp: new Date().toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            action: "Consultation marked as completed",
            actor: actorName,
            details: notes.diagnosis ? `Diagnosis: ${notes.diagnosis}` : undefined,
          },
          ...apt.timeline,
        ];
        updatedObj = {
          ...apt,
          status: "completed" as AppointmentStatus,
          consultationNotes: {
            ...apt.consultationNotes,
            ...notes,
          },
          timeline,
        };
        return updatedObj;
      }
      return apt;
    });

    if (updatedObj) {
      this.saveAppointments(newAppointments);
    }
    return updatedObj;
  },
};
