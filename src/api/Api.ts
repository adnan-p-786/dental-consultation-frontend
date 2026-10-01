import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
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

    const token = localStorage.getItem("dental_auth_token");
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
    }
    return Promise.reject(error);
  }
);

export const Api = apiClient;
export default apiClient;
