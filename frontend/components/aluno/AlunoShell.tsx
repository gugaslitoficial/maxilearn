"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, BookOpen, Compass, Award, User } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import type { NavItem } from "@/components/shared/AppShell";
import { useAuth, deriveAppUser, deriveRoleBadge } from "@/lib/auth-context";
import { useBranding } from "@/hooks/use-branding";

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/aluno/dashboard", Icon: LayoutDashboard },
  { key: "meus-cursos", label: "Meus Cursos", href: "/aluno/meus-cursos", Icon: BookOpen },
  { key: "explorar", label: "Explorar", href: "/aluno/explorar", Icon: Compass },
  { key: "certificados", label: "Certificados", href: "/aluno/certificados", Icon: Award },
  { key: "perfil", label: "Perfil", href: "/aluno/perfil", Icon: User },
];

const LOADING_USER = {
  initials: "…",
  gradient: "linear-gradient(135deg,#1f8a5b,#43b787)",
  name: "",
  email: "",
};

const LOADING_ROLE = {
  label: "Estudante",
  color: "#1f8a5b",
  bg: "#e8f5ee",
  border: "1px solid #cbe8d8",
};

export function AlunoShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  useBranding();

  const appUser = user ? deriveAppUser(user) : LOADING_USER;
  const role = user ? deriveRoleBadge(user.role) : LOADING_ROLE;

  return (
    <AppShell navItems={NAV} user={appUser} role={role} sectionLabel="Estudante" onLogout={logout}>
      {children}
    </AppShell>
  );
}
