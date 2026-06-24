"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { authApi, setApiToken } from "@/lib/api";
import type { BackendUser, RegisterPayload } from "@/lib/api";
import type { AppUser, RoleBadge } from "@/components/shared/AppShell";

export type { BackendUser as AuthUser };

// ─── Derivation helpers (used by shells) ─────────────────────────────────────

export function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function deriveGradient(role: BackendUser["role"]): string {
  switch (role) {
    case "ADMIN": return "linear-gradient(135deg,#CC1F1F,#e85a4f)";
    case "PROFESSOR": return "linear-gradient(135deg,#3a6ea5,#5b9bd5)";
    case "STUDENT": return "linear-gradient(135deg,#1f8a5b,#43b787)";
  }
}

export function deriveRoleBadge(role: BackendUser["role"]): RoleBadge {
  switch (role) {
    case "ADMIN":
      return { label: "Admin", color: "#CC1F1F", bg: "#fceeee", border: "1px solid #f6d6d6" };
    case "PROFESSOR":
      return { label: "Professor", color: "#b9842f", bg: "#fdf3e2", border: "1px solid #f3e1bf" };
    case "STUDENT":
      return { label: "Estudante", color: "#1f8a5b", bg: "#e8f5ee", border: "1px solid #cbe8d8" };
  }
}

export function deriveAppUser(user: BackendUser): AppUser {
  return {
    initials: deriveInitials(user.name),
    gradient: deriveGradient(user.role),
    name: user.name,
    email: user.email,
  };
}

// ─── Role routing map ─────────────────────────────────────────────────────────

export const ROLE_HOME: Record<BackendUser["role"], string> = {
  ADMIN: "/dashboard",
  PROFESSOR: "/professor/dashboard",
  STUDENT: "/aluno/dashboard",
};

// ─── Context ─────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: BackendUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Cookie helpers (via Next.js API routes) ─────────────────────────────────

async function persistToken(token: string): Promise<void> {
  await fetch("/api/auth/set-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

async function revokeToken(): Promise<void> {
  await fetch("/api/auth/clear-token", { method: "POST" });
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session from httpOnly cookie on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;

        const { accessToken } = (await res.json()) as {
          userId: string;
          role: string;
          companyId: string;
          accessToken: string;
        };

        setApiToken(accessToken);
        const { data } = await authApi.me();
        setUser(data);
      } catch {
        // No valid session — stay unauthenticated
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await authApi.login(email, password);
      await persistToken(data.accessToken);
      setApiToken(data.accessToken);
      setUser(data.user);
      router.push(ROLE_HOME[data.user.role]);
    },
    [router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { data } = await authApi.register(payload);
      await persistToken(data.accessToken);
      setApiToken(data.accessToken);
      setUser(data.user);
      router.push(ROLE_HOME[data.user.role]);
    },
    [router]
  );

  const logout = useCallback(async () => {
    await revokeToken();
    setApiToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
