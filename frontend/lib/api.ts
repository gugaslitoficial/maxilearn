import axios from "axios";
import type { AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const api = axios.create({ baseURL: BASE_URL });

let inMemoryToken: string | null = null;

export function setApiToken(token: string | null): void {
  inMemoryToken = token;
}

api.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const is401 = error.response?.status === 401;
    const alreadyOnLogin =
      typeof window !== "undefined" && window.location.pathname === "/login";
    // Only redirect if a token existed in memory (real session expiry), not
    // during the async session-restore window where inMemoryToken is still null.
    if (is401 && !alreadyOnLogin && inMemoryToken !== null) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROFESSOR" | "STUDENT";
  companyId: string;
  avatarUrl: string | null;
}

export interface LoginResponse {
  user: BackendUser;
  accessToken: string;
}

export interface RegisterResponse {
  user: BackendUser;
  company: { id: string; name: string };
  accessToken: string;
}

export interface RegisterPayload {
  companyName: string;
  companyCnpj?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login(email: string, password: string) {
    return api.post<LoginResponse>("/auth/login", { email, password });
  },
  register(payload: RegisterPayload) {
    return api.post<RegisterResponse>("/auth/register", payload);
  },
  me() {
    return api.get<BackendUser>("/users/me");
  },
};
