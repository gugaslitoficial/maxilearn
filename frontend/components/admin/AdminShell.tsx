"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, Users, BookOpen, BarChart3, Tag, Layers, Settings, ClipboardList } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import type { NavItem } from "@/components/shared/AppShell";
import { useAuth, deriveAppUser, deriveRoleBadge } from "@/lib/auth-context";

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { key: "usuarios", label: "Usuários", href: "/usuarios", Icon: Users },
  { key: "cursos", label: "Cursos", href: "/cursos", Icon: BookOpen },
  { key: "quizzes", label: "Quizzes", href: "/quizzes", Icon: ClipboardList },
  { key: "relatorios", label: "Relatórios", href: "/relatorios", Icon: BarChart3 },
  { key: "planos", label: "Planos", href: "/planos", Icon: Tag },
  { key: "identidade-visual", label: "Identidade Visual", href: "/identidade-visual", Icon: Layers },
  { key: "configuracoes", label: "Configurações", href: "/configuracoes", Icon: Settings },
];

const LOADING_USER = {
  initials: "…",
  gradient: "linear-gradient(135deg,#CC1F1F,#e85a4f)",
  name: "",
  email: "",
};

const LOADING_ROLE = {
  label: "Admin",
  color: "#CC1F1F",
  bg: "#fceeee",
  border: "1px solid #f6d6d6",
};

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  const appUser = user ? deriveAppUser(user) : LOADING_USER;
  const role = user ? deriveRoleBadge(user.role) : LOADING_ROLE;

  return (
    <AppShell navItems={NAV} user={appUser} role={role} sectionLabel="Menu" onLogout={logout}>
      {children}
    </AppShell>
  );
}
