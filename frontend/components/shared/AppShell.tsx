"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode, ComponentType } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { NotificationsDropdown } from "@/components/ui/NotificationsDropdown";

const PRIMARY = "#CC1F1F";

export interface NavItem {
  key: string;
  label: string;
  href: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  badge?: number;
}

export interface AppUser {
  initials: string;
  gradient: string;
  name: string;
  email: string;
}

export interface RoleBadge {
  label: string;
  color: string;
  bg: string;
  border: string;
}

interface SidebarContentProps {
  navItems: NavItem[];
  user: AppUser;
  role: RoleBadge;
  sectionLabel: string;
  pathname: string;
  onClose?: () => void;
  onLogout?: () => void;
}

function SidebarContent({ navItems, user, role, sectionLabel, pathname, onClose, onLogout }: SidebarContentProps) {
  const active = navItems.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.key ?? navItems[0]?.key;

  return (
    <div
      style={{
        width: 248,
        background: "#fff",
        borderRight: "1px solid #ece4e4",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px", borderBottom: "1px solid #f4eded" }}>
        <Link
          href="/"
          onClick={onClose}
          style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: PRIMARY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(204,31,31,0.28)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 13,
                height: 13,
                border: "3px solid #fff",
                borderRadius: "50%",
                borderRightColor: "transparent",
                transform: "rotate(-45deg)",
              }}
            />
          </div>
          <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: "#1a1414" }}>
            Maxi<span style={{ color: PRIMARY }}>Learn</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "#6a605e", display: "flex", padding: 4 }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#b3a6a6",
            padding: "8px 12px 6px",
          }}
        >
          {sectionLabel}
        </div>
        {navItems.map(({ key, label, href, Icon, badge }) => {
          const isActive = active === key;
          return (
            <Link
              key={key}
              href={href}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: isActive ? 700 : 600,
                textDecoration: "none",
                color: isActive ? PRIMARY : "#6a605e",
                background: isActive ? "#fceeee" : "transparent",
                transition: "background .15s, color .15s",
              }}
            >
              <Icon size={18} color={isActive ? PRIMARY : "#8a807e"} />
              {label}
              {typeof badge === "number" && badge > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#fff",
                    background: PRIMARY,
                    padding: "2px 7px",
                    borderRadius: 100,
                    flexShrink: 0,
                  }}
                >
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: "1px solid #f4eded", display: "flex", alignItems: "center" }}>
        <Link
          href="/perfil"
          onClick={onClose}
          style={{
            flex: 1,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 11,
            textDecoration: "none",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: user.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "#16100f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name || "…"}
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#8a807e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </div>
          </div>
          <span
            style={{
              flexShrink: 0,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: role.color,
              background: role.bg,
              border: role.border,
              padding: "3px 8px",
              borderRadius: 100,
            }}
          >
            {role.label}
          </span>
        </Link>

        {onLogout && (
          <button
            onClick={() => { onClose?.(); onLogout(); }}
            title="Sair"
            style={{
              flexShrink: 0,
              width: 42,
              height: 42,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a89e9c",
              marginRight: 6,
              borderRadius: 9,
              transition: "color .15s, background .15s",
            }}
            className="hover:text-[#CC1F1F] hover:bg-[#fceeee]"
          >
            <LogOut size={17} />
          </button>
        )}
      </div>
    </div>
  );
}

interface AppShellProps {
  navItems: NavItem[];
  user: AppUser;
  role: RoleBadge;
  sectionLabel: string;
  children: ReactNode;
  onLogout?: () => void;
}

export function AppShell({ navItems, user, role, sectionLabel, children, onLogout }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6f4f3" }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <SidebarContent navItems={navItems} user={user} role={role} sectionLabel={sectionLabel} pathname={pathname} onLogout={onLogout} />
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,10,10,0.45)",
            backdropFilter: "blur(2px)",
            zIndex: 40,
          }}
          onClick={() => setDrawerOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 248, height: "100%" }}>
            <SidebarContent navItems={navItems} user={user} role={role} sectionLabel={sectionLabel} pathname={pathname} onClose={() => setDrawerOpen(false)} onLogout={onLogout} />
          </div>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Global topbar */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #ece4e4",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
            zIndex: 20,
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden"
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              border: "1px solid #ece4e4",
              background: "#f6f1f1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6a605e",
              flexShrink: 0,
            }}
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="lg:hidden" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 10, height: 10, border: "2.5px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: "#1a1414" }}>
              Maxi<span style={{ color: PRIMARY }}>Learn</span>
            </span>
          </Link>
          <div style={{ flex: 1 }} />
          <NotificationsDropdown />
        </div>

        {children}
      </main>
    </div>
  );
}
