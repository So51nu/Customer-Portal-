import { AxiosError } from "axios";
import axiosInstance from "../api/axiosInstance"; // adjust path if needed

// ---------------- Interfaces ----------------
export interface TenantInfo {
  username: string;
  client_id?: number;
  client_username?: string;
  alias?: string;
}

export interface AuthState {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  tenant_info?: TenantInfo;
  
  role?: string;  // <-- Add role here
}

// ---------------- Utilities ----------------
export function getAuthState(): AuthState | null {
  const raw = localStorage.getItem("authState");
  return raw ? JSON.parse(raw) : null;
}

export function saveAuthState(authState: AuthState | null): void {
  if (authState) {
    localStorage.setItem("authState", JSON.stringify(authState));
    localStorage.setItem("access_token", authState.access_token);
    localStorage.setItem("refresh_token", authState.refresh_token);



    if (authState.role) {
      localStorage.setItem("role", authState.role); // <-- store role globally
    }



    if (authState.tenant_info?.alias) {
      localStorage.setItem("tenant_alias", authState.tenant_info.alias);
    }
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  const authState = getAuthState();
  if (!authState?.refresh_token) return null;

  try {
    const response = await axiosInstance.post("/token/refresh/", {
      refresh: authState.refresh_token,
    });

    const { access, refresh } = response.data;
    const newAuthState: AuthState = {
      ...authState,
      access_token: access,
      refresh_token: refresh ?? authState.refresh_token,
    };

    saveAuthState(newAuthState);
    return access;
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error("Token refresh failed:", error.message);

    localStorage.removeItem("authState");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");


    localStorage.removeItem("role"); // <-- added cleanup for role


    return null;
  }
}

export function parseError(err: unknown): string {
  const error = err as AxiosError;

  const data = error.response?.data;
  const detail =
    typeof data === "object" && data !== null && "detail" in data
      ? (data as { detail?: string }).detail
      : undefined;

  return detail || error.message || "Request failed";
}