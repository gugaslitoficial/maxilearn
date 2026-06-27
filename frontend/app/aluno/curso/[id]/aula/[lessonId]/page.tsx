"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLessonContext, useMarkLessonComplete } from "@/hooks/use-lesson";
import { useQuizStudent, useSubmitQuizById } from "@/hooks/use-quiz-student";
import type { SubmitResult, QuizOption, QuizQuestion } from "@/hooks/use-quiz-student";
import { PlayerSidebar } from "@/components/player/PlayerSidebar";
import { Toast } from "@/components/ui/Toast";

const PRIMARY = "#CC1F1F";

type Tab = "mat" | "notes" | "disc";
type QuizView = "idle" | "start" | "answering" | "result";

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

function selectOptions(options: QuizOption[], displayCount?: number): QuizOption[] {
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  if (!displayCount || displayCount >= options.length) return shuffled;
  return shuffled.slice(0, displayCount);
}

export default function PlayerAulaPage() {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("mat");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Quiz inline state
  const [quizView, setQuizView] = useState<QuizView>("idle");
  const [currentQ, setCurrentQ] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<SubmitResult | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, QuizOption[]>>({});
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);

  // Certificate modal
  const [showCertModal, setShowCertModal] = useState(false);

  const videoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoPlayedRef = useRef(false);

  const { derived, isLoading } = useLessonContext(courseId, lessonId);
  const markComplete = useMarkLessonComplete(courseId);

  const quizId = derived?.currentLesson?.type === "quiz"
    ? (derived.currentLesson.quiz?.id ?? null)
    : null;
  const quizQ = useQuizStudent(quizId);
  const submitMut = useSubmitQuizById(quizId);

  // Reset state when navigating to a different lesson
  useEffect(() => {
    setQuizView("idle");
    setCurrentQ(0);
    setQuizAnswers({});
    setQuizResult(null);
    setShuffledOptions({});
    setShuffledQuestions([]);
    videoPlayedRef.current = false;
    if (videoTimerRef.current) {
      clearTimeout(videoTimerRef.current);
      videoTimerRef.current = null;
    }
  }, [lessonId]);

  const isLastLesson = derived ? derived.nextLesson === null : false;
  const hasCertificate = derived
    ? (derived.course.certificateType !== "none" && derived.course.certificateType !== undefined
       ? true
       : derived.course.issueCertificate)
    : false;

  const autoComplete = useCallback(async () => {
    if (!derived || derived.isCompleted) return;
    try {
      await markComplete.mutateAsync(lessonId);
      if (isLastLesson && hasCertificate) {
        setShowCertModal(true);
      }
    } catch {
      // silent — backend may already have it as completed
    }
  }, [derived, markComplete, lessonId, isLastLesson, hasCertificate]);

  // Video: 30s auto-complete timer
  function startVideoTimer() {
    if (videoPlayedRef.current || derived?.isCompleted) return;
    videoPlayedRef.current = true;
    videoTimerRef.current = setTimeout(() => {
      autoComplete();
    }, 30_000);
  }

  function buildShuffledState(data: typeof quizQ.data) {
    if (!data) return;
    const qs = data.shuffleQuestions
      ? [...data.questions].sort(() => Math.random() - 0.5)
      : [...data.questions];
    const opts: Record<string, QuizOption[]> = {};
    for (const q of qs) {
      opts[q.id] = selectOptions(q.options, q.displayCount);
    }
    setShuffledQuestions(qs);
    setShuffledOptions(opts);
  }

  // Quiz init: compute shuffled questions/options when entering quiz
  function initQuiz() {
    if (!quizQ.data) return;
    buildShuffledState(quizQ.data);
    setCurrentQ(0);
    setQuizAnswers({});
    setQuizView("start");
  }

  async function handleQuizSubmit() {
    if (!quizQ.data) return;
    const qs = shuffledQuestions.length > 0 ? shuffledQuestions : quizQ.data.questions;
    const payload = qs.map((q) => ({
      questionId: q.id,
      selectedOptionId: quizAnswers[q.id] ?? "",
    })).filter((a) => a.selectedOptionId);
    try {
      const res = await submitMut.mutateAsync(payload);
      setQuizResult(res);
      setQuizView("result");
      // Auto-mark lesson complete (pass or fail)
      await autoComplete();
    } catch {
      setToast("Erro ao enviar o quiz. Tente novamente.");
    }
  }

  function handleQuizRetry() {
    if (!quizQ.data) return;
    buildShuffledState(quizQ.data);
    setCurrentQ(0);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizView("start");
  }

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

  if (isLoading || !derived) {
    return (
      <div style={{ fontFamily: "Manrope, system-ui, sans-serif", minHeight: "100vh", background: "#121010", color: "#e6dede", display: "flex", flexDirection: "column" }}>
        <style>{`@keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
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

  const { course, currentLesson, currentModule, prevLesson, nextLesson, isCompleted, totalLessons, completedCount, progressPercent, modulesWithStatus } = derived;

  // ─── Quiz panel (inline) ─────────────────────────────────────────────────
  const quiz = quizQ.data;
  const questions = shuffledQuestions.length > 0 ? shuffledQuestions : (quiz?.questions ?? []);
  const displayedOptions = (qId: string) => shuffledOptions[qId] ?? [];
  const selectedForCurrent = questions[currentQ] ? (quizAnswers[questions[currentQ].id] ?? "") : "";
  const allAnswered = questions.length > 0 && questions.every((q) => quizAnswers[q.id]);
  const answeredCount = questions.filter((q) => quizAnswers[q.id]).length;
  const qPct = questions.length > 0 ? `${Math.round(((currentQ + 1) / questions.length) * 100)}%` : "0%";
  const correctAnswers = quizResult?.answers ?? [];

  function renderQuizPanel() {
    if (!currentLesson?.quiz?.id) {
      return (
        <div style={{ width: "100%", maxWidth: 1100, minHeight: 260, background: "#111827", border: "1px solid #1e2a3a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18, padding: 40 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#6a7a9a" }}>Quiz não configurado nesta aula.</div>
        </div>
      );
    }

    if (quizQ.isLoading) {
      return (
        <div style={{ width: "100%", maxWidth: 1100, minHeight: 260, background: "#111827", border: "1px solid #1e2a3a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#6a7a9a" }}>Carregando quiz…</div>
        </div>
      );
    }

    // IDLE
    if (quizView === "idle") {
      return (
        <div style={{ width: "100%", maxWidth: 1100, minHeight: 260, background: "#111827", border: "1px solid #1e2a3a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18, padding: 40 }}>
          <div style={{ width: 68, height: 68, borderRadius: 18, background: "#1e2a3a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6b8fd4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b8fd4", marginBottom: 10 }}>Quiz</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{quiz?.title ?? currentLesson?.title}</div>
            {quiz && <div style={{ fontSize: 13.5, fontWeight: 600, color: "#6a7a9a", marginTop: 6 }}>{quiz.questionCount} questões · {quiz.minPassingScore}% para aprovação</div>}
          </div>
          {quiz && (
            quiz.canAttempt ? (
              <button onClick={initQuiz} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "inherit", fontSize: 15, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 12, padding: "14px 28px", cursor: "pointer", boxShadow: "0 10px 24px rgba(204,31,31,0.3)" }}>
                Iniciar quiz
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            ) : (
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#6a7a9a" }}>Limite de tentativas atingido.</div>
            )
          )}
        </div>
      );
    }

    // START
    if (quizView === "start" && quiz) {
      return (
        <div style={{ width: "100%", maxWidth: 640, margin: "0 auto", background: "#111827", border: "1px solid #1e2a3a", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg,#1a1f35,#2d3a5a)", padding: "28px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#9fb4d8", marginBottom: 6 }}>{quiz.courseName}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{quiz.title}</div>
          </div>
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Questões", value: String(quiz.questionCount) },
                { label: "Nota mínima", value: `${quiz.minPassingScore}%` },
                { label: "Tentativas usadas", value: String(quiz.attemptCount) },
                { label: "Restam", value: quiz.attemptsRemaining === null ? "∞" : String(quiz.attemptsRemaining) },
              ].map((s, i) => (
                <div key={i} style={{ background: "#1e2a3a", borderRadius: 11, padding: "13px 15px" }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#6a7a9a", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{s.value}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setQuizView("answering")}
              type="button"
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontFamily: "inherit", fontSize: 15, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 13, padding: 15, cursor: "pointer", boxShadow: "0 10px 24px rgba(204,31,31,0.3)" }}
            >
              Começar
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      );
    }

    // ANSWERING
    if (quizView === "answering" && quiz) {
      const q = questions[currentQ];
      const opts = displayedOptions(q.id);
      return (
        <div style={{ width: "100%", maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>Questão {currentQ + 1} de {questions.length}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#6a7a9a" }}>{answeredCount} respondidas</span>
          </div>
          <div style={{ height: 6, background: "#1e2a3a", borderRadius: 4, overflow: "hidden", marginBottom: 22 }}>
            <div style={{ height: "100%", width: qPct, background: PRIMARY, borderRadius: 4, transition: "width .3s" }} />
          </div>
          <div key={`q-${currentQ}`} style={{ background: "#111827", border: "1px solid #1e2a3a", borderRadius: 18, padding: "clamp(20px,3vw,30px)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "#6b8fd4", background: "rgba(107,143,212,0.12)", padding: "4px 11px", borderRadius: 100, marginBottom: 14 }}>
              {q.type === "TRUE_FALSE" ? "Verdadeiro ou Falso" : "Múltipla escolha"}
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", lineHeight: 1.3 }}>{q.statement}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
              {opts.map((opt, i) => {
                const isSel = selectedForCurrent === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setQuizAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                    type="button"
                    style={{ display: "flex", alignItems: "center", gap: 13, width: "100%", minHeight: 48, padding: "14px 16px", background: isSel ? "rgba(204,31,31,0.15)" : "#1a1f35", border: `1.5px solid ${isSel ? PRIMARY : "#2a3555"}`, borderRadius: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all .15s" }}
                  >
                    <span style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: isSel ? PRIMARY : "#252e4a", color: isSel ? "#fff" : "#6a7a9a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: isSel ? "#fff" : "#c8d4e8" }}>{opt.text}</span>
                    {isSel && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: 20 }}>
            <button
              onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
              disabled={currentQ === 0}
              type="button"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#c8d4e8", background: "#1a1f35", border: "1px solid #2a3555", borderRadius: 11, padding: "12px 18px", cursor: currentQ === 0 ? "not-allowed" : "pointer", opacity: currentQ === 0 ? 0.4 : 1 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Anterior
            </button>
            <div style={{ display: "flex", gap: 5 }}>
              {questions.map((q, i) => (
                <span
                  key={q.id}
                  onClick={() => setCurrentQ(i)}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: quizAnswers[q.id] ? "#1f8a5b" : i === currentQ ? PRIMARY : "#2a3555", boxShadow: i === currentQ ? `0 0 0 3px rgba(204,31,31,0.2)` : "none", cursor: "pointer" }}
                />
              ))}
            </div>
            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
                type="button"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: "12px 20px", cursor: "pointer" }}
              >
                Próxima
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            ) : (
              <button
                onClick={handleQuizSubmit}
                disabled={!allAnswered || submitMut.isPending}
                type="button"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: "#fff", background: allAnswered ? "#1f8a5b" : "#2a3555", border: "none", borderRadius: 11, padding: "12px 20px", cursor: allAnswered && !submitMut.isPending ? "pointer" : "not-allowed", opacity: submitMut.isPending ? 0.7 : 1 }}
              >
                {submitMut.isPending ? "Enviando…" : "Finalizar"}
                {!submitMut.isPending && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
              </button>
            )}
          </div>
        </div>
      );
    }

    // RESULT
    if (quizView === "result" && quizResult && quiz) {
      return (
        <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: quizResult.passed ? "linear-gradient(135deg,#1f8a5b,#43b787)" : "linear-gradient(135deg,#b9482f,#CC1F1F)", borderRadius: 18, padding: "28px 32px", textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {quizResult.passed ? <path d="M20 6 9 17l-5-5"/> : <><path d="M18 6 6 18"/><path d="M6 6l12 12"/></>}
              </svg>
            </div>
            <div style={{ fontSize: 42, fontWeight: 800, color: "#fff" }}>{quizResult.score}%</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginTop: 4 }}>{quizResult.passed ? "Aprovado!" : "Não aprovado"}</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {nextLesson ? (
              <button
                onClick={() => router.push(`/aluno/curso/${courseId}/aula/${nextLesson.id}`)}
                type="button"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 12, padding: 14, cursor: "pointer" }}
              >
                Próxima aula
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            ) : (
              <button
                onClick={() => router.push(`/aluno/curso/${courseId}`)}
                type="button"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: "#1f8a5b", border: "none", borderRadius: 12, padding: 14, cursor: "pointer" }}
              >
                Concluir curso
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </button>
            )}
            {!quizResult.passed && quiz.canAttempt && (quizResult.attemptsRemaining === null || quizResult.attemptsRemaining > 0) && (
              <button
                onClick={handleQuizRetry}
                type="button"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#fff", background: "#1a1f35", border: "1px solid #2a3555", borderRadius: 12, padding: "14px 18px", cursor: "pointer" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M3 8a9 9 0 1 0 2.6-5.6L3 8"/></svg>
                Tentar novamente
              </button>
            )}
          </div>
          {correctAnswers.length > 0 && (
            <div style={{ background: "#111827", border: "1px solid #1e2a3a", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "15px 20px", borderBottom: "1px solid #1e2a3a", fontSize: 14, fontWeight: 800, color: "#fff" }}>Gabarito</div>
              <div style={{ padding: "6px 20px" }}>
                {questions.map((q, i) => {
                  const g = correctAnswers.find((a) => a.questionId === q.id);
                  const isCorrect = g?.isCorrect ?? false;
                  const selected = (shuffledOptions[q.id] ?? q.options).find((o) => o.id === quizAnswers[q.id]);
                  return (
                    <div key={q.id} style={{ display: "flex", gap: 12, padding: "13px 0", borderBottom: i < questions.length - 1 ? "1px solid #1e2a3a" : "none" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: isCorrect ? "#1f8a5b" : PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                        {isCorrect
                          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        }
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#c8d4e8", lineHeight: 1.4 }}>{q.statement}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: isCorrect ? "#1f8a5b" : "#e07070", marginTop: 4 }}>
                          Sua resposta: {selected?.text ?? "Não respondida"}
                        </div>
                        {!isCorrect && g?.correctOptionText && (
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1f8a5b", marginTop: 2 }}>Correta: {g.correctOptionText}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  }

  return (
    <div style={{ fontFamily: "Manrope, system-ui, sans-serif", minHeight: "100vh", background: "#121010", color: "#e6dede", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes ml-cert-in { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        .player-sidebar-desktop { display: flex !important; }
        @media (max-width: 1024px) { .player-sidebar-desktop { display: none !important; } .lg-only { display: flex !important; } }
      `}</style>

      {/* Certificate modal */}
      {showCertModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#1a1616", border: "1px solid #2a2424", borderRadius: 20, padding: "40px 36px", maxWidth: 440, width: "100%", textAlign: "center", animation: "ml-cert-in .35s ease" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#1f8a5b,#43b787)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#43b787", marginBottom: 10 }}>Parabéns!</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Curso concluído!</h2>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 10, lineHeight: 1.6 }}>
              Você finalizou <strong style={{ color: "#e6dede" }}>{course.title}</strong>. Seu certificado já está disponível.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
              <Link
                href="/aluno/certificados"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontFamily: "inherit", fontSize: 15, fontWeight: 800, color: "#fff", textDecoration: "none", background: "#1f8a5b", borderRadius: 12, padding: 14 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                Ver certificado
              </Link>
              <button
                onClick={() => { setShowCertModal(false); router.push(`/aluno/curso/${courseId}`); }}
                type="button"
                style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#cfc8c8", background: "transparent", border: "1px solid #332c2c", borderRadius: 12, padding: 13, cursor: "pointer" }}
              >
                Voltar ao curso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <header style={{ background: "#1a1616", borderBottom: "1px solid #2a2424", padding: "12px clamp(16px,3vw,28px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          <Link href={`/aluno/curso/${courseId}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#cfc8c8", textDecoration: "none", background: "#272121", border: "1px solid #332c2c", padding: "8px 13px", borderRadius: 9, flexShrink: 0 }}>
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
          <button className="lg-only" onClick={() => setDrawerOpen(true)} style={{ display: "none", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#cfc8c8", background: "#272121", border: "1px solid #332c2c", padding: "8px 12px", borderRadius: 9, cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
            Conteúdo
          </button>
          <Link href="/aluno/dashboard" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 11, height: 11, border: "2.5px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>Maxi<span style={{ color: PRIMARY }}>Learn</span></span>
          </Link>
        </div>
      </header>

      {/* Workspace */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>

        {/* MAIN */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Lesson content */}
          <div style={{ background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(12px,2vw,28px)" }}>
            {currentLesson?.type === "quiz" ? renderQuizPanel() : currentLesson?.type === "file" ? (
              <div style={{ width: "100%", maxWidth: 1100, background: "#161212", border: "1px solid #2a2424", borderRadius: 12, padding: "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8a807e" }}>Materiais</span>
                </div>
                {(!currentLesson?.materials || currentLesson.materials.length === 0) ? (
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", fontStyle: "italic" }}>Nenhum material adicionado a esta aula.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {currentLesson.materials.map((mat, i) => (
                      <a
                        key={mat.id ?? i}
                        href={mat.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => autoComplete()}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#221d1d", border: "1px solid #2a2424", borderRadius: 10, textDecoration: "none" }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#e6dede", background: "#3a3030", padding: "3px 8px", borderRadius: 5, flexShrink: 0 }}>{(mat.type ?? "link").toUpperCase()}</span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e6dede", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mat.title || "Material sem nome"}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (() => {
              const ytId = currentLesson?.videoUrl ? extractYouTubeId(currentLesson.videoUrl) : null;
              if (ytId) return (
                <div
                  style={{ width: "100%", maxWidth: 1100, aspectRatio: "16 / 9", borderRadius: 12, overflow: "hidden" }}
                  onClick={startVideoTimer}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                    onLoad={startVideoTimer}
                  />
                </div>
              );
              if (currentLesson?.videoUrl) return (
                <div style={{ width: "100%", maxWidth: 1100, aspectRatio: "16 / 9", borderRadius: 12, overflow: "hidden", background: "#000" }}>
                  <video
                    src={currentLesson.videoUrl}
                    controls
                    style={{ width: "100%", height: "100%", display: "block" }}
                    onPlay={startVideoTimer}
                    onEnded={autoComplete}
                  />
                </div>
              );
              return (
                <div style={{ width: "100%", maxWidth: 1100, aspectRatio: "16 / 9", background: "linear-gradient(135deg,#1a1414,#2a2020)", borderRadius: 12, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(204,31,31,0.16), transparent 65%)" }} />
                  <div style={{ position: "relative", textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Vídeo não configurado</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>{currentLesson?.title}</div>
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
                  {isCompleted && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 800, color: "#1f8a5b", background: "rgba(31,138,91,0.12)", border: "1.5px solid rgba(31,138,91,0.3)", borderRadius: 9, padding: "9px 14px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      Concluída
                    </span>
                  )}
                  <button
                    onClick={() => prevLesson && router.push(`/aluno/curso/${courseId}/aula/${prevLesson.id}`)}
                    disabled={!prevLesson}
                    type="button"
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: prevLesson ? "#cfc8c8" : "#4a4040", background: "#272121", border: "1px solid #332c2c", borderRadius: 10, padding: "11px 16px", cursor: prevLesson ? "pointer" : "not-allowed", opacity: prevLesson ? 1 : 0.5 }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Anterior
                  </button>
                  <button
                    onClick={() => nextLesson && router.push(`/aluno/curso/${courseId}/aula/${nextLesson.id}`)}
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
                    {t === "mat" ? "Materiais" : t === "notes" ? "Anotações" : "Discussão"}
                  </button>
                ))}
              </div>

              {tab === "mat" && (
                <div style={{ maxWidth: 680 }}>
                  {(!currentLesson?.materials || currentLesson.materials.length === 0) ? (
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", fontStyle: "italic" }}>Nenhum material disponível para esta aula.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {currentLesson.materials.map((mat, i) => (
                        <a key={mat.id ?? i} href={mat.url || "#"} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#221d1d", border: "1px solid #2a2424", borderRadius: 10, textDecoration: "none" }}>
                          <span style={{ fontSize: 10, fontWeight: 900, color: "#e6dede", background: "#3a3030", padding: "3px 8px", borderRadius: 5, flexShrink: 0 }}>{(mat.type ?? "link").toUpperCase()}</span>
                          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e6dede", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mat.title || "Material sem nome"}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      ))}
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
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#8a807e", marginTop: 8, display: "block" }}>Suas anotações são privadas e salvas localmente.</span>
                </div>
              )}

              {tab === "disc" && (
                <div style={{ maxWidth: 680 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", fontStyle: "italic" }}>Fórum de discussão em breve.</p>
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
              lessonHref={(cId, lId) => `/aluno/curso/${cId}/aula/${lId}`}
            />
          </aside>
        )}

        {!sidebarOpen && (
          <button className="player-sidebar-desktop" onClick={() => setSidebarOpen(true)} type="button" style={{ width: 48, flexShrink: 0, background: "#1a1616", border: "none", borderLeft: "1px solid #2a2424", color: "#cfc8c8", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 20 }}>
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
                lessonHref={(cId, lId) => `/aluno/curso/${cId}/aula/${lId}`}
              />
            </aside>
          </div>
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
