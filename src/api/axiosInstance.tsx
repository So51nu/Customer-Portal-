import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from "axios";

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Simple auth utils
const getAuthState = () => {
  const authState = localStorage.getItem("authState");
  return authState ? JSON.parse(authState) : null;
};

const setAuthState = (data: any) => {
  localStorage.setItem("authState", JSON.stringify(data));
};

export const IMAGE_BASE_URL="https://ps.myciti.life"
// Refresh token function
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch("https://ps.myciti.life/api/refresh/", {
      method: "POST",
      credentials: "include", // to send HttpOnly refresh cookie
    });
    if (!response.ok) return null;

    const data = await response.json();
    setAuthState({ ...getAuthState(), access_token: data.access_token });
    return data.access_token;
  } catch {
    return null;
  }
};

// Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://ps.myciti.life/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials:true,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const authState = getAuthState();
    if (authState?.access_token && config.headers) {
      config.headers.Authorization = `Bearer ${authState.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto refresh token
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest;

    // Retry once
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response.data?.detail === "Token expired."
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      }

      localStorage.removeItem("authState");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;