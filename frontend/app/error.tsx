"use client";

import Link from "next/link";

const PRIMARY = "var(--color-primary)";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div
      style={{
        fontFamily: "Manrope, system-ui, sans-serif",
        color: "#16100f",
        background: "#f6f4f3",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`@keyframes ml-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>

      {/* Topbar */}
      <div style={{ padding: "18px 28px", borderBottom: "1px solid #f4eded", background: "#fff", display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 11, height: 11, border: "2.5px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
        </div>
        <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", color: "#1a1414" }}>
          Maxi<span style={{ color: PRIMARY }}>Learn</span>
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "48px 40px" }}>
        <div
          style={{
            width: 108,
            height: 108,
            borderRadius: "50%",
            background: "#fdf3e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            animation: "ml-float 4s ease-in-out infinite",
          }}
        >
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#d9821f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Algo deu errado</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 500, color: "#6a605e", marginTop: 10, maxWidth: 340 }}>
          Nosso time já foi notificado. Tente novamente em alguns instantes.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32, width: "100%", maxWidth: 280 }}>
          <button
            onClick={reset}
            type="button"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", fontSize: 15, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 12, padding: 14, cursor: "pointer", boxShadow: "0 10px 24px rgba(204,31,31,0.28)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v6h6" /><path d="M3 8a9 9 0 1 0 2.6-5.6L3 8" />
            </svg>
            Tentar novamente
          </button>
          <Link
            href="/"
            style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, textDecoration: "none", textAlign: "center", padding: 4 }}
          >
            Voltar ao início →
          </Link>
        </div>
      </div>
    </div>
  );
}
