"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, BookOpen, Compass, Award, User } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import type { NavItem, AppUser, RoleBadge } from "@/components/shared/AppShell";

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/aluno/dashboard", Icon: LayoutDashboard },
  { key: "meus-cursos", label: "Meus Cursos", href: "/aluno/meus-cursos", Icon: BookOpen },
  { key: "explorar", label: "Explorar", href: "/aluno/explorar", Icon: Compass },
  { key: "certificados", label: "Certificados", href: "/aluno/certificados", Icon: Award },
  { key: "perfil", label: "Perfil", href: "/aluno/perfil", Icon: User },
];

const USER: AppUser = {
  initials: "AL",
  gradient: "linear-gradient(135deg,#1f8a5b,#43b787)",
  name: "Ana Lima",
  email: "ana.lima@maxi1.com.br",
};

const ROLE: RoleBadge = {
  label: "Estudante",
  color: "#1f8a5b",
  bg: "#e8f5ee",
  border: "1px solid #cbe8d8",
};

export function AlunoShell({ children }: { children: ReactNode }) {
  return (
    <AppShell navItems={NAV} user={USER} role={ROLE} sectionLabel="Estudante">
      {children}
    </AppShell>
  );
}
