import type { ReactNode } from "react";

export type BadgeVariant =
  | "admin" | "professor" | "estudante"
  | "concluido" | "em-andamento" | "rascunho" | "novo"
  | "active" | "inactive" | "published" | "draft" | "archived";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANTS: Record<BadgeVariant, { color: string; bg: string; border: string; dot?: string }> = {
  // Roles
  admin:       { color: "#CC1F1F", bg: "#fceeee",  border: "1px solid #f6d6d6" },
  professor:   { color: "#b9842f", bg: "#fdf3e2",  border: "1px solid #f3e1bf" },
  estudante:   { color: "#1f8a5b", bg: "#e8f5ee",  border: "1px solid #cbe8d8" },
  // Status (design system)
  concluido:   { color: "#1f8a5b", bg: "#e8f5ee",  border: "1px solid #cbe8d8", dot: "#1f8a5b" },
  "em-andamento": { color: "#b9842f", bg: "#fdf3e2", border: "1px solid #f3e1bf", dot: "#d9821f" },
  rascunho:    { color: "#8a807e", bg: "#f1ecec",  border: "1px solid #e0d6d6", dot: "#cabbbb" },
  novo:        { color: "#3a6ea5", bg: "#e9f0f8",  border: "1px solid #c9dcf0" },
  // Legacy aliases
  active:      { color: "#1f8a5b", bg: "#e8f5ee",  border: "1px solid #cbe8d8", dot: "#1f8a5b" },
  inactive:    { color: "#a89e9c", bg: "#f4f0ef",  border: "1px solid #e0d6d6", dot: "#cabbbb" },
  published:   { color: "#1f8a5b", bg: "#e8f5ee",  border: "1px solid #cbe8d8", dot: "#1f8a5b" },
  draft:       { color: "#b9842f", bg: "#fdf3e2",  border: "1px solid #f3e1bf", dot: "#d9821f" },
  archived:    { color: "#8a807e", bg: "#f1ecec",  border: "1px solid #e0d6d6", dot: "#cabbbb" },
};

export function Badge({ children, variant = "estudante", className }: BadgeProps) {
  const v = VARIANTS[variant];
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: v.dot ? 6 : 0,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: "0.02em",
        padding: "5px 13px",
        borderRadius: 100,
        color: v.color,
        background: v.bg,
        border: v.border,
      }}
    >
      {v.dot && (
        <span
          style={{ width: 7, height: 7, borderRadius: "50%", background: v.dot, flexShrink: 0 }}
        />
      )}
      {children}
    </span>
  );
}
