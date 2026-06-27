import Link from "next/link";

const PRIMARY = "var(--color-primary)";

export default function NotFound() {
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
        <div style={{ position: "relative", marginBottom: 8 }}>
          <div style={{ fontSize: "clamp(88px,15vw,140px)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1, color: "#16100f" }}>
            4<span style={{ color: PRIMARY }}>0</span>4
          </div>
          <div
            style={{
              position: "absolute",
              top: 18,
              left: "50%",
              transform: "translateX(-50%)",
              width: 62,
              height: 62,
              borderRadius: "50%",
              border: "7px solid #fff",
              boxShadow: `inset 0 0 0 3px ${PRIMARY}`,
              animation: "ml-float 4s ease-in-out infinite",
            }}
          />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginTop: 8 }}>Página não encontrada</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 500, color: "#6a605e", marginTop: 10, maxWidth: 340 }}>
          A página que você procura não existe ou foi movida.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32, width: "100%", maxWidth: 280 }}>
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 800, color: "#fff", textDecoration: "none", background: PRIMARY, borderRadius: 12, padding: 14, boxShadow: "0 10px 24px rgba(204,31,31,0.28)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5 12 3l9 6.5" /><path d="M5 10v10h14V10" />
            </svg>
            Voltar ao início
          </Link>
          <Link
            href="/dashboard"
            style={{ fontSize: 14, fontWeight: 700, color: PRIMARY, textDecoration: "none", textAlign: "center", padding: 4 }}
          >
            Ir para o dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
