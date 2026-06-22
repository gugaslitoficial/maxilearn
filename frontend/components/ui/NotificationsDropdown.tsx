"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MOCK_NOTIFICATIONS, type MockNotification, type NotifType } from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";

const TYPES: Record<NotifType, { color: string; bg: string; label: string; paths: string[] }> = {
  aluno: { color: "#3a6ea5", bg: "#e9f0f8", label: "Novo aluno",    paths: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0 0.01", "M19 8v6", "M22 11h-6"] },
  aula:  { color: "#1f8a5b", bg: "#e8f5ee", label: "Aula concluída",paths: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4 12 14.01l-3-3"] },
  quiz:  { color: "#7a4fb9", bg: "#f1ebf8", label: "Quiz",          paths: ["M9 11l3 3L22 4", "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"] },
  cert:  { color: "#b9842f", bg: "#fdf3e2", label: "Certificado",   paths: ["M12 8a6 6 0 1 0 0 .01", "M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"] },
  curso: { color: "#CC1F1F", bg: "#fceeee", label: "Novo curso",    paths: ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"] },
  plano: { color: "#d9821f", bg: "#fdf6e9", label: "Plano",         paths: ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"] },
};

function NotifIcon({ type, size = 19 }: { type: NotifType; size?: number }) {
  const t = TYPES[type];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {t.paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Record<number, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);

  const isUnread = (n: MockNotification) => readIds[n.id] ? false : !n.readDefault;
  const unread = MOCK_NOTIFICATIONS.filter(isUnread).length;
  const latest = MOCK_NOTIFICATIONS.slice(0, 5);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <style>{`@keyframes ml-dropin{from{transform:translateY(-8px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      <button
        onClick={() => setOpen(v => !v)}
        type="button"
        aria-label="Notificações"
        style={{
          position: "relative",
          width: 42,
          height: 42,
          borderRadius: 11,
          background: "#f6f1f1",
          border: "1px solid #ece4e4",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6a605e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 9,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 100,
              background: PRIMARY,
              border: "1.5px solid #fff",
              color: "#fff",
              fontSize: 9.5,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Manrope, system-ui, sans-serif",
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 52,
            right: 0,
            width: 360,
            background: "#fff",
            border: "1px solid #ece4e4",
            borderRadius: 16,
            boxShadow: "0 24px 56px rgba(60,20,20,0.18)",
            overflow: "hidden",
            animation: "ml-dropin .18s ease",
            zIndex: 50,
          }}
        >
          <div style={{ padding: "16px 18px", borderBottom: "1px solid #f4eded", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>Notificações</span>
            {unread > 0 && (
              <span style={{ fontSize: 11.5, fontWeight: 800, color: PRIMARY, background: "#fceeee", padding: "3px 9px", borderRadius: 100 }}>
                {unread} novas
              </span>
            )}
          </div>

          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {latest.map((n) => {
              const t = TYPES[n.type];
              const unreadItem = isUnread(n);
              return (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "13px 18px",
                    borderBottom: "1px solid #f6f1f1",
                    background: unreadItem ? "#fdf9f9" : "#fff",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      flexShrink: 0,
                      background: t.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <NotifIcon type={n.type} size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.4, fontWeight: 600, color: "#3a3030" }}>{n.text}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "#a89e9c", marginTop: 2 }}>{n.time}</div>
                  </div>
                  {unreadItem && (
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: PRIMARY, flexShrink: 0, marginTop: 5 }} />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ padding: "12px 18px", borderTop: "1px solid #f4eded" }}>
            <Link
              href="/notificacoes"
              onClick={() => setOpen(false)}
              style={{ display: "block", textAlign: "center", fontSize: 13.5, fontWeight: 700, color: PRIMARY, textDecoration: "none" }}
            >
              Ver todas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
