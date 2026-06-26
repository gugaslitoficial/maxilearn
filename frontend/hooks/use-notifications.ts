import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePendingEnrollments } from "./use-enrollments";
import { useCertificates } from "./use-certificates";
import { useAuth } from "./use-auth";
import { api } from "@/lib/api";

export type NotifType = "aluno" | "cert" | "aula" | "quiz" | "curso" | "plano" | "question";

export interface AppNotification {
  id: string;
  apiId: string | null;
  type: NotifType;
  text: string;
  time: string;
  createdAt: string;
  isRead: boolean;
}

interface ApiNotificationRaw {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  read: boolean;
  createdAt: string;
}

interface ApiNotificationsResponse {
  data: ApiNotificationRaw[];
  unreadCount: number;
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

function mapApiType(type: string): NotifType {
  if (type === "NEW_QUESTION") return "question";
  if (type === "QUESTION_ANSWERED") return "question";
  return "plano";
}

function mapApiText(n: ApiNotificationRaw): string {
  return n.body ? `${n.title}: ${n.body}` : n.title;
}

export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const role = user?.role;

  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  const isProfessorOrAdmin = role === "PROFESSOR" || role === "ADMIN";
  const isStudent = role === "STUDENT";

  // API notifications (NEW_QUESTION, QUESTION_ANSWERED)
  const apiNotifQ = useQuery({
    queryKey: ["notifications-api"],
    queryFn: async () => {
      const { data } = await api.get<ApiNotificationsResponse>("/notifications");
      return data;
    },
    staleTime: 15_000,
    enabled: !!user,
  });

  // Mark single as read via API
  const markAsReadMut = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/notifications/${id}/read`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications-api"] }),
  });

  // Mark all as read via API
  const markAllApiMut = useMutation({
    mutationFn: () =>
      api.patch("/notifications/read-all").then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications-api"] }),
  });

  const pendingQ = usePendingEnrollments({ enabled: !!user && isProfessorOrAdmin });
  const certsQ = useCertificates({ enabled: !!user && isStudent });

  const notifications = useMemo<AppNotification[]>(() => {
    const items: AppNotification[] = [];

    // API notifications
    for (const n of apiNotifQ.data?.data ?? []) {
      items.push({
        id: `api-${n.id}`,
        apiId: n.id,
        type: mapApiType(n.type),
        text: mapApiText(n),
        time: relativeTime(n.createdAt),
        createdAt: n.createdAt,
        isRead: n.read,
      });
    }

    // Computed: pending enrollment requests
    if (isProfessorOrAdmin) {
      for (const e of pendingQ.data?.data ?? []) {
        const id = `enroll-${e.id}`;
        items.push({
          id,
          apiId: null,
          type: "aluno",
          text: `${e.student.name} solicitou acesso ao curso "${e.course.title}"`,
          time: relativeTime(e.requestedAt),
          createdAt: e.requestedAt,
          isRead: readIds.has(id),
        });
      }
    }

    // Computed: recent certificates
    if (isStudent) {
      for (const c of (certsQ.data?.data ?? []).slice(0, 5)) {
        const id = `cert-${c.id}`;
        items.push({
          id,
          apiId: null,
          type: "cert",
          text: `Parabéns! Você recebeu o certificado de "${c.courseName}"`,
          time: relativeTime(c.issuedAt),
          createdAt: c.issuedAt,
          isRead: readIds.has(id),
        });
      }
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [isProfessorOrAdmin, isStudent, apiNotifQ.data, pendingQ.data, certsQ.data, readIds]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isLoading = apiNotifQ.isLoading || (isProfessorOrAdmin ? pendingQ.isLoading : isStudent ? certsQ.isLoading : false);

  function isUnread(id: string): boolean {
    return notifications.find((n) => n.id === id)?.isRead === false;
  }

  function markAsRead(id: string) {
    const notif = notifications.find((n) => n.id === id);
    if (!notif) return;
    if (notif.apiId) {
      markAsReadMut.mutate(notif.apiId);
    } else {
      setReadIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        persistReadIds(next);
        return next;
      });
    }
  }

  function markAllAsRead() {
    // Mark API notifications
    const hasApiUnread = (apiNotifQ.data?.data ?? []).some((n) => !n.read);
    if (hasApiUnread) {
      markAllApiMut.mutate();
    }
    // Mark computed notifications
    const computedIds = new Set(notifications.filter((n) => !n.apiId).map((n) => n.id));
    persistReadIds(computedIds);
    setReadIds(computedIds);
  }

  return { notifications, unreadCount, isUnread, markAsRead, markAllAsRead, isLoading };
}
