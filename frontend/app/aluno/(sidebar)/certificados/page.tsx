"use client";

// TODO: integrar com GET /students/me/certificates (lista de certificados emitidos)
import { useState } from "react";
import Link from "next/link";
import { Toast } from "@/components/ui/Toast";

const PRIMARY = "#CC1F1F";

const RECOMMENDED = [
  { tag: "BR", title: "Brigada de Incêndio", duration: "5h", level: "Intermediário", levelColor: "#b9842f", levelBg: "#fdf3e2", grad: "linear-gradient(135deg,#CC1F1F,#e85a4f)" },
  { tag: "PR", title: "Primeiros Socorros", duration: "4h", level: "Básico", levelColor: "#1f8a5b", levelBg: "#e8f5ee", grad: "linear-gradient(135deg,#1f8a5b,#43b787)" },
  { tag: "ER", title: "Ergonomia no Trabalho", duration: "3h", level: "Básico", levelColor: "#1f8a5b", levelBg: "#e8f5ee", grad: "linear-gradient(135deg,#3a6ea5,#5b9bd5)" },
];

export default function CertificadosPage() {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function handleCopy() {
    setCopied(true);
    setToast("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    setToast("Download iniciado!");
  }

  function handleLinkedIn() {
    setToast("Abrindo LinkedIn...");
  }

  return (
    <>
      {/* Celebratory header */}
      <header
        style={{
          background: "linear-gradient(135deg,#1f8a5b,#16100f)",
          padding: "34px clamp(20px,4vw,40px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -60, right: -30, width: 280, height: 280, background: "radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "relative", maxWidth: 980, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 54, height: 54, borderRadius: 14, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.24)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>
              Parabéns, Ana! Você concluiu o curso. 🎉
            </h1>
            <p style={{ fontSize: 14.5, fontWeight: 600, color: "rgba(255,255,255,0.82)", marginTop: 4 }}>
              Seu certificado de <strong style={{ fontWeight: 800, color: "#fff" }}>Segurança no Trabalho</strong> já está disponível.
            </p>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, padding: "clamp(24px,3vw,40px) clamp(20px,4vw,40px) 56px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 280px", gap: 28, alignItems: "start" }} className="cert-grid">
          <style>{`@media (max-width: 768px) { .cert-grid { grid-template-columns: 1fr !important; } }`}</style>

          {/* LEFT: certificate + recommendations */}
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Certificate */}
            <div style={{ background: "#fffdf9", border: "1px solid #e8ddc8", borderRadius: 8, boxShadow: "0 24px 60px rgba(60,40,10,0.16)", padding: 8 }}>
              <div style={{ border: `2px solid ${PRIMARY}`, borderRadius: 5, position: "relative", overflow: "hidden" }}>
                {/* Corner ornaments */}
                {[
                  { top: 14, left: 14, borderTop: `3px solid ${PRIMARY}`, borderLeft: `3px solid ${PRIMARY}`, borderRadius: "3px 0 0 0" },
                  { top: 14, right: 14, borderTop: `3px solid ${PRIMARY}`, borderRight: `3px solid ${PRIMARY}`, borderRadius: "0 3px 0 0" },
                  { bottom: 14, left: 14, borderBottom: `3px solid ${PRIMARY}`, borderLeft: `3px solid ${PRIMARY}`, borderRadius: "0 0 0 3px" },
                  { bottom: 14, right: 14, borderBottom: `3px solid ${PRIMARY}`, borderRight: `3px solid ${PRIMARY}`, borderRadius: "0 0 3px 0" },
                ].map((style, i) => (
                  <div key={i} style={{ position: "absolute", width: 38, height: 38, opacity: 0.55, ...style }} />
                ))}

                <div style={{ padding: "clamp(28px,5vw,52px) clamp(24px,5vw,56px)", textAlign: "center", position: "relative" }}>
                  {/* Brand */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 11, marginBottom: 6 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 14, height: 14, border: "3px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#1a1414" }}>Maxi 1 Lubrificantes</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: PRIMARY, marginBottom: 28 }}>
                    Certificado de Conclusão
                  </div>

                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a7a5e", letterSpacing: "0.04em" }}>Certificamos que</p>
                  <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "clamp(28px,5vw,40px)", fontWeight: 800, color: "#16100f", letterSpacing: "-0.01em", margin: "10px 0 14px" }}>
                    Ana Carolina Lima
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, fontWeight: 500, color: "#5a5044", maxWidth: 480, margin: "0 auto" }}>
                    concluiu com êxito o curso <strong style={{ fontWeight: 800, color: "#16100f" }}>Segurança no Trabalho</strong>, com carga horária de 6 horas, cumprindo todos os módulos e a avaliação final.
                  </p>

                  {/* Seal divider */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "30px 0" }}>
                    <div style={{ height: 1, width: 60, background: "#e0d3b8" }} />
                    <div style={{ width: 54, height: 54, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(204,31,31,0.3)" }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                    </div>
                    <div style={{ height: 1, width: 60, background: "#e0d3b8" }} />
                  </div>

                  {/* Signatures */}
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginTop: 18, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 160, textAlign: "center" }}>
                      <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 24, color: "#16100f", lineHeight: 1, marginBottom: 8 }}>Ricardo Paz</div>
                      <div style={{ borderTop: "1.5px solid #cbbf9f", paddingTop: 7, fontSize: 12, fontWeight: 700, color: "#5a5044" }}>Ricardo Paz</div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "#8a7a5e" }}>Instrutor responsável</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 160, textAlign: "center" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: "#16100f", lineHeight: 1, marginBottom: 11 }}>20 / 06 / 2026</div>
                      <div style={{ borderTop: "1.5px solid #cbbf9f", paddingTop: 7, fontSize: 12, fontWeight: 700, color: "#5a5044" }}>Data de conclusão</div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "#8a7a5e" }}>São Paulo, SP</div>
                    </div>
                  </div>

                  {/* Validation code */}
                  <div style={{ marginTop: 30, display: "inline-flex", alignItems: "center", gap: 8, background: "#faf6ec", border: "1px solid #e8ddc8", borderRadius: 8, padding: "8px 14px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a7a5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#5a5044" }}>Código: MAXI-ST-2026-0A7F3C9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginBottom: 16 }}>Próximos cursos recomendados</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {RECOMMENDED.map((c) => (
                  <Link key={c.tag} href="/aluno/explorar" style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, overflow: "hidden", textDecoration: "none", display: "flex", flexDirection: "column" }}>
                    <div style={{ height: 88, background: c.grad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>{c.tag}</span>
                    </div>
                    <div style={{ padding: 14 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800, color: "#16100f", lineHeight: 1.3 }}>{c.title}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#8a807e" }}>{c.duration}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10.5, fontWeight: 800, color: c.levelColor, background: c.levelBg, padding: "2px 8px", borderRadius: 100 }}>{c.level}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: "#16100f", marginBottom: 16 }}>Seu certificado</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={handleDownload}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, width: "100%", fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: 13, cursor: "pointer", boxShadow: "0 8px 20px rgba(204,31,31,0.26)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                  Download PDF
                </button>
                <button
                  onClick={handleLinkedIn}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, width: "100%", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#fff", background: "#0a66c2", border: "none", borderRadius: 11, padding: 12, cursor: "pointer" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM9 17H6.5v-7H9v7Zm-1.25-8.1a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8ZM18 17h-2.5v-3.7c0-.9-.3-1.5-1.1-1.5-.6 0-1 .4-1.1.8-.05.15-.06.36-.06.57V17H9.8s.03-6.3 0-7h2.5v1c.33-.5.92-1.2 2.25-1.2 1.64 0 2.95 1.07 2.95 3.38V17Z"/></svg>
                  Compartilhar no LinkedIn
                </button>
                <button
                  onClick={handleCopy}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, width: "100%", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: 12, cursor: "pointer" }}
                >
                  {copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 9h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2z"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  )}
                  {copied ? "Link copiado!" : "Copiar link de verificação"}
                </button>
              </div>
            </div>

            {/* Verification card */}
            <div style={{ background: "#e8f5ee", border: "1px solid #cbe8d8", borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#16603f" }}>Certificado verificável</span>
              </div>
              <p style={{ fontSize: 12.5, lineHeight: 1.5, fontWeight: 500, color: "#3a5a4a" }}>
                Qualquer pessoa pode validar a autenticidade pelo código único em maxilearn.com.br/validar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
