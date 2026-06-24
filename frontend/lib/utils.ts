// ─── Avatar / gradient helpers ───────────────────────────────────────────────

const AVATAR_COLORS = [
  "#CC1F1F", "#3a6ea5", "#1f8a5b", "#b9842f",
  "#7a4fb9", "#2f9b8e", "#c0573a", "#9b2f7a",
];

const GRADIENTS = [
  "linear-gradient(135deg,#CC1F1F,#e85a4f)",
  "linear-gradient(135deg,#3a6ea5,#5b9bd5)",
  "linear-gradient(135deg,#1f8a5b,#43b787)",
  "linear-gradient(135deg,#b9842f,#e0a94d)",
  "linear-gradient(135deg,#7a4fb9,#a06fe0)",
  "linear-gradient(135deg,#2f9b8e,#52c0b2)",
  "linear-gradient(135deg,#6a605e,#9a8f8c)",
];

function hashIndex(str: string, len: number): number {
  let h = 0;
  for (const ch of str) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0;
  return Math.abs(h) % len;
}

export function hashAvatarColor(str: string): string {
  return AVATAR_COLORS[hashIndex(str, AVATAR_COLORS.length)];
}

export function hashGradient(str: string): string {
  return GRADIENTS[hashIndex(str, GRADIENTS.length)];
}

// ─── String helpers ───────────────────────────────────────────────────────────

export function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function makeTag(title: string, category?: string | null): string {
  if (category) return category.replace(/\s+/g, "").slice(0, 4).toUpperCase();
  return title
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Nunca";
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins}min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

// ─── Role mapping ─────────────────────────────────────────────────────────────

export type ApiRole = "ADMIN" | "PROFESSOR" | "STUDENT";

export const ROLE_LABEL: Record<ApiRole, string> = {
  ADMIN: "Admin",
  PROFESSOR: "Professor",
  STUDENT: "Estudante",
};

export const ROLE_PT_TO_API: Record<string, ApiRole> = {
  Admin: "ADMIN",
  Professor: "PROFESSOR",
  Estudante: "STUDENT",
};

// ─── Course status mapping ────────────────────────────────────────────────────

export type ApiCourseStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

export const STATUS_LABEL: Record<ApiCourseStatus, string> = {
  PUBLISHED: "Publicado",
  DRAFT: "Rascunho",
  ARCHIVED: "Arquivado",
};

export const STATUS_PT_TO_API: Record<string, ApiCourseStatus> = {
  Publicado: "PUBLISHED",
  Rascunho: "DRAFT",
  Arquivado: "ARCHIVED",
};

// ─── Course level mapping ─────────────────────────────────────────────────────

export type ApiCourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export const LEVEL_LABEL: Record<ApiCourseLevel, string> = {
  BEGINNER: "Básico",
  INTERMEDIATE: "Intermediário",
  ADVANCED: "Avançado",
};

export const LEVEL_PT_TO_API: Record<string, ApiCourseLevel> = {
  Básico: "BEGINNER",
  Intermediário: "INTERMEDIATE",
  Avançado: "ADVANCED",
};

// ─── Student progress status mapping ─────────────────────────────────────────

export type StudentProgressStatus = "done" | "progress" | "not_started";

export const STUDENT_PROGRESS_LABEL: Record<StudentProgressStatus, string> = {
  done: "Concluído",
  progress: "Em andamento",
  not_started: "Não iniciado",
};

// ─── Quiz status mapping ──────────────────────────────────────────────────────

export type ApiQuizStatus = "PUBLISHED" | "DRAFT";

export const QUIZ_STATUS_LABEL: Record<ApiQuizStatus, string> = {
  PUBLISHED: "Publicado",
  DRAFT: "Rascunho",
};

export const QUIZ_STATUS_PT_TO_API: Record<string, ApiQuizStatus> = {
  Publicado: "PUBLISHED",
  Rascunho: "DRAFT",
};

// ─── Error message extraction ─────────────────────────────────────────────────

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const resp = (err as { response?: { data?: { message?: string | string[] } } }).response;
    const msg = resp?.data?.message;
    if (Array.isArray(msg)) return msg[0];
    if (typeof msg === "string") return msg;
  }
  return "Ocorreu um erro inesperado.";
}
