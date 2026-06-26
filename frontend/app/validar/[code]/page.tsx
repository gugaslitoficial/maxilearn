"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://maxilearn-backend.onrender.com";

interface ValidatedCert {
  id: string;
  studentName: string;
  courseName: string;
  teacherName: string;
  issuedAt: string;
  validationCode: string;
  courseDuration: string | null;
  company: {
    name: string;
    platformName: string | null;
    primaryColor: string | null;
    logoUrl: string | null;
  };
}

export default function ValidarCertificadoPage() {
  const { code } = useParams<{ code: string }>();
  const [cert, setCert] = useState<ValidatedCert | null>(null);
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");

  useEffect(() => {
    if (!code) return;
    axios
      .get<ValidatedCert>(`${API_BASE}/certificates/validate/${code}`)
      .then((r) => {
        setCert(r.data);
        setStatus("valid");
      })
      .catch(() => setStatus("invalid"));
  }, [code]);

  const primaryColor = cert?.company.primaryColor ?? "#CC1F1F";
  const platformName = cert?.company.platformName ?? cert?.company.name ?? "MaxiLearn";

  if (status === "loading") {
    return (
      <div style={{ fontFamily: "Manrope, system-ui, sans-serif", minHeight: "100vh", background: "#f6f4f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#8a807e" }}>
          <div style={{ width: 40, height: 40, border: "4px solid #f0e8e8", borderTopColor: "#CC1F1F", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Verificando certificado...</div>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div style={{ fontFamily: "Manrope, system-ui, sans-serif", minHeight: "100vh", background: "#f6f4f3", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CC1F1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6M9 9l6 6" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#16100f", letterSpacing: "-0.02em" }}>Certificado inválido</h1>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#8a807e", marginTop: 10, lineHeight: 1.6 }}>
            Este código de validação não corresponde a nenhum certificado emitido. Verifique se o link está correto.
          </p>
          <div style={{ marginTop: 18, background: "#fff", border: "1px solid #ece4e4", borderRadius: 12, padding: "12px 16px", display: "inline-flex", alignItems: "center", gap: 9 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b3a6a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#8a807e", fontFamily: "monospace", letterSpacing: "0.04em" }}>{code}</span>
          </div>
        </div>
      </div>
    );
  }

  const issuedDate = cert
    ? new Date(cert.issuedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  return (
    <div style={{ fontFamily: "Manrope, system-ui, sans-serif", minHeight: "100vh", background: "#f6f4f3", display: "flex", flexDirection: "column", alignItems: "center", padding: "clamp(24px,4vw,48px) clamp(16px,4vw,32px)" }}>

      {/* Valid badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#e8f5ee", border: "1px solid #b8e0cb", borderRadius: 100, padding: "8px 18px", marginBottom: 28 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: "#1f8a5b", letterSpacing: "0.02em" }}>Certificado válido e autêntico</span>
      </div>

      {/* Certificate card */}
      <div style={{ width: "100%", maxWidth: 680, background: "#fffdf9", border: `2px solid ${primaryColor}`, borderRadius: 12, position: "relative", overflow: "hidden", boxShadow: `0 20px 50px rgba(0,0,0,0.1)` }}>
        {/* Corner decorations */}
        {[
          { top: 14, left: 14, borderTop: `3px solid ${primaryColor}`, borderLeft: `3px solid ${primaryColor}`, borderRadius: "3px 0 0 0" },
          { top: 14, right: 14, borderTop: `3px solid ${primaryColor}`, borderRight: `3px solid ${primaryColor}`, borderRadius: "0 3px 0 0" },
          { bottom: 14, left: 14, borderBottom: `3px solid ${primaryColor}`, borderLeft: `3px solid ${primaryColor}`, borderRadius: "0 0 0 3px" },
          { bottom: 14, right: 14, borderBottom: `3px solid ${primaryColor}`, borderRight: `3px solid ${primaryColor}`, borderRadius: "0 0 3px 0" },
        ].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: 34, height: 34, opacity: 0.55, ...s }} />
        ))}

        <div style={{ padding: "clamp(32px,5vw,56px) clamp(28px,5vw,60px)", textAlign: "center", position: "relative" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 13, height: 13, border: "2.5px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#1a1414" }}>{platformName}</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: primaryColor, marginBottom: 26 }}>
            Certificado de Conclusão
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: "#8a7a5e", letterSpacing: "0.04em" }}>Certificamos que</p>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#16100f", letterSpacing: "-0.01em", margin: "10px 0 14px" }}>
            {cert?.studentName}
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 500, color: "#5a5044", maxWidth: 480, margin: "0 auto" }}>
            concluiu com êxito o curso{" "}
            <strong style={{ fontWeight: 800, color: "#16100f" }}>{cert?.courseName}</strong>
            {cert?.courseDuration ? `, com carga horária de ${cert.courseDuration}` : ""}
            , cumprindo todos os requisitos estabelecidos.
          </p>

          {/* Divider with medal */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "28px 0" }}>
            <div style={{ height: 1, flex: 1, background: "#e0d3b8" }} />
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 20px ${primaryColor}50` }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <div style={{ height: 1, flex: 1, background: "#e0d3b8" }} />
          </div>

          {/* Signatures */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 22, color: "#16100f", lineHeight: 1, marginBottom: 8 }}>{cert?.teacherName}</div>
              <div style={{ borderTop: "1.5px solid #cbbf9f", paddingTop: 7, fontSize: 12, fontWeight: 700, color: "#5a5044" }}>{cert?.teacherName}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#8a7a5e" }}>Instrutor responsável</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f", lineHeight: 1, marginBottom: 10 }}>{issuedDate}</div>
              <div style={{ borderTop: "1.5px solid #cbbf9f", paddingTop: 7, fontSize: 12, fontWeight: 700, color: "#5a5044" }}>Data de conclusão</div>
            </div>
          </div>

          {/* Validation code */}
          <div style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 8, background: "#faf6ec", border: "1px solid #e8ddc8", borderRadius: 8, padding: "8px 14px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8a7a5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.07em", color: "#5a5044" }}>Código: {cert?.validationCode}</span>
          </div>
        </div>
      </div>

      {/* Verification footer */}
      <div style={{ marginTop: 28, width: "100%", maxWidth: 680, background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#e8f5ee", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#16100f" }}>Verificação automática confirmada</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
              Este certificado foi emitido pela plataforma {platformName} e sua autenticidade foi verificada com sucesso.
            </div>
          </div>
        </div>
      </div>

      <Link href="/" style={{ marginTop: 22, fontSize: 13.5, fontWeight: 700, color: "#8a807e", textDecoration: "none" }}>
        ← Voltar para a plataforma
      </Link>
    </div>
  );
}
