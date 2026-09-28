import type { Appointment, ConsultationNotes, AppointmentStatus, AuditLog, TreatmentType } from "@/admin/types";

const STORAGE_KEY = "dental_appointments_v1";

const notifyChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("dental_appointments_updated"));
  }
};

export const appointmentService = {
  /**
   * Maps a PostgreSQL DB record into the rich frontend Appointment type
   */
  mapDbRecord(dbApt: any, existingLocal?: Appointment): Appointment {
    const idStr = String(dbApt.id);
    const refNo = existingLocal?.referenceNo || `APT-2026-${String(dbApt.id).padStart(4, "0")}`;

    // Supporting document from backend upload
    const docUrl = dbApt.supportingDocument || undefined;
    let documents = existingLocal?.documents || [];
    if (docUrl && documents.length === 0) {
      const fileName = docUrl.split("/").pop() || "Supporting Document";
      const isPdf = docUrl.toLowerCase().endsWith(".pdf");
      documents = [
        {
          id: `doc-${dbApt.id}`,
          name: fileName,
          type: isPdf ? "application/pdf" : "image/jpeg",
          size: "Uploaded File",
          url: docUrl,
          uploadedAt: dbApt.createdAt
            ? new Date(dbApt.createdAt).toLocaleDateString()
            : "Uploaded",
        },
      ];
    }

    let reqDate = dbApt.preferredDate || existingLocal?.requestedDate || new Date().toISOString().split("T")[0];
    if (typeof reqDate === "string" && reqDate.includes("T")) {
      reqDate = reqDate.split("T")[0];
    }

    const defaultTimeline: AuditLog[] = [
      {
        id: `tl_${dbApt.id}`,
        timestamp: dbApt.createdAt
          ? new Date(dbApt.createdAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date().toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
        action: "Appointment Request Submitted",
        actor: dbApt.patientName || "Patient",
        details: `${dbApt.tratmentType || "Consultation"} requested for ${reqDate} (${dbApt.preferredTime || "Morning"})`,
      },
    ];

    return {
      id: idStr,
      referenceNo: refNo,
      patient: {
        name: dbApt.patientName || existingLocal?.patient?.name || "Patient",
        email: dbApt.patientEmail || existingLocal?.patient?.email || "",
        phone: dbApt.phoneNumber || existingLocal?.patient?.phone || "",
        preferredContact: (dbApt.contactMethod || existingLocal?.patient?.preferredContact || "email") as any,
        avatar: existingLocal?.patient?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dbApt.patientName || "Patient")}`,
      },
      treatment: (dbApt.tratmentType || existingLocal?.treatment || "General Dental Consultation") as TreatmentType,
      consultationType: existingLocal?.consultationType || "video",
      status: (dbApt.status?.toLowerCase() || existingLocal?.status || "pending") as AppointmentStatus,
      requestedDate: reqDate,
      requestedTime: dbApt.preferredTime || existingLocal?.requestedTime || "Morning",
      confirmedDate: existingLocal?.confirmedDate || reqDate,
      confirmedTime: existingLocal?.confirmedTime || dbApt.preferredTime || "Morning",
      assignedDoctorId: existingLocal?.assignedDoctorId,
      assignedDoctor: existingLocal?.assignedDoctor,
      meetingPlatform: existingLocal?.meetingPlatform || "google_meet",
      meetingLink: existingLocal?.meetingLink || `https://meet.google.com/cdr-${String(dbApt.id).padStart(3, "0")}-apt`,
      patientMessage: dbApt.additionalDescription || existingLocal?.patientMessage || "",
      documents,
      consultationNotes: existingLocal?.consultationNotes,
      timeline: existingLocal?.timeline && existingLocal.timeline.length > 0 ? existingLocal.timeline : defaultTimeline,
      createdAt: dbApt.createdAt || existingLocal?.createdAt || new Date().toISOString(),
    };
  },

  /**
   * Fetch live appointments directly from PostgreSQL DB via backend API
   */
  async fetchAppointments(): Promise<Appointment[]> {
    try {
      const res = await fetch("/api/appointment/get-all-appointment");
      if (!res.ok) {
        throw new Error(`Failed to fetch appointments: ${res.statusText}`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const localApts = this.getAppointments();
        const localMap = new Map<string, Appointment>();
        localApts.forEach((apt) => localMap.set(apt.id, apt));

        // Map all records from the database
        const dbMapped: Appointment[] = json.data.map((dbRecord: any) => {
          const existingLocal = localMap.get(String(dbRecord.id));
          return this.mapDbRecord(dbRecord, existingLocal);
        });

        // Save fresh DB appointments to localStorage cache
        this.saveAppointments(dbMapped);
        return dbMapped;
      }
    } catch (err) {
      console.warn("Backend appointments fetch failed, falling back to cached:", err);
    }
    return this.getAppointments();
  },

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

      // Also sync to backend database if this is a DB appointment
      if (!isNaN(Number(id))) {
        const payload: Record<string, any> = {};
        if (updates.status) payload.status = updates.status;
        if (updates.confirmedDate) payload.preferredDate = updates.confirmedDate;
        if (updates.confirmedTime) payload.preferredTime = updates.confirmedTime;
        if (updates.patient?.name) payload.patientName = updates.patient.name;
        if (updates.patient?.email) payload.patientEmail = updates.patient.email;
        if (updates.patient?.phone) payload.phoneNumber = updates.patient.phone;
        if (updates.treatment) payload.tratmentType = updates.treatment;

        fetch(`/api/appointment/update-appointment/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch((err) => console.error("Failed to sync appointment update to DB:", err));
      }
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

      if (!isNaN(Number(id))) {
        fetch(`/api/appointment/update-appointment/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        }).catch((err) => console.error("Failed to sync completed status to DB:", err));
      }
    }
    return updatedObj;
  },
};
