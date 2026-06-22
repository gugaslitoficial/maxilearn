"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
}

export function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = 460 }: ModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,10,10,0.45)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 30px 70px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 26px",
            borderBottom: "1px solid #f4eded",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 1,
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "#8a807e", marginTop: 4 }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              border: "none",
              background: "#f6f1f1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6a605e",
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 26 }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: "20px 26px",
              borderTop: "1px solid #f4eded",
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
              position: "sticky",
              bottom: 0,
              background: "#fff",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
