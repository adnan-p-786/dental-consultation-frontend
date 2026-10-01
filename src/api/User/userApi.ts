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
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  data?: any;
  message?: string;
  error?: string;
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
};

export const authApi = userApi;
export default userApi;
