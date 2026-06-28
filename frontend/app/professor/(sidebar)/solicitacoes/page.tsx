"use client";

import { useState } from "react";
import {
  useCertificateRequests,
  useQuizRetryRequests,
  useReviewCertificateRequest,
  useReviewQuizRetryRequest,
} from "@/hooks/use-requests";
import { Toast } from "@/components/ui/Toast";

const PRIMARY = "var(--color-primary)";

function Sk({ h, r = 8 }: { h: number; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: "100%", height: h, borderRadius: r, background: "#f1ece9" }}
    />
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

type Tab = "cert" | "retry";

export default function ProfessorSolicitacoesPage() {
  const [tab, setTab] = useState<Tab>("cert");
  const [toast, setToast] = useState<string | null>(null);

  const certReqs = useCertificateRequests();
  const retryReqs = useQuizRetryRequests();
  const reviewCert = useReviewCertificateRequest();
  const reviewRetry = useReviewQuizRetryRequest();

  async function handleCert(id: string, action: "approve" | "reject") {
    try {
      await reviewCert.mutateAsync({ id, action });
      setToast(action === "approve" ? "Certificado emitido!" : "Solicitação rejeitada.");
    } catch {
      setToast("Erro ao processar solicitação.");
    }
  }

  async function handleRetry(id: string, action: "approve" | "reject") {
    try {
      await reviewRetry.mutateAsync({ id, action });
      setToast(action === "approve" ? "Nova tentativa liberada!" : "Solicitação rejeitada.");
    } catch {
      setToast("Erro ao processar solicitação.");
    }
  }

  const certData = (certReqs.data?.data ?? []) as Array<{
    id: string;
    requestedAt: string;
    student: { name: string; email: string };
    course: { title: string; teacher: { name: string } };
  }>;

  const retryData = (retryReqs.data?.data ?? []) as Array<{
    id: string;
    requestedAt: string;
    student: { name: string; email: string };
    quiz: { title: string; minPassingScore: number };
    course: { title: string };
  }>;

  const tabStyle = (t: Tab): React.CSSProperties => ({
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: tab === t ? 800 : 600,
    padding: "11px 20px",
    border: "none",
    borderBottom: tab === t ? `2.5px solid ${PRIMARY}` : "2.5px solid transparent",
    background: "transparent",
    color: tab === t ? "#16100f" : "#8a807e",
    cursor: "pointer",
  });

  return (
    <div style={{ padding: "clamp(16px,3vw,32px)", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginBottom: 4 }}>
        Solicitações
      </h1>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#6a605e", marginBottom: 24 }}>
        Gerencie solicitações dos alunos nos seus cursos.
      </p>

      <div style={{ display: "flex", borderBottom: "1px solid #ece4e4", marginBottom: 24 }}>
        <button onClick={() => setTab("cert")} style={tabStyle("cert")}>
          Certificados
          {certReqs.data?.total > 0 && (
            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 800, background: PRIMARY, color: "#fff", borderRadius: 100, padding: "2px 7px" }}>
              {certReqs.data.total}
            </span>
          )}
        </button>
        <button onClick={() => setTab("retry")} style={tabStyle("retry")}>
          Tentativas de Quiz
          {retryReqs.data?.total > 0 && (
            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 800, background: PRIMARY, color: "#fff", borderRadius: 100, padding: "2px 7px" }}>
              {retryReqs.data.total}
            </span>
          )}
        </button>
      </div>

      {tab === "cert" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {certReqs.isLoading ? (
            [0, 1, 2].map((i) => <Sk key={i} h={88} r={12} />)
          ) : certData.length === 0 ? (
            <p style={{ fontSize: 14, fontWeight: 600, color: "#8a807e", padding: "32px 0", textAlign: "center" }}>
              Nenhuma solicitação de certificado pendente.
            </p>
          ) : certData.map((req) => (
            <div key={req.id} style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>{req.student.name}</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "#6a605e", marginTop: 2 }}>{req.student.email}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#3a3030", marginTop: 6 }}>
                  Curso: <span style={{ fontWeight: 700 }}>{req.course.title}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>
                  {fmtDate(req.requestedAt)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => handleCert(req.id, "approve")}
                  disabled={reviewCert.isPending}
                  type="button"
                  style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#fff", background: "#1f8a5b", border: "none", borderRadius: 9, padding: "10px 18px", cursor: "pointer" }}
                >
                  Aprovar
                </button>
                <button
                  onClick={() => handleCert(req.id, "reject")}
                  disabled={reviewCert.isPending}
                  type="button"
                  style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: PRIMARY, background: "#fceeee", border: "1px solid #f6d6d6", borderRadius: 9, padding: "10px 18px", cursor: "pointer" }}
                >
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "retry" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {retryReqs.isLoading ? (
            [0, 1, 2].map((i) => <Sk key={i} h={88} r={12} />)
          ) : retryData.length === 0 ? (
            <p style={{ fontSize: 14, fontWeight: 600, color: "#8a807e", padding: "32px 0", textAlign: "center" }}>
              Nenhuma solicitação de tentativa pendente.
            </p>
          ) : retryData.map((req) => (
            <div key={req.id} style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>{req.student.name}</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "#6a605e", marginTop: 2 }}>{req.student.email}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#3a3030", marginTop: 6 }}>
                  Quiz: <span style={{ fontWeight: 700 }}>{req.quiz.title}</span> · Mín. {req.quiz.minPassingScore}%
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>
                  Curso: {req.course.title} · {fmtDate(req.requestedAt)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => handleRetry(req.id, "approve")}
                  disabled={reviewRetry.isPending}
                  type="button"
                  style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#fff", background: "#1f8a5b", border: "none", borderRadius: 9, padding: "10px 18px", cursor: "pointer" }}
                >
                  Liberar tentativa
                </button>
                <button
                  onClick={() => handleRetry(req.id, "reject")}
                  disabled={reviewRetry.isPending}
                  type="button"
                  style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: PRIMARY, background: "#fceeee", border: "1px solid #f6d6d6", borderRadius: 9, padding: "10px 18px", cursor: "pointer" }}
                >
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
