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
import { UserPlus, Sparkles, Clock, Stethoscope } from 'lucide-react';
import type { Doctor } from '../types';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDoctor: (doctor: Doctor) => void;
}

const SPECIALTY_OPTIONS = [
  'General Dentistry & Diagnostics',
  'Cosmetic Dentistry & Veneers',
  'Orthodontics & Clear Aligners',
  'Implantology & Oral Surgery',
  'Periodontics & Gum Health',
  'Endodontics & Root Canal',
  'Pediatric Dentistry',
  'Prosthodontics & Restorative',
  'Custom / Other',
];

const PRESET_HOURS = [
  'Mon - Fri, 08:00 AM - 04:00 PM',
  'Mon - Fri, 09:00 AM - 05:00 PM',
  'Tue - Sat, 10:00 AM - 06:00 PM',
  'Mon, Wed, Fri, 08:00 AM - 02:00 PM',
];

export const AddDoctorModal: React.FC<AddDoctorModalProps> = ({
  isOpen,
  onClose,
  onAddDoctor,
}) => {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState(SPECIALTY_OPTIONS[0]);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [workingHours, setWorkingHours] = useState('Mon - Fri, 09:00 AM - 05:00 PM');
  const [room, setRoom] = useState('Suite 101 - Operatory A');
  const [status, setStatus] = useState<'available' | 'busy' | 'on_leave'>('available');
  const [avatar, setAvatar] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const finalSpecialty =
      specialization === 'Custom / Other' && customSpecialty.trim()
        ? customSpecialty.trim()
        : specialization;

    const formattedName = name.trim().toLowerCase().startsWith('dr.')
      ? name.trim()
      : `Dr. ${name.trim()}`;

    const newDoctor: Doctor = {
      id: `doc-${Date.now()}`,
      name: formattedName,
      specialization: finalSpecialty,
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 000-0000',
      workingHours: workingHours.trim() || 'Mon - Fri, 09:00 AM - 05:00 PM',
      room: room.trim() || undefined,
      status,
      activeAppointments: 0,
      avatar:
        avatar.trim() ||
        `https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400`,
      rating: 5.0,
    };

    onAddDoctor(newDoctor);

    // Reset Form
    setName('');
    setSpecialization(SPECIALTY_OPTIONS[0]);
    setCustomSpecialty('');
    setEmail('');
    setPhone('');
    setWorkingHours('Mon - Fri, 09:00 AM - 05:00 PM');
    setRoom('Suite 101 - Operatory A');
    setStatus('available');
    setAvatar('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-[95vw] sm:w-full p-4 sm:p-6 bg-white max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-teal-deep">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-teal-deep" />
            </div>
            <DialogTitle className="text-xl font-bold text-ink">
              Add New Doctor / Provider
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-ink-soft">
            Register a dental specialist or clinician into the clinic system to assign consultations and manage schedules.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Doctor Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                Doctor Full Name *
              </label>
              <Input
                required
                placeholder="e.g. Sarah Jenkins, DDS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Initial Status</label>
              <Select
                value={status}
                onValueChange={(val: 'available' | 'busy' | 'on_leave') => setStatus(val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">In Session (Busy)</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Specialty */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-mint-deep" />
              Specialization / Clinical Focus *
            </label>
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select specialty" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTY_OPTIONS.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {specialization === 'Custom / Other' && (
              <Input
                required
                placeholder="Type custom specialty (e.g. Maxillofacial Prosthodontics)"
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                className="text-xs h-9 mt-2"
              />
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Clinic Email Address *</label>
              <Input
                required
                type="email"
                placeholder="e.g. s.jenkins@cedarviewdental.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Phone / Direct Extension</label>
              <Input
                placeholder="e.g. +1 (555) 234-8901"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Room / Operatory */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink">Room / Clinic Operatory</label>
            <Input
              placeholder="e.g. Suite 302 - Operatory A"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Working Hours & Quick Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-mint-deep" />
                Working Hours & Shift Schedule
              </label>
              <span className="text-[10px] text-ink-soft">Editable</span>
            </div>
            <Input
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              className="text-xs h-9"
              placeholder="e.g. Mon - Fri, 09:00 AM - 05:00 PM"
            />

            {/* Quick hour chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_HOURS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWorkingHours(preset)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    workingHours === preset
                      ? 'bg-teal-50 border-teal-300 text-teal-deep font-semibold'
                      : 'bg-paper border-line text-ink-soft hover:border-mint-deep hover:text-ink'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Avatar URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-mint-deep" />
              Avatar / Profile Photo URL (Optional)
            </label>
            <Input
              type="url"
              placeholder="https://example.com/photo.jpg (leave blank for default avatar)"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-line flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-deep text-white hover:bg-teal-mid text-xs h-9 shadow-xs cursor-pointer gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Save & Register Doctor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
