"use client";

import { useState } from "react";
import Link from "next/link";
import { useCertificates } from "@/hooks/use-certificates";
import type { Certificate } from "@/hooks/use-certificates";
import { Toast } from "@/components/ui/Toast";
import { hashGradient, makeTag } from "@/lib/utils";

const PRIMARY = "#CC1F1F";

function Skeleton({ w, h, radius = 8 }: { w: string | number; h: number; radius?: number }) {
  return (
    <div style={{ width: w, height: h, borderRadius: radius, background: "linear-gradient(90deg,#f0eaea 25%,#e8e0e0 50%,#f0eaea 75%)", backgroundSize: "200% 100%", animation: "ml-shimmer 1.4s infinite" }} />
  );
}

function CertCard({ cert, onToast }: { cert: Certificate; onToast: (msg: string) => void }) {
  const [copied, setCopied] = useState(false);
  const primaryColor = cert.company.primaryColor ?? PRIMARY;
  const platformName = cert.company.platformName ?? cert.company.name;
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const validationUrl = typeof window !== "undefined"
    ? `${window.location.origin}/validar/${cert.validationCode}`
    : `/validar/${cert.validationCode}`;

  function handleCopy() {
    navigator.clipboard.writeText(validationUrl).then(() => {
      setCopied(true);
      onToast("Link de verificação copiado!");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => onToast("Não foi possível copiar. Tente manualmente."));
  }

  function handleDownload() {
    window.print();
  }

  function handleLinkedIn() {
    const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(validationUrl)}&title=${encodeURIComponent(`Certificado: ${cert.courseName}`)}&summary=${encodeURIComponent(`Concluí o curso "${cert.courseName}" na plataforma ${platformName}!`)}`;
    window.open(linkedInUrl, "_blank", "noopener,noreferrer");
  }

  const grad = hashGradient(cert.courseId);
  const tag = makeTag(cert.courseName, undefined);

  return (
    <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 20, overflow: "hidden", boxShadow: "0 10px 32px rgba(60,20,20,0.07)" }}>
      {/* Certificate preview */}
      <div className="cert-printable" style={{ background: "#fffdf9", borderBottom: "1px solid #e8ddc8", padding: 8 }}>
        <div style={{ border: `2px solid ${primaryColor}`, borderRadius: 5, position: "relative", overflow: "hidden" }}>
          {[
            { top: 12, left: 12, borderTop: `3px solid ${primaryColor}`, borderLeft: `3px solid ${primaryColor}`, borderRadius: "3px 0 0 0" },
            { top: 12, right: 12, borderTop: `3px solid ${primaryColor}`, borderRight: `3px solid ${primaryColor}`, borderRadius: "0 3px 0 0" },
            { bottom: 12, left: 12, borderBottom: `3px solid ${primaryColor}`, borderLeft: `3px solid ${primaryColor}`, borderRadius: "0 0 0 3px" },
            { bottom: 12, right: 12, borderBottom: `3px solid ${primaryColor}`, borderRight: `3px solid ${primaryColor}`, borderRadius: "0 0 3px 0" },
          ].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: 32, height: 32, opacity: 0.55, ...s }} />
          ))}
          <div style={{ padding: "clamp(22px,4vw,40px) clamp(20px,4vw,44px)", textAlign: "center", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 5 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: 12, height: 12, border: "2.5px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: "#1a1414" }}>{platformName}</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: primaryColor, marginBottom: 20 }}>Certificado de Conclusão</div>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: "#8a7a5e", letterSpacing: "0.04em" }}>Certificamos que</p>
            <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "clamp(20px,3.5vw,30px)", fontWeight: 800, color: "#16100f", letterSpacing: "-0.01em", margin: "8px 0 12px" }}>
              {cert.studentName}
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, fontWeight: 500, color: "#5a5044", maxWidth: 440, margin: "0 auto" }}>
              concluiu com êxito o curso <strong style={{ fontWeight: 800, color: "#16100f" }}>{cert.courseName}</strong>
              {cert.courseDuration ? `, com carga horária de ${cert.courseDuration}` : ""}, cumprindo todos os requisitos.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, margin: "22px 0" }}>
              <div style={{ height: 1, width: 50, background: "#e0d3b8" }} />
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${primaryColor}50` }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
              </div>
              <div style={{ height: 1, width: 50, background: "#e0d3b8" }} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
                <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 20, color: "#16100f", lineHeight: 1, marginBottom: 7 }}>{cert.teacherName}</div>
                <div style={{ borderTop: "1.5px solid #cbbf9f", paddingTop: 6, fontSize: 11.5, fontWeight: 700, color: "#5a5044" }}>{cert.teacherName}</div>
                <div style={{ fontSize: 10.5, fontWeight: 500, color: "#8a7a5e" }}>Instrutor responsável</div>
              </div>
              <div style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#16100f", lineHeight: 1, marginBottom: 10 }}>{issuedDate}</div>
                <div style={{ borderTop: "1.5px solid #cbbf9f", paddingTop: 6, fontSize: 11.5, fontWeight: 700, color: "#5a5044" }}>Data de conclusão</div>
              </div>
            </div>
            <div style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 7, background: "#faf6ec", border: "1px solid #e8ddc8", borderRadius: 7, padding: "6px 12px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a7a5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#5a5044" }}>Código: {cert.validationCode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={handleDownload} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 10, padding: "11px 16px", cursor: "pointer", boxShadow: "0 6px 16px rgba(204,31,31,0.26)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
          Download PDF
        </button>
        <button onClick={handleLinkedIn} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#fff", background: "#0a66c2", border: "none", borderRadius: 10, padding: "11px 16px", cursor: "pointer" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM9 17H6.5v-7H9v7Zm-1.25-8.1a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8ZM18 17h-2.5v-3.7c0-.9-.3-1.5-1.1-1.5-.6 0-1 .4-1.1.8-.05.15-.06.36-.06.57V17H9.8s.03-6.3 0-7h2.5v1c.33-.5.92-1.2 2.25-1.2 1.64 0 2.95 1.07 2.95 3.38V17Z" /></svg>
          LinkedIn
        </button>
        <button onClick={handleCopy} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 10, padding: "11px 16px", cursor: "pointer" }}>
          {copied ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 9h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2z" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          )}
          {copied ? "Copiado!" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}

export default function CertificadosPage() {
  const certsQ = useCertificates();
  const [toast, setToast] = useState<string | null>(null);

  const certs = certsQ.data?.data ?? [];

  return (
    <>
      <style>{`
        @keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @media print {
          body > *:not(.cert-printable) { display: none !important; }
          .cert-printable { display: block !important; break-after: page; }
        }
      `}</style>

      <header style={{ background: "linear-gradient(135deg,#1f8a5b,#16100f)", padding: "28px clamp(20px,4vw,40px)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -30, width: 280, height: 280, background: "radial-gradient(circle,rgba(255,255,255,0.10),transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 50, height: 50, borderRadius: 13, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.24)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>Meus certificados</h1>
            <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>
              {certsQ.isLoading ? "Carregando..." : certs.length === 0 ? "Nenhum certificado ainda." : `${certs.length} certificado${certs.length !== 1 ? "s" : ""} obtido${certs.length !== 1 ? "s" : ""}.`}
            </p>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, padding: "clamp(24px,3vw,40px) clamp(20px,4vw,40px) 56px" }}>

        {certsQ.isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {[1, 2].map((i) => <Skeleton key={i} w="100%" h={420} radius={20} />)}
          </div>
        )}

        {certsQ.isError && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#8a807e" }}>Erro ao carregar certificados.</div>
            <button onClick={() => certsQ.refetch()} type="button" style={{ marginTop: 18, fontFamily: "inherit", fontSize: 14, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: "12px 24px", cursor: "pointer" }}>Tentar novamente</button>
          </div>
        )}

        {!certsQ.isLoading && !certsQ.isError && certs.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f1ecec", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b3a6a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#16100f" }}>Nenhum certificado ainda</h2>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#8a807e", marginTop: 6, maxWidth: 380, margin: "6px auto 0" }}>
                Conclua um curso e sua avaliação final para receber seu primeiro certificado.
              </p>
            </div>
            <Link href="/aluno/explorar" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 800, color: "#fff", textDecoration: "none", background: PRIMARY, borderRadius: 12, padding: "13px 22px", boxShadow: "0 8px 20px rgba(204,31,31,0.26)", marginTop: 8 }}>
              Explorar cursos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>
        )}

        {!certsQ.isLoading && certs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 820, margin: "0 auto" }}>
            {certs.map((cert) => (
              <CertCard key={cert.id} cert={cert} onToast={setToast} />
            ))}
          </div>
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
