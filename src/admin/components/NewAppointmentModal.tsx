import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Appointment, Doctor, TreatmentType } from '../types';
import { treatmentOptions } from '../data/mockData';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onCreateAppointment: (appointment: Partial<Appointment>) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  doctors,
  onCreateAppointment,
}) => {
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState<'email' | 'phone' | 'whatsapp'>('email');
  const [treatment, setTreatment] = useState<TreatmentType>('General Dental Consultation');
  const [consultationType, setConsultationType] = useState<'video' | 'in_person'>('video');
  const [requestedDate, setRequestedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [requestedTime, setRequestedTime] = useState('10:00 AM');
  const [assignedDoctorId, setAssignedDoctorId] = useState('');
  const [patientMessage, setPatientMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !email) return;

    onCreateAppointment({
      patient: {
        name: patientName,
        email,
        phone: phone || '+1 (555) 000-0000',
        preferredContact,
      },
      treatment,
      consultationType,
      requestedDate,
      requestedTime,
      assignedDoctorId: assignedDoctorId || undefined,
      patientMessage,
      status: 'pending',
    });

    // Reset form
    setPatientName('');
    setEmail('');
    setPhone('');
    setPatientMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-[95vw] sm:w-full p-4 sm:p-6 bg-white max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-ink">
            Create New Appointment Request
          </DialogTitle>
          <DialogDescription className="text-xs text-ink-soft">
            Directly register an appointment booking on behalf of a patient or walk-in caller.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Patient Full Name *</label>
              <Input
                required
                placeholder="e.g. Katherine Pierce"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Email Address *</label>
              <Input
                required
                type="email"
                placeholder="e.g. katherine@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Phone Number</label>
              <Input
                placeholder="+1 (555) 000-1234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Preferred Contact</label>
              <Select
                value={preferredContact}
                onValueChange={(val: 'email' | 'phone' | 'whatsapp') => setPreferredContact(val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Treatment & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Treatment / Service *</label>
              <Select
                value={treatment}
                onValueChange={(val: TreatmentType) => setTreatment(val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>
                <SelectContent>
                  {treatmentOptions.map((opt: string) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Consultation Type</label>
              <Select
                value={consultationType}
                onValueChange={(val: 'video' | 'in_person') => setConsultationType(val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Online Video Consultation</SelectItem>
                  <SelectItem value="in_person">In-Clinic Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date, Time & Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Preferred Date</label>
              <Input
                type="date"
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Preferred Time</label>
              <Input
                type="text"
                placeholder="10:00 AM"
                value={requestedTime}
                onChange={(e) => setRequestedTime(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Assign Doctor</label>
              <Select
                value={assignedDoctorId}
                onValueChange={(val) => setAssignedDoctorId(val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select doctor..." />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name.split(',')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink">Symptoms / Patient Notes</label>
            <textarea
              rows={2}
              placeholder="Describe symptoms, requirements, or reason for booking..."
              value={patientMessage}
              onChange={(e) => setPatientMessage(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-line bg-white text-ink focus:border-mint-deep focus:ring-2 focus:ring-mint-deep/15 focus:outline-none"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-line flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#5E3E3B] text-white hover:bg-[#262525] text-xs cursor-pointer">
              Create Appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
