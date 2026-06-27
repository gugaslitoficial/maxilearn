"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useQuizzes,
  useDeleteQuiz,
  useCreateQuiz,
  type ApiQuiz,
} from "@/hooks/use-quizzes";
import { QUIZ_STATUS_LABEL, type ApiQuizStatus } from "@/lib/utils";
import { Toast } from "@/components/ui/Toast";

const PRIMARY = "#CC1F1F";

const STATUS_STYLE: Record<ApiQuizStatus, { color: string; bg: string; border: string }> = {
  PUBLISHED: { color: "#1f8a5b", bg: "#e8f5ee", border: "#cbe8d8" },
  DRAFT:     { color: "#b9842f", bg: "#fdf3e2", border: "#f3e1bf" },
};

const thStyle = {
  fontSize: 11.5,
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  color: "#a89e9c",
  padding: "14px 12px",
};

const actBtn = {
  width: 34,
  height: 34,
  borderRadius: 8,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#8a807e",
} as const;

function Sk({ h, w, r = 6 }: { h: number; w?: number | string; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w ?? "100%", height: h, borderRadius: r, background: "#f1ece9" }}
    />
  );
}

export default function AdminQuizzesPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteQuiz, setDeleteQuiz] = useState<ApiQuiz | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data, isLoading } = useQuizzes();
  const deleteMut = useDeleteQuiz();
  const createMut = useCreateQuiz();

  const quizzes = data?.data ?? [];

  async function handleDuplicate(q: ApiQuiz) {
    try {
      await createMut.mutateAsync({
        title: `${q.title} (cópia)`,
        courseId: q.courseId,
        minPassingScore: q.minPassingScore,
        maxAttempts: q.maxAttempts,
        shuffleQuestions: q.shuffleQuestions,
        showAnswersAfter: q.showAnswersAfter,
        status: "DRAFT",
      });
      setToast("Quiz duplicado como rascunho.");
    } catch {
      setToast("Erro ao duplicar quiz.");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMut.mutateAsync(deleteId);
      setToast("Quiz excluído com sucesso.");
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } };
      const msg = anyErr?.response?.data?.message;
      setToast(typeof msg === "string" ? msg : "Erro ao excluir quiz.");
    }
    setDeleteId(null);
    setDeleteQuiz(null);
  }

  const hasSubmissions = (deleteQuiz?.submissionCount ?? 0) > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "22px clamp(20px,3vw,36px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Quizzes</h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>Crie e gerencie provas e avaliações dos cursos.</p>
        </div>
        <Link
          href="/quizzes/novo"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", background: PRIMARY, border: "none", padding: "12px 18px", borderRadius: 10, boxShadow: "0 6px 16px rgba(204,31,31,0.26)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Criar quiz
        </Link>
      </header>

      {/* Content */}
      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", overflowY: "auto" }}>
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 8, minWidth: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ece4e4" }}>
                  <th style={{ ...thStyle, textAlign: "left", paddingLeft: 16 }}>Quiz</th>
                  <th style={{ ...thStyle, textAlign: "left" }}>Curso vinculado</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Questões</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Nota mínima</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Tentativas</th>
                  <th style={{ ...thStyle, textAlign: "left" }}>Status</th>
                  <th style={{ ...thStyle, textAlign: "right", paddingRight: 16 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? [0, 1, 2, 3].map((i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f6f1f1" }}>
                        <td style={{ padding: "14px 12px 14px 16px" }}><div style={{ display: "flex", gap: 10, alignItems: "center" }}><Sk h={36} w={36} r={10} /><Sk h={16} w={160} /></div></td>
                        <td style={{ padding: "14px 12px" }}><Sk h={14} w={120} /></td>
                        <td style={{ padding: "14px 12px" }}><div style={{ display: "flex", justifyContent: "center" }}><Sk h={14} w={24} /></div></td>
                        <td style={{ padding: "14px 12px" }}><div style={{ display: "flex", justifyContent: "center" }}><Sk h={14} w={24} /></div></td>
                        <td style={{ padding: "14px 12px" }}><div style={{ display: "flex", justifyContent: "center" }}><Sk h={14} w={24} /></div></td>
                        <td style={{ padding: "14px 12px" }}><Sk h={22} w={80} r={100} /></td>
                        <td style={{ padding: "14px 16px 14px 12px" }}><div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}><Sk h={34} w={34} r={8} /><Sk h={34} w={34} r={8} /><Sk h={34} w={34} r={8} /></div></td>
                      </tr>
                    ))
                  : quizzes.map((q) => {
                      const st = STATUS_STYLE[q.status];
                      return (
                        <tr key={q.id} style={{ borderBottom: "1px solid #f6f1f1" }}>
                          <td style={{ padding: "14px 12px 14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 11l3 3L22 4"/>
                                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{q.title}</span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 12px", fontSize: 13.5, fontWeight: 500, color: "#6a605e" }}>{q.courseName}</td>
                          <td style={{ padding: "14px 12px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{q.questionCount}</td>
                          <td style={{ padding: "14px 12px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{q.minPassingScore}%</td>
                          <td style={{ padding: "14px 12px", textAlign: "center", fontSize: 14, fontWeight: 600, color: "#6a605e" }}>{q.maxAttempts ?? "∞"}</td>
                          <td style={{ padding: "14px 12px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11.5, fontWeight: 800, color: st.color, background: st.bg, border: `1px solid ${st.border}`, padding: "4px 11px", borderRadius: 100 }}>
                              {QUIZ_STATUS_LABEL[q.status]}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px 14px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                              <Link
                                href={`/quizzes/novo?edit=${q.id}`}
                                style={{ ...actBtn, textDecoration: "none" }}
                                title="Editar"
                                className="hover:bg-[#f6f1f1]"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                              </Link>
                              <button
                                onClick={() => handleDuplicate(q)}
                                disabled={createMut.isPending}
                                style={actBtn}
                                title="Duplicar"
                                className="hover:bg-[#f6f1f1]"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                              </button>
                              <button
                                onClick={() => { setDeleteId(q.id); setDeleteQuiz(q); }}
                                style={{ ...actBtn, color: "#c98a8a" }}
                                title="Excluir"
                                className="hover:bg-[#fceeee] hover:text-[#CC1F1F]"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
          {!isLoading && quizzes.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#16100f" }}>Nenhum quiz criado ainda.</div>
              <Link href="/quizzes/novo" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 14, fontWeight: 700, color: "#fff", background: PRIMARY, padding: "11px 18px", borderRadius: 10, textDecoration: "none" }}>
                Criar primeiro quiz
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(20,10,10,0.45)", backdropFilter: "blur(2px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => { setDeleteId(null); setDeleteQuiz(null); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 420, boxShadow: "0 30px 70px rgba(0,0,0,0.3)", overflow: "hidden" }}
          >
            <div style={{ padding: "26px 26px 0", textAlign: "center" }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginTop: 16 }}>Excluir quiz</h2>
              <p style={{ fontSize: 14, lineHeight: 1.55, fontWeight: 500, color: "#6a605e", marginTop: 8 }}>
                {hasSubmissions
                  ? `Este quiz possui ${deleteQuiz!.submissionCount} resposta(s) registrada(s). Exclua as respostas antes de excluir o quiz.`
                  : <>Tem certeza que deseja excluir <strong style={{ color: "#16100f" }}>{deleteQuiz?.title}</strong>? Esta ação não pode ser desfeita.</>}
              </p>
            </div>
            <div style={{ padding: "24px 26px", display: "flex", gap: 12 }}>
              <button
                onClick={() => { setDeleteId(null); setDeleteQuiz(null); }}
                style={{ flex: 1, fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: 13, cursor: "pointer" }}
              >
                {hasSubmissions ? "Fechar" : "Cancelar"}
              </button>
              {!hasSubmissions && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMut.isPending}
                  style={{ flex: 1, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: 13, cursor: "pointer" }}
                >
                  {deleteMut.isPending ? "Excluindo…" : "Excluir"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
