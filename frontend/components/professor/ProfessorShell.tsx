"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, BookOpen, Users, ClipboardList } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import type { NavItem } from "@/components/shared/AppShell";
import { useAuth, deriveAppUser, deriveRoleBadge } from "@/lib/auth-context";
import { usePendingEnrollments } from "@/hooks/use-enrollments";

const LOADING_USER = {
  initials: "…",
  gradient: "linear-gradient(135deg,#3a6ea5,#5b9bd5)",
  name: "",
  email: "",
};

const LOADING_ROLE = {
  label: "Professor",
  color: "#b9842f",
  bg: "#fdf3e2",
  border: "1px solid #f3e1bf",
};

export function ProfessorShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { data: pending } = usePendingEnrollments({ enabled: !!user });

  const appUser = user ? deriveAppUser(user) : LOADING_USER;
  const role = user ? deriveRoleBadge(user.role) : LOADING_ROLE;

  const NAV: NavItem[] = [
    { key: "dashboard", label: "Dashboard", href: "/professor/dashboard", Icon: LayoutDashboard },
    { key: "cursos", label: "Meus Cursos", href: "/professor/cursos", Icon: BookOpen },
    {
      key: "alunos",
      label: "Alunos",
      href: "/professor/alunos/liberar",
      Icon: Users,
      badge: pending?.total ?? 0,
    },
    { key: "quizzes", label: "Quizzes", href: "/professor/quizzes", Icon: ClipboardList },
  ];

  return (
    <AppShell navItems={NAV} user={appUser} role={role} sectionLabel="Professor" onLogout={logout}>
      {children}
    </AppShell>
  );
}
