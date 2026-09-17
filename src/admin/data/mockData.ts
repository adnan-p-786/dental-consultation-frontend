import type { Appointment, Doctor } from '../types';

export const initialDoctors: Doctor[] = [];

export const initialAppointments: Appointment[] = [];

export const treatmentOptions = [
  'General Dental Consultation',
  'Dental Implant',
  'Orthodontics',
  'Cosmetic Dentistry',
  'Root Canal Treatment',
  'Tooth Extraction',
  'Pediatric Dentistry',
  'Gum Treatment',
  'Dental Crowns & Bridges',
  'Other',
] as const;

export const defaultSettings = {
  clinicName: 'Cedarview Dental Online Consultation & Surgical Center',
  appointmentDurations: [30, 45, 60],
  defaultDuration: 30,
  workingHoursStart: '08:00',
  workingHoursEnd: '18:00',
  reminderHours: [24, 1],
  supportedPlatforms: ['google_meet', 'zoom', 'teams'] as const,
  defaultPlatform: 'google_meet' as const,
  autoConfirmEmergency: false,
  requireUploadsForImplants: true,
  supportEmail: 'care@cedarviewdental.com',
  clinicPhone: '+1 (555) 234-CARE',
};
