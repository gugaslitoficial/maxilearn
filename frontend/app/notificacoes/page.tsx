"use client";

import { useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/hooks/use-notifications";
import type { NotifType } from "@/hooks/use-notifications";

const PRIMARY = "#CC1F1F";

const TYPES: Record<NotifType, { color: string; bg: string; label: string; paths: string[] }> = {
  aluno: { color: "#3a6ea5", bg: "#e9f0f8", label: "Novo aluno",    paths: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0 0.01", "M19 8v6", "M22 11h-6"] },
  aula:  { color: "#1f8a5b", bg: "#e8f5ee", label: "Aula concluída",paths: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4 12 14.01l-3-3"] },
  quiz:  { color: "#7a4fb9", bg: "#f1ebf8", label: "Quiz",          paths: ["M9 11l3 3L22 4", "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"] },
  cert:  { color: "#b9842f", bg: "#fdf3e2", label: "Certificado",   paths: ["M12 8a6 6 0 1 0 0 .01", "M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"] },
  curso: { color: "#CC1F1F", bg: "#fceeee", label: "Novo curso",    paths: ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"] },
  plano: { color: "#d9821f", bg: "#fdf6e9", label: "Plano",         paths: ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"] },
};

type FilterKey = "todas" | "naolidas";

export default function NotificacoesPage() {
  const { notifications, unreadCount, isUnread, markAllAsRead, isLoading } = useNotifications();
  const [filter, setFilter] = useState<FilterKey>("todas");

  const filtered = filter === "naolidas"
    ? notifications.filter((n) => isUnread(n.id))
    : notifications;

  const isEmpty = filtered.length === 0;

  const FILTER_OPTS: { key: FilterKey; label: string }[] = [
    { key: "todas",    label: "Todas" },
    { key: "naolidas", label: "Não lidas" },
  ];

  return (
    <div style={{ fontFamily: "Manrope, system-ui, sans-serif", color: "#16100f", minHeight: "100vh", background: "#f6f4f3" }}>
      <style>{`@media(max-width:520px){.notif-filters{flex-direction:column; align-items:stretch;} .notif-filters select{display:block!important;} .notif-filters-row{display:none!important;}}`}</style>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 720 }}>

          {/* Page header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <Link href="javascript:history.back()" style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid #e2d9d9", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6a605e", textDecoration: "none" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Notificações</h1>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#8a807e", paddingLeft: 42 }}>
                {isLoading ? "Carregando..." : `${unreadCount} não lida${unreadCount !== 1 ? "s" : ""} de ${notifications.length}`}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                type="button"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6a605e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Filters — desktop row */}
          <div className="notif-filters-row" style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
            {FILTER_OPTS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                type="button"
                style={{
                  fontFamily: "inherit",
                  fontSize: 13.5,
                  fontWeight: filter === f.key ? 800 : 700,
                  color: filter === f.key ? "#fff" : "#6a605e",
                  background: filter === f.key ? PRIMARY : "#fff",
                  border: `1.5px solid ${filter === f.key ? PRIMARY : "#e6dede"}`,
                  borderRadius: 100,
                  padding: "8px 18px",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Filters — mobile select */}
          <div className="notif-filters" style={{ display: "none", marginBottom: 22 }}>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as FilterKey)}
              style={{ width: "100%", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: "12px 14px", outline: "none", cursor: "pointer" }}
            >
              {FILTER_OPTS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </div>

          {/* Loading */}
          {isLoading && (
            <div style={{ textAlign: "center", padding: "48px 0", fontSize: 14, fontWeight: 600, color: "#a89e9c" }}>
              Carregando notificações…
            </div>
          )}

          {/* List */}
          {!isLoading && !isEmpty && (
            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
              {filtered.map((n, idx) => {
                const t = TYPES[n.type];
                const unread = isUnread(n.id);
                return (
                  <div
                    key={n.id}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      padding: "16px 18px",
                      borderBottom: idx < filtered.length - 1 ? "1px solid #f6f1f1" : "none",
                      background: unread ? "#fdfaf9" : "#fff",
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {t.paths.map((d, i) => <path key={i} d={d} />)}
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, lineHeight: 1.45, fontWeight: unread ? 700 : 500, color: "#16100f" }}>{n.text}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.02em", color: t.color, background: t.bg, padding: "2px 8px", borderRadius: 100 }}>
                          {t.label}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#a89e9c" }}>{n.time}</span>
                      </div>
                    </div>
                    {unread && (
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: PRIMARY, flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && isEmpty && (
            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 18, padding: "64px 32px", textAlign: "center" }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4 12 14.01l-3-3" />
                </svg>
              </div>
              <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Você está em dia com tudo!</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, fontWeight: 500, color: "#8a807e", marginTop: 8, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
                {filter === "naolidas" ? "Nenhuma notificação não lida." : "Nenhuma notificação por aqui."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
