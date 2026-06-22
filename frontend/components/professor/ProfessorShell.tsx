"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, BookOpen, Users, ClipboardList } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import type { NavItem, AppUser, RoleBadge } from "@/components/shared/AppShell";

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/professor/dashboard", Icon: LayoutDashboard },
  { key: "cursos", label: "Meus Cursos", href: "/professor/cursos", Icon: BookOpen },
  { key: "alunos", label: "Alunos", href: "/professor/alunos/liberar", Icon: Users },
  { key: "quizzes", label: "Quizzes", href: "/professor/quizzes", Icon: ClipboardList },
];

const USER: AppUser = {
  initials: "RP",
  gradient: "linear-gradient(135deg,#3a6ea5,#5b9bd5)",
  name: "Ricardo Paz",
  email: "ricardo@maxi1.com.br",
};

const ROLE: RoleBadge = {
  label: "Professor",
  color: "#b9842f",
  bg: "#fdf3e2",
  border: "1px solid #f3e1bf",
};

export function ProfessorShell({ children }: { children: ReactNode }) {
  return (
    <AppShell navItems={NAV} user={USER} role={ROLE} sectionLabel="Professor">
      {children}
    </AppShell>
  );
}
