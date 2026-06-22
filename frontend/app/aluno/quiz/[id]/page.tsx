"use client";

// TODO: integrar com GET /quizzes/:id, POST /quizzes/:id/submit
import { useState } from "react";
import Link from "next/link";
import { STUDENT_QUIZ_QUESTIONS } from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";
const MIN_SCORE_PCT = 70;

type QuizView = "start" | "quiz" | "result";

const START_STATS = [
  { label: "Questões", value: "10", color: PRIMARY, iconPath: ["M9 11l3 3L22 4", "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"] },
  { label: "Tempo limite", value: "15 min", color: "#b9842f", iconPath: ["M12 2a10 10 0 1 0 .01 0", "M12 6v6l4 2"] },
  { label: "Tentativas", value: "2 restantes", color: "#3a6ea5", iconPath: ["M3 2v6h6", "M3 8a9 9 0 1 0 2.6-5.6L3 8"] },
  { label: "Nota mínima", value: "70%", color: "#1f8a5b", iconPath: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4 12 14.01l-3-3"] },
];

function SmallIcon({ paths, color }: { paths: string[]; color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

export default function QuizPage() {
  const [view, setView] = useState<QuizView>("start");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const questions = STUDENT_QUIZ_QUESTIONS.slice(0, 10);
  const selected = answers[currentQ] ?? -1;

  function handleSubmit() {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    setView("result");
  }

  const correctCount = Object.entries(answers).filter(([i, a]) => questions[parseInt(i)]?.correct === a).length;
  const scorePct = Math.round((correctCount / questions.length) * 100);
  const approved = scorePct >= MIN_SCORE_PCT;

  const qPct = `${Math.round(((currentQ + 1) / questions.length) * 100)}%`;

  return (
    <div style={{ fontFamily: "Manrope, system-ui, sans-serif", color: "#16100f", minHeight: "100vh", background: "#f1eeed", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes ml-pop { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.06); } 100% { transform: scale(1); opacity: 1; } }
        .ml-pop { animation: ml-pop .4s ease; }
        @keyframes ml-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .ml-fade { animation: ml-fade-in .3s ease; }
      `}</style>

      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "14px clamp(16px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
        <Link href="/aluno/curso/1/aula/l7" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "#6a605e", textDecoration: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          Sair da avaliação
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 11, height: 11, border: "2.5px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: "#1a1414" }}>Maxi<span style={{ color: PRIMARY }}>Learn</span></span>
        </div>
        {view === "quiz" ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "#b9482f", background: "#fbeede", border: "1px solid #f3d9bf", padding: "8px 14px", borderRadius: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            12:48
          </div>
        ) : (
          <div style={{ width: 120 }} />
        )}
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "clamp(24px,4vw,48px) clamp(16px,4vw,40px)" }}>

        {/* START */}
        {view === "start" && (
          <div className="ml-fade" style={{ width: "100%", maxWidth: 560, background: "#fff", border: "1px solid #ece4e4", borderRadius: 20, overflow: "hidden", boxShadow: "0 18px 44px rgba(60,20,20,0.08)" }}>
            <div style={{ background: "linear-gradient(135deg,#16100f,#3a2422)", padding: 34, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -50, right: -30, width: 200, height: 200, background: "radial-gradient(circle, rgba(204,31,31,0.3), transparent 70%)", borderRadius: "50%" }} />
              <div style={{ position: "relative", width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div style={{ position: "relative", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#e8a5a5" }}>Segurança no Trabalho · Módulo 2</div>
              <h1 style={{ position: "relative", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", marginTop: 8 }}>Avaliação final — EPIs</h1>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                {START_STATS.map((s, i) => (
                  <div key={i} style={{ background: "#faf7f7", border: "1px solid #eadfdf", borderRadius: 13, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <SmallIcon paths={s.iconPath} color={s.color} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#8a807e" }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginTop: 8 }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fceeee", border: "1px solid #f6d6d6", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 11, marginBottom: 24 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <p style={{ fontSize: 13, lineHeight: 1.5, fontWeight: 600, color: "#7a3a3a" }}>
                  Você precisa de <strong style={{ fontWeight: 800 }}>70% de acerto</strong> para ser aprovado. Ao iniciar, o tempo começa a contar.
                </p>
              </div>
              <button
                onClick={() => setView("quiz")}
                type="button"
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontFamily: "inherit", fontSize: 15.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 13, padding: 16, cursor: "pointer", boxShadow: "0 10px 26px rgba(204,31,31,0.3)" }}
              >
                Iniciar avaliação
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {view === "quiz" && (
          <div className="ml-fade" style={{ width: "100%", maxWidth: 640 }}>
            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#16100f" }}>Questão {currentQ + 1} de {questions.length}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#8a807e" }}>{qPct} concluído</span>
            </div>
            <div style={{ height: 8, background: "#e3dada", borderRadius: 5, overflow: "hidden", marginBottom: 26 }}>
              <div style={{ height: "100%", width: qPct, background: PRIMARY, borderRadius: 5, transition: "width .3s" }} />
            </div>

            {/* Question card */}
            <div className="ml-fade" key={currentQ} style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 18, padding: "clamp(22px,3vw,32px)", boxShadow: "0 10px 30px rgba(60,20,20,0.06)" }}>
              <div style={{ display: "inline-flex", alignItems: "center", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: PRIMARY, background: "#fceeee", padding: "4px 11px", borderRadius: 100, marginBottom: 16 }}>
                Múltipla escolha
              </div>
              <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", lineHeight: 1.3 }}>{questions[currentQ].statement}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
                {questions[currentQ].options.map((opt, i) => {
                  const isSelected = selected === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers((a) => ({ ...a, [currentQ]: i }))}
                      type="button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        width: "100%",
                        padding: "16px 18px",
                        background: isSelected ? "#fceeee" : "#fff",
                        border: `1.5px solid ${isSelected ? PRIMARY : "#e6dede"}`,
                        borderRadius: 13,
                        cursor: "pointer",
                        transition: "all .15s",
                        fontFamily: "inherit",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: isSelected ? PRIMARY : "#f1ecec", color: isSelected ? "#fff" : "#8a807e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span style={{ flex: 1, textAlign: "left", fontSize: 15, fontWeight: 600, color: "#16100f" }}>{opt}</span>
                      {isSelected && (
                        <span style={{ flexShrink: 0, color: PRIMARY }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: 24 }}>
              <button
                onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                disabled={currentQ === 0}
                type="button"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: currentQ === 0 ? "#b3a6a6" : "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 12, padding: "13px 22px", cursor: currentQ === 0 ? "not-allowed" : "pointer" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Anterior
              </button>
              <div style={{ display: "flex", gap: 6 }}>
                {questions.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: i < currentQ ? PRIMARY : i === currentQ ? PRIMARY : "#d8cccc",
                      boxShadow: i === currentQ ? `0 0 0 3px rgba(204,31,31,0.2)` : "none",
                      cursor: "pointer",
                      transition: "background .2s",
                    }}
                  />
                ))}
              </div>
              {currentQ < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
                  type="button"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 12, padding: "13px 24px", cursor: "pointer", boxShadow: "0 8px 20px rgba(204,31,31,0.26)" }}
                >
                  Próxima
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  type="button"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: "#1f8a5b", border: "none", borderRadius: 12, padding: "13px 24px", cursor: "pointer", boxShadow: "0 8px 20px rgba(31,138,91,0.26)" }}
                >
                  Finalizar
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULT */}
        {view === "result" && (
          <div className="ml-fade" style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Score card */}
            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 20, overflow: "hidden", boxShadow: "0 18px 44px rgba(60,20,20,0.08)" }}>
              <div
                style={{
                  background: approved ? "linear-gradient(135deg,#1f8a5b,#43b787)" : "linear-gradient(135deg,#b9482f,#CC1F1F)",
                  padding: 34,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div className="ml-pop" style={{ position: "relative", width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {approved ? <path d="M20 6 9 17l-5-5"/> : <><path d="M18 6 6 18"/><path d="M6 6l12 12"/></>}
                  </svg>
                </div>
                <div style={{ position: "relative", fontSize: 13, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>Avaliação concluída</div>
                <div className="ml-pop" style={{ position: "relative", fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", marginTop: 6 }}>
                  {correctCount}/{questions.length}
                </div>
                <div style={{ position: "relative", fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 2 }}>
                  {approved ? "Aprovado! 🎉" : "Reprovado"}
                </div>
              </div>
              <div style={{ padding: "24px 26px", display: "flex", gap: 14 }}>
                {[
                  { label: "Acertos", value: correctCount },
                  { label: "Erros", value: questions.length - correctCount },
                  { label: "Mín. p/ aprovar", value: "70%" },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", background: "#faf7f7", border: "1px solid #eadfdf", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#16100f" }}>{s.value}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "0 26px 26px" }}>
                {approved ? (
                  <Link
                    href="/aluno/certificados"
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontFamily: "inherit", fontSize: 15, fontWeight: 800, color: "#fff", textDecoration: "none", background: PRIMARY, borderRadius: 13, padding: 15, boxShadow: "0 10px 24px rgba(204,31,31,0.28)" }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                    Ver certificado
                  </Link>
                ) : (
                  <button
                    onClick={() => { setView("start"); setAnswers({}); setCurrentQ(0); }}
                    type="button"
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontFamily: "inherit", fontSize: 15, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 13, padding: 15, cursor: "pointer", boxShadow: "0 10px 24px rgba(204,31,31,0.28)" }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M3 8a9 9 0 1 0 2.6-5.6L3 8"/></svg>
                    Tentar novamente
                  </button>
                )}
                <button
                  onClick={() => setView("start")}
                  type="button"
                  style={{ width: "100%", marginTop: 10, fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 12, padding: 13, cursor: "pointer" }}
                >
                  {approved ? "Voltar ao curso" : "Revisar aula antes"}
                </button>
              </div>
            </div>

            {/* Gabarito */}
            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid #f4eded" }}>
                <h3 style={{ fontSize: 15.5, fontWeight: 800, color: "#16100f" }}>Gabarito comentado</h3>
              </div>
              <div style={{ padding: "6px 22px" }}>
                {questions.map((q, i) => {
                  const userAns = answers[i] ?? -1;
                  const isCorrect = userAns === q.correct;
                  return (
                    <div key={q.id} style={{ display: "flex", gap: 13, padding: "15px 0", borderBottom: i < questions.length - 1 ? "1px solid #f6f1f1" : "none" }}>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: isCorrect ? "#1f8a5b" : PRIMARY,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 1,
                        }}
                      >
                        {isCorrect ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>
                        )}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f", lineHeight: 1.4 }}>{q.statement}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: isCorrect ? "#1f8a5b" : "#b9482f", marginTop: 5 }}>
                          Sua resposta: {userAns >= 0 ? q.options[userAns] : "Não respondida"}
                        </div>
                        {!isCorrect && (
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1f8a5b", marginTop: 2 }}>
                            Correta: {q.options[q.correct]}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
