export type AppointmentStatus =
  | 'pending'
  | 'requested'
  | 'under_review'
  | 'proposed'
  | 'approved'
  | 'completed'
  | 'reschedule_requested'
  | 'cancelled'
  | 'no_show';

export type TreatmentType =
  | 'General Dental Consultation'
  | 'Dental Implant'
  | 'Orthodontics'
  | 'Cosmetic Dentistry'
  | 'Root Canal Treatment'
  | 'Tooth Extraction'
  | 'Pediatric Dentistry'
  | 'Gum Treatment'
  | 'Dental Crowns & Bridges'
  | 'Other';

export type ConsultationType = 'video' | 'in_person';

export type MeetingPlatform = 'google_meet' | 'zoom' | 'teams';

export type ContactMethod = 'email' | 'phone' | 'whatsapp';

export interface PatientInfo {
  name: string;
  email: string;
  phone: string;
  preferredContact: ContactMethod;
  avatar?: string;
  age?: number;
  gender?: string;
  location?: string;
}

export interface Doctor {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  email: string;
  password: string;
  phone: string;
  workingHours: string;
  status: 'available' | 'busy' | 'on_leave';
  activeAppointments: number;
  room?: string;
  rating?: number;
}

export interface AppointmentDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  url?: string;
  uploadedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
}

export interface ConsultationNotes {
  chiefComplaint?: string;
  findings?: string;
  diagnosis?: string;
  recommendedTreatment?: string;
  additionalInstructions?: string;
  followUpRequirements?: string;
  internalNotes?: string;
}

export interface Appointment {
  id: string;
  referenceNo: string;
  patient: PatientInfo;
  treatment: TreatmentType;
  consultationType: ConsultationType;
  status: AppointmentStatus;
  requestedDate: string;
  requestedTime: string;
  confirmedDate?: string;
  confirmedTime?: string;
  assignedDoctorId?: string;
  assignedDoctor?: Doctor;
  meetingPlatform?: MeetingPlatform;
  meetingLink?: string;
  patientMessage?: string;
  documents?: AppointmentDocument[];
  consultationNotes?: ConsultationNotes;
  timeline: AuditLog[];
  createdAt: string;
}

export interface ClinicKPIs {
  newRequests: number;
  pendingApprovals: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedConsultations: number;
  cancelledAppointments: number;
  reschedulingRequests: number;
  noShowAppointments: number;
  totalAppointments: number;
}
