import type { ReactNode, ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const STYLES: Record<ButtonVariant, { normal: string; disabled: string }> = {
  primary: {
    normal:   "border:none; background:#CC1F1F; color:#fff; box-shadow:0 6px 16px rgba(204,31,31,0.26);",
    disabled: "border:none; background:#e9b3b0; color:#fff; cursor:not-allowed; opacity:0.7;",
  },
  secondary: {
    normal:   "border:none; background:#16100f; color:#fff;",
    disabled: "border:none; background:#cabbbb; color:#fff; cursor:not-allowed; opacity:0.7;",
  },
  outline: {
    normal:   "border:1.5px solid #e2d9d9; background:#fff; color:#16100f;",
    disabled: "border:1.5px solid #ece4e4; background:#fff; color:#c0b6b4; cursor:not-allowed;",
  },
  ghost: {
    normal:   "border:none; background:transparent; color:#CC1F1F;",
    disabled: "border:none; background:transparent; color:#d8b8b6; cursor:not-allowed;",
  },
  danger: {
    normal:   "border:none; background:#fff; color:#CC1F1F; box-shadow:inset 0 0 0 1.5px #f3c4c4;",
    disabled: "border:none; background:#fff; color:#e0b3b1; box-shadow:inset 0 0 0 1.5px #f3dada; cursor:not-allowed;",
  },
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "font-size:13px; padding:8px 14px; border-radius:9px;",
  md: "font-size:14px; padding:11px 18px; border-radius:10px;",
  lg: "font-size:15.5px; padding:14px 24px; border-radius:12px;",
};

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "ml-spin .7s linear infinite", flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const s = STYLES[variant];
  const combined = `font-family:Manrope,system-ui,sans-serif; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; transition:opacity .15s; ${SIZE_STYLES[size]} ${isDisabled ? s.disabled : s.normal}`;

  return (
    <button
      disabled={isDisabled}
      style={{ ...Object.fromEntries(combined.split(";").filter(Boolean).map(p => { const [k, ...v] = p.trim().split(":"); return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v.join(":").trim()]; })), ...style }}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
