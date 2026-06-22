"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, Users, BookOpen, BarChart3, Tag, Layers, Settings } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import type { NavItem, AppUser, RoleBadge } from "@/components/shared/AppShell";

const NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { key: "usuarios", label: "Usuários", href: "/usuarios", Icon: Users },
  { key: "cursos", label: "Cursos", href: "/cursos", Icon: BookOpen },
  { key: "relatorios", label: "Relatórios", href: "/relatorios", Icon: BarChart3 },
  { key: "planos", label: "Planos", href: "/planos", Icon: Tag },
  { key: "identidade-visual", label: "Identidade Visual", href: "/identidade-visual", Icon: Layers },
  { key: "configuracoes", label: "Configurações", href: "/configuracoes", Icon: Settings },
];

const USER: AppUser = {
  initials: "CM",
  gradient: "linear-gradient(135deg,#CC1F1F,#e85a4f)",
  name: "Carlos Mendes",
  email: "carlos@maxi1.com.br",
};

const ROLE: RoleBadge = {
  label: "Admin",
  color: "#CC1F1F",
  bg: "#fceeee",
  border: "1px solid #f6d6d6",
};

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AppShell navItems={NAV} user={USER} role={ROLE} sectionLabel="Menu">
      {children}
    </AppShell>
  );
}
