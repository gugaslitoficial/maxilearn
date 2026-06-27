"use client";

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel?: string;
}

const PRIMARY = "var(--color-primary)";

export function Switch({ checked, onChange, ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      style={{
        position: "relative",
        width: 44,
        height: 26,
        borderRadius: 100,
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background .2s",
        background: checked ? PRIMARY : "#d8cccc",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          transition: "left .2s",
        }}
      />
    </button>
  );
}
