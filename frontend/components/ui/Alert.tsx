import type { ReactNode } from "react";

export type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertProps {
  variant: AlertVariant;
  title: string;
  children?: ReactNode;
}

const CONFIG: Record<AlertVariant, { bg: string; border: string; iconColor: string; titleColor: string; textColor: string; icon: string[] }> = {
  success: {
    bg: "#eafaf1", border: "#cbe8d8", iconColor: "#1f8a5b", titleColor: "#16603f", textColor: "#3a5a4a",
    icon: ["M20 6 9 17l-5-5"],
  },
  error: {
    bg: "#fdeeee", border: "#f6d6d6", iconColor: "#CC1F1F", titleColor: "#8a2020", textColor: "#7a3a3a",
    icon: ["M18 6 6 18", "M6 6l12 12"],
  },
  warning: {
    bg: "#fdf6e9", border: "#f3e1bf", iconColor: "#d9821f", titleColor: "#8a5a14", textColor: "#6a5430",
    icon: ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
  },
  info: {
    bg: "#eef3fa", border: "#c9dcf0", iconColor: "#3a6ea5", titleColor: "#244a73", textColor: "#3a5570",
    icon: ["M12 2a10 10 0 1 0 .01 0", "M12 16v-4", "M12 8h.01"],
  },
};

export function Alert({ variant, title, children }: AlertProps) {
  const c = CONFIG[variant];
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        gap: 13,
        alignItems: "flex-start",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
          color: c.iconColor,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {c.icon.map((d, i) => <path key={i} d={d} />)}
        </svg>
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: c.titleColor }}>{title}</div>
        {children && (
          <div style={{ fontSize: 13, fontWeight: 500, color: c.textColor, marginTop: 1 }}>{children}</div>
        )}
      </div>
    </div>
  );
}
