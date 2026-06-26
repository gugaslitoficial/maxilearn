"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLessonContextPreview } from "@/hooks/use-lesson";
import { useAuth } from "@/hooks/use-auth";
import { useQuizPreview } from "@/hooks/use-quiz-preview";
import { useCourseQuestions, useCreateCourseQuestion, useCreateReply, useDeleteCourseQuestion } from "@/hooks/use-course-questions";
import { PlayerSidebar } from "@/components/player/PlayerSidebar";
import { Toast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

const PRIMARY = "#CC1F1F";

type Tab = "mat" | "notes" | "disc";

interface MaterialItem {
  id?: string;
  title: string;
  url: string;
  type: string;
}

function Skeleton({ w, h, radius = 8 }: { w: string | number; h: number; radius?: number }) {
  return (
    <div style={{ width: w, height: h, borderRadius: radius, background: "linear-gradient(90deg,#2a2424 25%,#322a2a 50%,#2a2424 75%)", backgroundSize: "200% 100%", animation: "ml-shimmer 1.4s infinite" }} />
  );
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const embed = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return embed[1];
    }
  } catch {}
  return null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

export default function PreviewPlayerPage() {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>("mat");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Inline material editing
  const [editingMats, setEditingMats] = useState<MaterialItem[] | null>(null);
  const [editingMatIdx, setEditingMatIdx] = useState<number | null>(null);

  // Course questions (Dúvidas)
  const [newQuestion, setNewQuestion] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const { derived, isLoading } = useLessonContextPreview(courseId, lessonId);

  const backToEditHref = user?.role === "ADMIN"
    ? `/cursos/${courseId}/editar`
    : `/professor/cursos/${courseId}/editar`;

  const quizId = derived?.currentLesson?.type === "quiz"
    ? (derived.currentLesson.quiz?.id ?? null)
    : null;
  const quizPreviewQ = useQuizPreview(quizId);

  const courseQs = useCourseQuestions(lessonId ?? null);
  const createQuestionMut = useCreateCourseQuestion();
  const createReplyMut = useCreateReply();
  const deleteQuestionMut = useDeleteCourseQuestion();

  // Lesson materials mutation (inline edit)
  const saveMaterialsMut = useMutation({
    mutationFn: ({ moduleId, lId, materials }: { moduleId: string; lId: string; materials: MaterialItem[] }) =>
      api.patch(`/courses/${courseId}/modules/${moduleId}/lessons/${lId}`, { materials }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-preview", courseId] });
      setEditingMats(null);
      setEditingMatIdx(null);
      setToast("Materiais salvos com sucesso!");
    },
  });

  // Reset editing state when lesson changes
  useEffect(() => {
    setEditingMats(null);
    setEditingMatIdx(null);
    setNewQuestion("");
    setReplyingTo(null);
    setReplyBody("");
  }, [lessonId]);

  const tabStyle = (t: Tab): React.CSSProperties => ({
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: tab === t ? 800 : 700,
    padding: "11px 18px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderBottom: tab === t ? `2.5px solid ${PRIMARY}` : "2.5px solid transparent",
    color: tab === t ? "#fff" : "#8a807e",
    transition: "all .15s",
  });

  function startEditMaterials() {
    const mats = (derived?.currentLesson?.materials as MaterialItem[] | undefined) ?? [];
    setEditingMats(JSON.parse(JSON.stringify(mats)));
    setEditingMatIdx(null);
  }

  async function saveEditedMaterials() {
    if (!editingMats || !derived) return;
    const moduleId = derived.currentModule?.id;
    if (!moduleId) return;
    await saveMaterialsMut.mutateAsync({ moduleId, lId: lessonId, materials: editingMats });
  }

  async function handleAskQuestion() {
    if (!newQuestion.trim() || !courseId) return;
    try {
      await createQuestionMut.mutateAsync({ lessonId, courseId, question: newQuestion.trim() });
      setNewQuestion("");
    } catch {
      setToast("Erro ao enviar pergunta.");
    }
  }

  async function handleReply(questionId: string) {
    if (!replyBody.trim()) return;
    try {
      await createReplyMut.mutateAsync({ questionId, body: replyBody.trim(), lessonId });
      setReplyBody("");
      setReplyingTo(null);
    } catch {
      setToast("Erro ao enviar resposta.");
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    try {
      await deleteQuestionMut.mutateAsync({ questionId, lessonId });
    } catch {
      setToast("Erro ao excluir pergunta.");
    }
  }

  if (isLoading || !derived) {
    return (
      <div style={{ fontFamily: "Manrope, system-ui, sans-serif", minHeight: "100vh", background: "#121010", color: "#e6dede", display: "flex", flexDirection: "column" }}>
        <style>{`@keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        <div style={{ background: "#1e3a5f", borderBottom: "1px solid #2a4f7a", padding: "10px 28px", height: 44 }} />
        <div style={{ background: "#1a1616", borderBottom: "1px solid #2a2424", padding: "12px 28px" }}>
          <Skeleton w={300} h={20} />
        </div>
        <div style={{ flex: 1, display: "flex" }}>
          <div style={{ flex: 1, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
            <div style={{ width: "100%", maxWidth: 1100, aspectRatio: "16/9", background: "#1a1414", borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  const { course, currentLesson, currentModule, prevLesson, nextLesson, totalLessons, completedCount, progressPercent, modulesWithStatus } = derived;

  const lessonMaterials = (currentLesson?.materials as MaterialItem[] | undefined) ?? [];

  // ─── Quiz preview panel ──────────────────────────────────────────────────
  function renderQuizPreview() {
    if (!currentLesson?.quiz?.id) {
      return (
        <div style={{ width: "100%", maxWidth: 1100, minHeight: 260, background: "#111827", border: "1px solid #1e2a3a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#6a7a9a" }}>Quiz não configurado.</div>
        </div>
      );
    }
    if (quizPreviewQ.isLoading) {
      return (
        <div style={{ width: "100%", maxWidth: 1100, minHeight: 260, background: "#111827", border: "1px solid #1e2a3a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#6a7a9a" }}>Carregando quiz…</div>
        </div>
      );
    }
    const quiz = quizPreviewQ.data;
    if (!quiz) return null;

    return (
      <div style={{ width: "100%", maxWidth: 1100 }}>
        <div style={{ background: "#111827", border: "1px solid #1e2a3a", borderRadius: 14, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b8fd4", background: "rgba(107,143,212,0.12)", padding: "3px 10px", borderRadius: 100 }}>Quiz — Visualização do gabarito</div>
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#fff" }}>{quiz.title}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6a7a9a", marginTop: 4 }}>{quiz.questionCount} questões · Nota mínima: {quiz.minPassingScore}%</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {quiz.questions.map((q, qi) => (
            <div key={q.id} style={{ background: "#111827", border: "1px solid #1e2a3a", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6b8fd4", marginBottom: 10 }}>Q{qi + 1} · {q.type === "TRUE_FALSE" ? "V/F" : "Múltipla escolha"}{q.displayCount ? ` · mostra ${q.displayCount} opções` : ""}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.4, marginBottom: 14 }}>{q.statement}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt, oi) => (
                  <div
                    key={opt.id}
                    style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", background: opt.isCorrect ? "rgba(31,138,91,0.12)" : "#1a1f35", border: `1.5px solid ${opt.isCorrect ? "#1f8a5b" : "#2a3555"}`, borderRadius: 10 }}
                  >
                    <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: opt.isCorrect ? "#1f8a5b" : "#252e4a", color: opt.isCorrect ? "#fff" : "#6a7a9a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                      {opt.isCorrect
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        : String.fromCharCode(65 + oi)
                      }
                    </span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: opt.isCorrect ? 700 : 600, color: opt.isCorrect ? "#5eebb7" : "#c8d4e8" }}>{opt.text}</span>
                    {opt.isCorrect && <span style={{ fontSize: 11, fontWeight: 800, color: "#1f8a5b", background: "rgba(31,138,91,0.15)", padding: "2px 9px", borderRadius: 100 }}>CORRETA</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Manrope, system-ui, sans-serif", minHeight: "100vh", background: "#121010", color: "#e6dede", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .player-sidebar-desktop { display: flex !important; }
        @media (max-width: 1024px) { .player-sidebar-desktop { display: none !important; } .lg-only { display: flex !important; } }
      `}</style>

      {/* Preview banner */}
      <div style={{ background: "#1e3a5f", borderBottom: "1px solid #2a4f7a", padding: "9px clamp(16px,3vw,28px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7dbfff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#b8d9ff" }}>Modo de visualização — suas interações não geram progresso real</span>
        </div>
        <Link
          href={backToEditHref}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 800, color: "#fff", textDecoration: "none", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 7, padding: "6px 13px", flexShrink: 0 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Voltar para edição
        </Link>
      </div>

      {/* Topbar */}
      <header style={{ background: "#1a1616", borderBottom: "1px solid #2a2424", padding: "12px clamp(16px,3vw,28px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          <Link
            href={`/curso/${courseId}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#cfc8c8", textDecoration: "none", background: "#272121", border: "1px solid #332c2c", padding: "8px 13px", borderRadius: 9, flexShrink: 0 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Sair
          </Link>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#8a807e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {course.title}{currentModule ? ` › ${currentModule.title}` : ""}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentLesson?.title ?? ""}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button
            className="lg-only"
            onClick={() => setDrawerOpen(true)}
            style={{ display: "none", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#cfc8c8", background: "#272121", border: "1px solid #332c2c", padding: "8px 12px", borderRadius: 9, cursor: "pointer" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
            Conteúdo
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 11, height: 11, border: "2.5px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>Maxi<span style={{ color: PRIMARY }}>Learn</span></span>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>

        {/* MAIN */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Lesson content */}
          <div style={{ background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(12px,2vw,28px)" }}>
            {currentLesson?.type === "quiz" ? renderQuizPreview() : currentLesson?.type === "file" ? (
              <div style={{ width: "100%", maxWidth: 1100, background: "#161212", border: "1px solid #2a2424", borderRadius: 12, padding: "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8a807e" }}>Materiais da aula (file)</span>
                </div>
                {lessonMaterials.length === 0 ? (
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", fontStyle: "italic" }}>Nenhum material adicionado.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {lessonMaterials.map((mat, i) => (
                      <a key={mat.id ?? i} href={mat.url || "#"} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#221d1d", border: "1px solid #2a2424", borderRadius: 10, textDecoration: "none" }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#e6dede", background: "#3a3030", padding: "3px 8px", borderRadius: 5, flexShrink: 0 }}>{(mat.type ?? "link").toUpperCase()}</span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e6dede" }}>{mat.title || "Material sem nome"}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (() => {
              const ytId = currentLesson?.videoUrl ? extractYouTubeId(currentLesson.videoUrl) : null;
              if (ytId) return (
                <div style={{ width: "100%", maxWidth: 1100, aspectRatio: "16 / 9", borderRadius: 12, overflow: "hidden" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                  />
                </div>
              );
              if (currentLesson?.videoUrl) return (
                <div style={{ width: "100%", maxWidth: 1100, aspectRatio: "16 / 9", borderRadius: 12, overflow: "hidden", background: "#000" }}>
                  <video src={currentLesson.videoUrl} controls style={{ width: "100%", height: "100%", display: "block" }} />
                </div>
              );
              return (
                <div style={{ width: "100%", maxWidth: 1100, aspectRatio: "16 / 9", background: "linear-gradient(135deg,#1a1414,#2a2020)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>URL do vídeo não configurada</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>{currentLesson?.title}</div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Below player */}
          <div style={{ background: "#1a1616", flex: 1, padding: "24px clamp(16px,3vw,32px) 40px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>

              {/* Title row + nav */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 22 }}>
                <div style={{ minWidth: 0 }}>
                  {currentModule && <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e" }}>{course.title} › {currentModule.title}</div>}
                  <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", marginTop: 6 }}>{currentLesson?.title}</h1>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
                  <button
                    onClick={() => prevLesson && router.push(`/curso/${courseId}/aula/${prevLesson.id}`)}
                    disabled={!prevLesson}
                    type="button"
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: prevLesson ? "#cfc8c8" : "#4a4040", background: "#272121", border: "1px solid #332c2c", borderRadius: 10, padding: "11px 16px", cursor: prevLesson ? "pointer" : "not-allowed", opacity: prevLesson ? 1 : 0.5 }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Anterior
                  </button>
                  <button
                    onClick={() => nextLesson && router.push(`/curso/${courseId}/aula/${nextLesson.id}`)}
                    disabled={!nextLesson}
                    type="button"
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: nextLesson ? "#fff" : "#4a4040", background: "#272121", border: "1px solid #332c2c", borderRadius: 10, padding: "11px 16px", cursor: nextLesson ? "pointer" : "not-allowed", opacity: nextLesson ? 1 : 0.5 }}
                  >
                    Próxima
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #2a2424", marginBottom: 22 }}>
                {(["mat", "notes", "disc"] as Tab[]).map((t) => (
                  <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
                    {t === "mat" ? "Materiais" : t === "notes" ? "Anotações" : "Dúvidas"}
                    {t === "disc" && (courseQs.data?.length ?? 0) > 0 && (
                      <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 900, background: PRIMARY, color: "#fff", borderRadius: 100, padding: "2px 6px" }}>{courseQs.data!.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Materials tab */}
              {tab === "mat" && (
                <div style={{ maxWidth: 680 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: "#cfc8c8" }}>Materiais de apoio</span>
                    {!editingMats ? (
                      <button
                        onClick={startEditMaterials}
                        type="button"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "#cfc8c8", background: "#272121", border: "1px solid #332c2c", borderRadius: 8, padding: "7px 12px", cursor: "pointer" }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Editar materiais
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => { setEditingMats(null); setEditingMatIdx(null); }}
                          type="button"
                          style={{ fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "#8a807e", background: "transparent", border: "1px solid #332c2c", borderRadius: 8, padding: "7px 12px", cursor: "pointer" }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={saveEditedMaterials}
                          disabled={saveMaterialsMut.isPending}
                          type="button"
                          style={{ fontFamily: "inherit", fontSize: 12.5, fontWeight: 800, color: "#fff", background: "#1f8a5b", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", opacity: saveMaterialsMut.isPending ? 0.7 : 1 }}
                        >
                          {saveMaterialsMut.isPending ? "Salvando…" : "Salvar"}
                        </button>
                      </div>
                    )}
                  </div>

                  {!editingMats ? (
                    lessonMaterials.length === 0 ? (
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", fontStyle: "italic" }}>Nenhum material adicionado a esta aula.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {lessonMaterials.map((mat, i) => (
                          <a key={mat.id ?? i} href={mat.url || "#"} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#221d1d", border: "1px solid #2a2424", borderRadius: 10, textDecoration: "none" }}>
                            <span style={{ fontSize: 10, fontWeight: 900, color: "#e6dede", background: "#3a3030", padding: "3px 8px", borderRadius: 5, flexShrink: 0 }}>{(mat.type ?? "link").toUpperCase()}</span>
                            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e6dede", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mat.title || "Material sem nome"}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          </a>
                        ))}
                      </div>
                    )
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {editingMats.map((mat, i) => (
                        <div key={i} style={{ background: "#221d1d", border: `1.5px solid ${editingMatIdx === i ? PRIMARY : "#2a2424"}`, borderRadius: 12, overflow: "hidden" }}>
                          <div
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer" }}
                            onClick={() => setEditingMatIdx(editingMatIdx === i ? null : i)}
                          >
                            <span style={{ fontSize: 10, fontWeight: 900, color: "#e6dede", background: "#3a3030", padding: "3px 8px", borderRadius: 5, flexShrink: 0 }}>{(mat.type ?? "link").toUpperCase()}</span>
                            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#e6dede" }}>{mat.title || "Material sem nome"}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setEditingMats((prev) => prev!.filter((_, idx) => idx !== i)); }}
                              style={{ background: "transparent", border: "none", color: "#8a807e", cursor: "pointer", padding: 4, flexShrink: 0 }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                            </button>
                          </div>
                          {editingMatIdx === i && (
                            <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                              <input
                                value={mat.title}
                                onChange={(e) => setEditingMats((prev) => prev!.map((m, idx) => idx === i ? { ...m, title: e.target.value } : m))}
                                placeholder="Título"
                                style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "#e6dede", background: "#2a2424", border: "1px solid #3a3030", borderRadius: 8, padding: "8px 11px", outline: "none", width: "100%" }}
                              />
                              <input
                                value={mat.url}
                                onChange={(e) => setEditingMats((prev) => prev!.map((m, idx) => idx === i ? { ...m, url: e.target.value } : m))}
                                placeholder="URL"
                                style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "#e6dede", background: "#2a2424", border: "1px solid #3a3030", borderRadius: 8, padding: "8px 11px", outline: "none", width: "100%" }}
                              />
                              <select
                                value={mat.type}
                                onChange={(e) => setEditingMats((prev) => prev!.map((m, idx) => idx === i ? { ...m, type: e.target.value } : m))}
                                style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "#e6dede", background: "#2a2424", border: "1px solid #3a3030", borderRadius: 8, padding: "8px 11px", outline: "none" }}
                              >
                                {["pdf", "ppt", "doc", "link"].map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setEditingMats((prev) => [...prev!, { title: "", url: "", type: "link" }])}
                        style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#8a807e", background: "transparent", border: "1px dashed #3a3030", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                        Adicionar material
                      </button>
                    </div>
                  )}
                </div>
              )}

              {tab === "notes" && (
                <div style={{ maxWidth: 680 }}>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escreva suas anotações sobre esta aula..."
                    style={{ width: "100%", minHeight: 180, fontFamily: "inherit", fontSize: 14.5, lineHeight: 1.6, fontWeight: 500, color: "#e6dede", background: "#221d1d", border: "1px solid #322b2b", borderRadius: 13, padding: 16, outline: "none", resize: "vertical" }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#8a807e", marginTop: 8, display: "block" }}>Anotações em modo de visualização não são salvas.</span>
                </div>
              )}

              {/* Dúvidas tab */}
              {tab === "disc" && (
                <div style={{ maxWidth: 720 }}>
                  {/* New question form */}
                  <div style={{ background: "#221d1d", border: "1px solid #2a2424", borderRadius: 13, padding: "16px 18px", marginBottom: 20 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#cfc8c8", marginBottom: 10 }}>Fazer uma pergunta</div>
                    <textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Escreva sua dúvida sobre esta aula..."
                      rows={3}
                      style={{ width: "100%", fontFamily: "inherit", fontSize: 14, lineHeight: 1.6, fontWeight: 500, color: "#e6dede", background: "#2a2424", border: "1px solid #332c2c", borderRadius: 10, padding: "11px 14px", outline: "none", resize: "none" }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                      <button
                        onClick={handleAskQuestion}
                        disabled={!newQuestion.trim() || createQuestionMut.isPending}
                        type="button"
                        style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: "#fff", background: newQuestion.trim() ? PRIMARY : "#2a2424", border: "none", borderRadius: 9, padding: "10px 18px", cursor: newQuestion.trim() ? "pointer" : "not-allowed", opacity: createQuestionMut.isPending ? 0.7 : 1, transition: "background .15s" }}
                      >
                        {createQuestionMut.isPending ? "Enviando…" : "Enviar pergunta"}
                      </button>
                    </div>
                  </div>

                  {/* Questions list */}
                  {courseQs.isLoading && (
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e" }}>Carregando perguntas…</div>
                  )}
                  {!courseQs.isLoading && (!courseQs.data || courseQs.data.length === 0) && (
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", fontStyle: "italic" }}>Nenhuma dúvida enviada para esta aula ainda.</p>
                  )}
                  {(courseQs.data ?? []).map((cq) => (
                    <div key={cq.id} style={{ background: "#1e1818", border: "1px solid #2a2424", borderRadius: 13, marginBottom: 14, overflow: "hidden" }}>
                      <div style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#3a3030", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#cfc8c8", flexShrink: 0 }}>
                            {cq.author.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#e6dede" }}>{cq.author.name}</div>
                            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#6a605e" }}>{timeAgo(cq.createdAt)}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteQuestion(cq.id)}
                            type="button"
                            style={{ background: "transparent", border: "none", color: "#6a605e", cursor: "pointer", padding: 4, flexShrink: 0 }}
                            title="Excluir pergunta"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#cfc8c8", lineHeight: 1.5, margin: 0 }}>{cq.question}</p>
                      </div>

                      {/* Replies */}
                      {cq.replies.length > 0 && (
                        <div style={{ borderTop: "1px solid #2a2424", background: "#181414", padding: "10px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                          {cq.replies.map((reply) => (
                            <div key={reply.id} style={{ display: "flex", gap: 10 }}>
                              <div style={{ width: 24, height: 24, borderRadius: 6, background: "#2a2424", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#cfc8c8", flexShrink: 0, marginTop: 1 }}>
                                {reply.author.name.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: "#e6dede" }}>{reply.author.name} <span style={{ fontWeight: 600, color: "#6a605e", marginLeft: 6 }}>{timeAgo(reply.createdAt)}</span></div>
                                <p style={{ fontSize: 13.5, fontWeight: 600, color: "#cfc8c8", lineHeight: 1.5, margin: "4px 0 0" }}>{reply.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply form */}
                      <div style={{ borderTop: "1px solid #2a2424", padding: "10px 18px" }}>
                        {replyingTo === cq.id ? (
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                            <textarea
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              placeholder="Escreva uma resposta..."
                              rows={2}
                              autoFocus
                              style={{ flex: 1, fontFamily: "inherit", fontSize: 13, lineHeight: 1.5, fontWeight: 500, color: "#e6dede", background: "#2a2424", border: "1px solid #332c2c", borderRadius: 8, padding: "8px 11px", outline: "none", resize: "none" }}
                            />
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <button
                                onClick={() => handleReply(cq.id)}
                                disabled={!replyBody.trim() || createReplyMut.isPending}
                                type="button"
                                style={{ fontFamily: "inherit", fontSize: 12.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", opacity: createReplyMut.isPending ? 0.7 : 1 }}
                              >
                                Enviar
                              </button>
                              <button
                                onClick={() => { setReplyingTo(null); setReplyBody(""); }}
                                type="button"
                                style={{ fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#8a807e", background: "transparent", border: "none", cursor: "pointer" }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setReplyingTo(cq.id); setReplyBody(""); }}
                            type="button"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "#8a807e", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Responder
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR — desktop */}
        {sidebarOpen && (
          <aside className="player-sidebar-desktop" style={{ width: 340, flexShrink: 0, background: "#1a1616", borderLeft: "1px solid #2a2424", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <PlayerSidebar
              courseId={courseId}
              currentLessonId={lessonId}
              modulesWithStatus={modulesWithStatus}
              completedCount={completedCount}
              totalLessons={totalLessons}
              progressPercent={progressPercent}
              onClose={() => setSidebarOpen(false)}
              lessonHref={(cId, lId) => `/curso/${cId}/aula/${lId}`}
              previewMode
            />
          </aside>
        )}

        {!sidebarOpen && (
          <button
            className="player-sidebar-desktop"
            onClick={() => setSidebarOpen(true)}
            type="button"
            style={{ width: 48, flexShrink: 0, background: "#1a1616", border: "none", borderLeft: "1px solid #2a2424", color: "#cfc8c8", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 20 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span style={{ writingMode: "vertical-rl", fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", color: "#8a807e", textTransform: "uppercase" }}>Conteúdo do curso</span>
          </button>
        )}

        {drawerOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50 }} onClick={() => setDrawerOpen(false)}>
            <aside style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 320, background: "#1a1616", borderLeft: "1px solid #2a2424", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
              <PlayerSidebar
                courseId={courseId}
                currentLessonId={lessonId}
                modulesWithStatus={modulesWithStatus}
                completedCount={completedCount}
                totalLessons={totalLessons}
                progressPercent={progressPercent}
                onClose={() => setDrawerOpen(false)}
                lessonHref={(cId, lId) => `/curso/${cId}/aula/${lId}`}
                previewMode
              />
            </aside>
          </div>
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
