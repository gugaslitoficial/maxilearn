"use client";

import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#16100f",
        color: "#fff",
        fontSize: 14,
        fontWeight: 700,
        padding: "14px 22px",
        borderRadius: 12,
        boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 100,
        whiteSpace: "nowrap",
        animation: "ml-pop .25s ease",
      }}
    >
      <CheckCircle size={18} color="#4ade80" />
      {message}
    </div>
  );
}
