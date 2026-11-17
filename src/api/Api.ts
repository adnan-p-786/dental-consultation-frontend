import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL;
// Use VITE_API_URL if configured; ensure it ends with '/api' if a full origin is passed without it.
// In local development, falls back to '/api' to use Vite's development proxy.
const apiBaseUrl = rawBaseUrl
  ? (rawBaseUrl.endsWith("/api") ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, "")}/api`)
  : "/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject JWT Bearer token into all outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    // Support paths with or without leading '/api'
    if (config.url?.startsWith("/api/")) {
      config.url = config.url.replace(/^\/api/, "");
    }

    const token =
      sessionStorage.getItem("dental_auth_token") ||
      localStorage.getItem("dental_auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for unified error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[API] 401 Unauthorized - authentication required or expired.");
      sessionStorage.removeItem("dental_auth_token");
      sessionStorage.removeItem("dental_auth_user");
      localStorage.removeItem("dental_auth_token");
      localStorage.removeItem("dental_auth_user");
    }
    return Promise.reject(error);
  }
);

export const Api = apiClient;
export default apiClient;
