import { apiClient } from "../Api";

export interface LoginPayload {
  email: string;
  password: string;
  role?: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role?: string;
  age?: number;
  gender?: string;
  address?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  data?: any;
  message?: string;
  error?: string;
}

export interface PatientRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  age: number | null;
  gender: string | null;
  address: string | null;
  createdAt: string;
}

export const userApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/users/login", payload);
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/users/register", payload);
    return res.data;
  },

  async getMe(): Promise<any> {
    const res = await apiClient.get("/users/me");
    return res.data;
  },

  async getPatients(): Promise<PatientRecord[]> {
    const res = await apiClient.get<{ success: boolean; data: PatientRecord[] }>("/users/patients");
    return res.data.data;
  },

  async deletePatient(id: number): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/users/patients/${id}`);
    return res.data;
  },
};

export const authApi = userApi;
export default userApi;
