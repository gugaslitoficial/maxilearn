import { useMemo, useState, useEffect } from "react";
import { usePendingEnrollments } from "./use-enrollments";
import { useCertificates } from "./use-certificates";
import { useAuth } from "./use-auth";

export type NotifType = "aluno" | "cert" | "aula" | "quiz" | "curso" | "plano";

export interface AppNotification {
  id: string;
  type: NotifType;
  text: string;
  time: string;
  createdAt: string;
}

const LS_KEY = "ml_read_notif_ids";

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function persistReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
  } catch {}
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "ontem";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function useNotifications() {
  const { user } = useAuth();
  const role = user?.role;

  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  const isProfessorOrAdmin = role === "PROFESSOR" || role === "ADMIN";
  const isStudent = role === "STUDENT";

  const pendingQ = usePendingEnrollments({ enabled: !!user && isProfessorOrAdmin });
  const certsQ = useCertificates({ enabled: !!user && isStudent });

  const notifications = useMemo<AppNotification[]>(() => {
    const items: AppNotification[] = [];

    if (isProfessorOrAdmin) {
      (pendingQ.data?.data ?? []).forEach((e) => {
        items.push({
          id: `enroll-${e.id}`,
          type: "aluno",
          text: `${e.student.name} solicitou acesso ao curso "${e.course.title}"`,
          time: relativeTime(e.requestedAt),
          createdAt: e.requestedAt,
        });
      });
    }

    if (isStudent) {
      (certsQ.data?.data ?? []).slice(0, 5).forEach((c) => {
        items.push({
          id: `cert-${c.id}`,
          type: "cert",
          text: `Parabéns! Você recebeu o certificado de "${c.courseName}"`,
          time: relativeTime(c.issuedAt),
          createdAt: c.issuedAt,
        });
      });
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [isProfessorOrAdmin, isStudent, pendingQ.data, certsQ.data]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;
  const isLoading = isProfessorOrAdmin ? pendingQ.isLoading : isStudent ? certsQ.isLoading : false;

  function isUnread(id: string) {
    return !readIds.has(id);
  }

  function markAsRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
  }

  function markAllAsRead() {
    const next = new Set(notifications.map((n) => n.id));
    persistReadIds(next);
    setReadIds(next);
  }

  return { notifications, unreadCount, isUnread, markAsRead, markAllAsRead, isLoading };
}
