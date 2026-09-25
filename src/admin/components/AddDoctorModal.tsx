import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  UserPlus,
  Clock,
  Stethoscope,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  X,
  Pencil,
  Trash2,
} from 'lucide-react';
import { DeleteDoctorModal } from './DeleteDoctorModal';
import type { Doctor } from '../types';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDoctor: (doctor: Doctor) => void;
  onUpdateDoctor?: (doctor: Doctor) => void;
  onDeleteDoctor?: (doctorId: string) => void;
  doctorToEdit?: Doctor | null;
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
  onUpdateDoctor,
  onDeleteDoctor,
  doctorToEdit,
}) => {
  const isEditMode = Boolean(doctorToEdit);

  // Schema-aligned form state
  const [doctorName, setDoctorName] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialization, setSpecialization] = useState(SPECIALTY_OPTIONS[0]);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [workingHours, setWorkingHours] = useState('Mon - Fri, 09:00 AM - 05:00 PM');
  const [status, setStatus] = useState<'available' | 'busy' | 'on_leave'>('available');

  // Photo upload state (File via Multer)
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // UI status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setDoctorName('');
    setDoctorEmail('');
    setPhoneNumber('');
    setSpecialization(SPECIALTY_OPTIONS[0]);
    setCustomSpecialty('');
    setWorkingHours('Mon - Fri, 09:00 AM - 05:00 PM');
    setStatus('available');
    if (photoPreview && photoFile) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Populate data when in edit mode
  useEffect(() => {
    if (isOpen) {
      if (doctorToEdit) {
        setDoctorName(doctorToEdit.name.replace(/^Dr\.\s*/i, ''));
        setDoctorEmail(doctorToEdit.email || '');
        setPhoneNumber(doctorToEdit.phone || '');
        if (SPECIALTY_OPTIONS.includes(doctorToEdit.specialization)) {
          setSpecialization(doctorToEdit.specialization);
          setCustomSpecialty('');
        } else {
          setSpecialization('Custom / Other');
          setCustomSpecialty(doctorToEdit.specialization || '');
        }
        setWorkingHours(doctorToEdit.workingHours || 'Mon - Fri, 09:00 AM - 05:00 PM');
        setStatus(doctorToEdit.status || 'available');
        setPhotoFile(null);
        setPhotoPreview(doctorToEdit.avatar || null);
        setErrorMessage(null);
      } else {
        resetForm();
      }
    }
  }, [isOpen, doctorToEdit]);

  const handleModalClose = () => {
    if (isSubmitting || isDeleting) return;
    resetForm();
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be smaller than 5 MB.');
      return;
    }

    if (photoPreview && photoFile) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  const handleRemoveFile = () => {
    if (photoPreview && photoFile) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteConfirm = async (doctorId: string) => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      if (!isNaN(Number(doctorId))) {
        await axios.delete(`/api/doctor/delete-doctor/${doctorId}`);
      }
      if (onDeleteDoctor) {
        onDeleteDoctor(doctorId);
      }
      setIsDeleteConfirmOpen(false);
      handleModalClose();
    } catch (err: any) {
      console.error('Error deleting doctor:', err);
      if (err.response?.status === 404 && onDeleteDoctor) {
        onDeleteDoctor(doctorId);
        setIsDeleteConfirmOpen(false);
        handleModalClose();
        return;
      }
      setErrorMessage(
        err.response?.data?.message || 'Failed to delete doctor. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = doctorName.trim();
    const trimmedEmail = doctorEmail.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedWorkingHours = workingHours.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedWorkingHours) {
      setErrorMessage('Please fill in all required fields marked with *.');
      return;
    }

    const finalSpecialty =
      specialization === 'Custom / Other' && customSpecialty.trim()
        ? customSpecialty.trim()
        : specialization;

    const formattedName = trimmedName.toLowerCase().startsWith('dr.')
      ? trimmedName
      : `Dr. ${trimmedName}`;

    // Prepare multipart form data for Multer
    const formData = new FormData();
    formData.append('doctorName', formattedName);
    formData.append('doctorEmail', trimmedEmail);
    formData.append('phoneNumber', trimmedPhone);
    formData.append('doctorPassword', doctorPassword);
    formData.append('specialization', finalSpecialty);
    formData.append('workingHours', trimmedWorkingHours);
    formData.append('status', status);

    if (photoFile) {
      formData.append('doctorPhoto', photoFile);
    } else if (isEditMode) {
      formData.append('doctorPhoto', photoPreview || '');
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && doctorToEdit) {
        let savedDoctor = null;
        if (!isNaN(Number(doctorToEdit.id))) {
          const response = await axios.put(`/api/doctor/update-doctor/${doctorToEdit.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          if (response.data && response.data.success) {
            savedDoctor = response.data.data;
          }
        }

        const updatedDoctor: Doctor = {
          ...doctorToEdit,
          name: savedDoctor?.doctorName || formattedName,
          specialization: savedDoctor?.specialization || finalSpecialty,
          email: savedDoctor?.doctorEmail || trimmedEmail,
          password: savedDoctor?.doctorPassword || doctorPassword,
          phone: savedDoctor?.phoneNumber || trimmedPhone,
          workingHours: savedDoctor?.workingHours || trimmedWorkingHours,
          status: (savedDoctor?.status as 'available' | 'busy' | 'on_leave') || status,
          avatar:
            savedDoctor?.doctorPhoto !== undefined
              ? savedDoctor.doctorPhoto
              : photoPreview || '',
        };

        if (onUpdateDoctor) {
          onUpdateDoctor(updatedDoctor);
        } else {
          onAddDoctor(updatedDoctor);
        }

        resetForm();
        onClose();
      } else {
        const response = await axios.post('/api/doctor/add-doctor', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data && response.data.success) {
          const savedDoctor = response.data.data;
          const newDoctor: Doctor = {
            id: savedDoctor?.id ? String(savedDoctor.id) : `doc-${Date.now()}`,
            name: savedDoctor?.doctorName || formattedName,
            specialization: savedDoctor?.specialization || finalSpecialty,
            email: savedDoctor?.doctorEmail || trimmedEmail,
            password: savedDoctor?.doctorPassword || doctorPassword,
            phone: savedDoctor?.phoneNumber || trimmedPhone,
            workingHours: savedDoctor?.workingHours || trimmedWorkingHours,
            status: (savedDoctor?.status as 'available' | 'busy' | 'on_leave') || status,
            avatar: savedDoctor?.doctorPhoto || photoPreview || '',
            activeAppointments: 0,
          };

          onAddDoctor(newDoctor);
          resetForm();
          onClose();
        } else {
          setErrorMessage(response.data?.message || 'Failed to save doctor. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Error saving doctor:', err);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (isEditMode
          ? 'Unable to update doctor profile. Please try again.'
          : 'Unable to upload doctor photo or connect to server. Please try again.');
      setErrorMessage(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
      <DialogContent className="max-w-xl w-[95vw] sm:w-full p-4 sm:p-6 bg-white max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-teal-deep">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              {isEditMode ? (
                <Pencil className="w-4 h-4 text-teal-deep" />
              ) : (
                <UserPlus className="w-4 h-4 text-teal-deep" />
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-ink">
              {isEditMode ? 'Edit Doctor' : 'Add Doctor'}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="flex items-start gap-2 p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Doctor Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1">
                Doctor Full Name *
              </label>
              <Input
                required
                disabled={isSubmitting}
                placeholder="e.g. Sarah Jenkins, DDS"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">Status *</label>
              <Select
                disabled={isSubmitting}
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
            <Select
              disabled={isSubmitting}
              value={specialization}
              onValueChange={setSpecialization}
            >
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
                disabled={isSubmitting}
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
              <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-mint-deep" />
                Doctor Email Address *
              </label>
              <Input
                required
                disabled={isSubmitting}
                type="email"
                placeholder="e.g. s.jenkins@32 storiesdental.com"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-mint-deep" />
                Password *
              </label>
              <Input
                required
                disabled={isSubmitting}
                type="password"
                placeholder="e.g. PASSWORD"
                value={doctorPassword}
                onChange={(e) => setDoctorPassword(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-mint-deep" />
                Phone Number *
              </label>
              <Input
                required
                disabled={isSubmitting}
                placeholder="e.g. +1 (555) 234-8901"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Working Hours & Quick Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-mint-deep" />
                Working Hours & Shift Schedule *
              </label>
              <span className="text-[10px] text-ink-soft">Editable</span>
            </div>
            <Input
              required
              disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  onClick={() => setWorkingHours(preset)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer disabled:opacity-50 ${
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

          {/* Photo Upload via Multer */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-mint-deep" />
              Doctor Profile Photo
            </label>

            <div className="flex items-center gap-3">
              {/* Thumbnail Live Preview: only shows image if user uploaded a file or existing doctor photo */}
              <Avatar className="w-12 h-12 border-2 border-line-soft shrink-0 shadow-xs">
                {photoPreview ? (
                  <AvatarImage src={photoPreview} alt="Doctor preview" />
                ) : null}
                <AvatarFallback className="bg-teal-50 text-teal-deep text-xs font-bold">
                  {doctorName.trim().slice(0, 2).toUpperCase() || 'DR'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  disabled={isSubmitting}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="doctor-photo-file"
                />

                {photoFile || (isEditMode && photoPreview) ? (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/50 text-xs">
                    <div className="min-w-0 flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-teal-deep shrink-0" />
                      <span className="font-medium text-teal-deep truncate max-w-45 sm:max-w-60">
                        {photoFile ? photoFile.name : 'Current Profile Photo'}
                      </span>
                      {photoFile && (
                        <span className="text-[10px] text-teal-600 shrink-0">
                          ({(photoFile.size / 1024).toFixed(0)} KB)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={isSubmitting}
                      className="text-ink-soft hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="doctor-photo-file"
                    className="flex items-center justify-center gap-2 border border-dashed border-line-soft hover:border-mint-deep px-3 py-2 rounded-xl text-xs text-ink-soft hover:text-ink bg-paper/60 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-mint-deep" />
                    <span>Upload Image</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-line flex flex-col sm:flex-row gap-2">
            {isEditMode && doctorToEdit && (
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting || isDeleting}
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="text-xs h-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer gap-1.5 sm:mr-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Doctor</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || isDeleting}
              onClick={handleModalClose}
              className="text-xs h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="bg-[#5E3E3B] text-white hover:bg-[#262525] text-xs h-9 shadow-xs cursor-pointer gap-1.5 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {isEditMode ? 'Updating Doctor...' : 'Uploading & Saving...'}
                </>
              ) : isEditMode ? (
                <>
                  <Pencil className="w-3.5 h-3.5" />
                  Save Changes
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  Save & Register Doctor
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Confirmation Modal when deleting from edit view */}
      {isEditMode && doctorToEdit && (
        <DeleteDoctorModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={(doctorId) => handleDeleteConfirm(doctorId)}
          doctor={doctorToEdit}
        />
      )}
    </Dialog>
  );
};
