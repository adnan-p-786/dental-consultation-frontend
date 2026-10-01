import { apiClient } from "../Api";
import type { Doctor } from "@/admin/types";

export interface DoctorDbRecord {
  id: number | string;
  doctorName?: string;
  name?: string;
  doctorEmail?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  specialization?: string;
  workingHours?: string;
  status?: "available" | "busy" | "on_leave";
  doctorPhoto?: string;
  avatar?: string;
  room?: string;
  rating?: number;
}

export const doctorApi = {
  /**
   * Fetch all doctors from both the dedicated doctor table and user table
   */
  async getAll(): Promise<Doctor[]> {
    const fetchedDoctors: Doctor[] = [];

    // 1. Fetch from doctor table
    try {
      const docRes = await apiClient.get<{ success: boolean; data: any[] }>("/doctor/get-doctors");
      if (docRes.data?.success && Array.isArray(docRes.data.data)) {
        const tableDoctors: Doctor[] = docRes.data.data.map((d: any) => ({
          id: String(d.id),
          name: d.doctorName || d.name || "Doctor",
          avatar: d.doctorPhoto || d.avatar || "",
          specialization: d.specialization || "General Dentistry",
          email: d.doctorEmail || d.email || "",
          phone: d.phoneNumber || d.phone || "",
          workingHours: d.workingHours || "09:00 AM - 05:00 PM",
          status: (d.status as "available" | "busy" | "on_leave") || "available",
          activeAppointments: 0,
          room: d.room || "Room 1",
          rating: d.rating ? Number(d.rating) : 4.9,
        }));
        fetchedDoctors.push(...tableDoctors);
      }
    } catch (e) {
      console.error("Failed to fetch doctor table records:", e);
    }

    // 2. Fetch from users table (role=doctor)
    try {
      const userRes = await apiClient.get<{ success: boolean; data: any[] }>("/users/doctors");
      if (userRes.data?.success && Array.isArray(userRes.data.data)) {
        const apiDoctors: Doctor[] = userRes.data.data.map((u: any) => {
          const fullName = `Dr. ${u.firstName ? u.firstName.charAt(0).toUpperCase() + u.firstName.slice(1) : ""} ${
            u.lastName ? u.lastName.toUpperCase() : ""
          }`.trim();
          return {
            id: `user-${u.id}`,
            name: fullName || "Dr. Staff",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.firstName || "doc"}`,
            specialization: "General Dental Consultation & Surgery",
            email: u.email,
            phone: u.phoneNumber || "+1 (555) 234-CARE",
            workingHours: "08:00 AM - 05:00 PM",
            status: "available" as const,
            activeAppointments: 0,
            room: "Room 2",
            rating: 4.8,
          };
        });

        // Deduplicate against doctors with the same email
        for (const doc of apiDoctors) {
          if (!fetchedDoctors.some((existing) => existing.email.toLowerCase() === doc.email.toLowerCase())) {
            fetchedDoctors.push(doc);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch user doctors:", e);
    }

    // Cache to localStorage for offline / quick reference
    try {
      localStorage.setItem("dental_doctors_v1", JSON.stringify(fetchedDoctors));
    } catch (e) {}

    return fetchedDoctors;
  },

  async addDoctor(data: FormData | Partial<DoctorDbRecord>): Promise<any> {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const res = await apiClient.post("/doctor/add-doctor", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data;
  },

  async updateDoctor(id: string | number, data: FormData | Partial<DoctorDbRecord>): Promise<any> {
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const res = await apiClient.put(`/doctor/update-doctor/${id}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data;
  },

  async updateStatus(id: string | number, status: "available" | "busy" | "on_leave"): Promise<any> {
    const res = await apiClient.patch(`/doctor/${id}/status`, { status });
    return res.data;
  },

  async deleteDoctor(id: string | number): Promise<any> {
    const res = await apiClient.delete(`/doctor/${id}`);
    return res.data;
  },
};

export const doctorsApi = doctorApi;
export default doctorApi;
