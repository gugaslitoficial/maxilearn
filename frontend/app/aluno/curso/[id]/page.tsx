"use client";

// TODO: integrar com GET /courses/:id e GET /students/me/enrollment/:courseId
import { useState } from "react";
import Link from "next/link";
import { STUDENT_CATALOG, STUDENT_MODULES } from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";

const BADGE_STYLES = {
  done: { color: "#1f8a5b", bg: "#e8f5ee", border: "1px solid #cbe8d8", label: "Concluído" },
  progress: { color: "#b9842f", bg: "#fdf3e2", border: "1px solid #f3e1bf", label: "Em andamento" },
  locked: { color: "#8a807e", bg: "#f1ecec", border: "1px solid #e0d6d6", label: "Bloqueado" },
};

export default function CursoDetalhePage() {
  const course = STUDENT_CATALOG.find((c) => c.id === "1") ?? STUDENT_CATALOG[0];
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({ m1: true, m2: false, m3: false });

  function toggleModule(id: string) {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const OBJECTIVES = [
    "Identificar riscos no ambiente de trabalho",
    "Usar corretamente os EPIs",
    "Aplicar as normas regulamentadoras (NRs)",
    "Prevenir acidentes e incidentes",
    "Agir corretamente em emergências",
    "Promover a cultura de segurança",
  ];

  return (
    <div style={{ fontFamily: "Manrope, system-ui, sans-serif", color: "#16100f", minHeight: "100vh", background: "#f6f4f3" }}>

      {/* Top Nav */}
      <div style={{ background: "#1A1A1A", borderBottom: "1px solid #2a2424" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px clamp(20px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/aluno/explorar" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13.5, fontWeight: 700, color: "#cfc8c8", textDecoration: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Voltar ao catálogo
          </Link>
          <Link href="/aluno/dashboard" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 11, height: 11, border: "2.5px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>Maxi<span style={{ color: PRIMARY }}>Learn</span></span>
          </Link>
        </div>
      </div>

      {/* Course header */}
      <header style={{ background: "#1A1A1A", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -60, width: 380, height: 380, background: "radial-gradient(circle, rgba(204,31,31,0.22), transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "36px clamp(20px,4vw,40px) 40px", display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 280, height: 168, flexShrink: 0, borderRadius: 14, background: course.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}>
            <span style={{ fontSize: 56, fontWeight: 800, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.02em" }}>{course.tag}</span>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", padding: "4px 11px", borderRadius: 100 }}>{course.category}</span>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#1f8a5b", background: "#e8f5ee", padding: "4px 11px", borderRadius: 100 }}>{course.level}</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1 }}>{course.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${course.teacherColor},${course.teacherColor}cc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>{course.teacherInitials}</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#e6dede" }}>{course.teacher}</span>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: "#b8aeac" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {course.duration} de conteúdo
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: "#b8aeac" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                {course.totalLessons} aulas
              </span>
            </div>
            <div style={{ marginTop: 22, maxWidth: 440 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#b8aeac" }}>Seu progresso · {course.currentLesson} de {course.totalLessons} aulas</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: "#fff" }}>{course.progress}%</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.16)", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${course.progress}%`, background: "linear-gradient(90deg,#43b787,#1f8a5b)", borderRadius: 5 }} />
              </div>
            </div>
            <Link
              href={`/aluno/curso/${course.id}/aula/l7`}
              style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 9, fontSize: 15, fontWeight: 800, color: "#fff", textDecoration: "none", background: PRIMARY, borderRadius: 12, padding: "14px 28px", boxShadow: "0 10px 26px rgba(204,31,31,0.32)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
              Continuar curso
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <div
        style={{ maxWidth: 1180, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 56px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}
        className="curso-body"
      >
        <style>{`@media (max-width: 900px) { .curso-body { grid-template-columns: 1fr !important; } }`}</style>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>

          {/* Description */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 26 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginBottom: 12 }}>Sobre o curso</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, fontWeight: 500, color: "#4a4040" }}>
              Aprenda os fundamentos da segurança no ambiente de trabalho industrial: identificação de riscos, uso correto de equipamentos de proteção individual (EPIs), normas regulamentadoras e boas práticas de prevenção de acidentes. Um curso essencial para toda a equipe operacional da Maxi 1 Lubrificantes.
            </p>
          </div>

          {/* Objectives */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 26 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginBottom: 16 }}>O que você vai aprender</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }} className="objectives-grid">
              <style>{`@media (max-width: 600px) { .objectives-grid { grid-template-columns: 1fr !important; } }`}</style>
              {OBJECTIVES.map((o, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.45, fontWeight: 500, color: "#3a3030" }}>{o}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modules accordion */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "22px 26px", borderBottom: "1px solid #f4eded", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Conteúdo do curso</h2>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#8a807e" }}>3 módulos · 12 aulas</span>
            </div>
            {STUDENT_MODULES.map((m) => {
              const isOpen = openModules[m.id];
              const badgeStyle = BADGE_STYLES[m.badge];
              return (
                <div key={m.id} style={{ borderBottom: "1px solid #f6f1f1" }}>
                  <button
                    onClick={() => toggleModule(m.id)}
                    type="button"
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "18px 26px", background: isOpen ? "#fcfafa" : "#fff", border: "none", cursor: "pointer", textAlign: "left", transition: "background .15s" }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 7,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f1ecec",
                        color: "#6a605e",
                        transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "transform .2s",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>{m.title}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>{m.meta}</div>
                    </div>
                    <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 800, color: badgeStyle.color, background: badgeStyle.bg, border: badgeStyle.border, padding: "4px 11px", borderRadius: 100 }}>
                      {badgeStyle.label}
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: "4px 0 12px" }}>
                      {m.lessons.map((l) => (
                        <div
                          key={l.id}
                          style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 26px", background: l.status === "current" ? "#fdf6f6" : "transparent" }}
                        >
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background: l.status === "done" ? "#1f8a5b" : l.status === "current" ? "#fceeee" : "#f1ecec",
                              border: l.status === "current" ? `1.5px solid ${PRIMARY}` : "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {l.status === "done" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                            {l.status === "current" && <svg width="11" height="11" viewBox="0 0 24 24" fill={PRIMARY}><path d="M8 5v14l11-7z"/></svg>}
                            {l.status === "locked" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b3a6a6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                          </span>
                          <span style={{ flexShrink: 0, display: "flex", color: "#a89e9c" }}>
                            {l.type === "video" ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                            )}
                          </span>
                          {l.status === "current" ? (
                            <Link href={`/aluno/curso/1/aula/${l.id}`} style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 800, color: "#16100f", textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {l.title}
                            </Link>
                          ) : (
                            <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: l.status === "locked" ? "#a89e9c" : "#16100f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {l.title}
                            </span>
                          )}
                          <span style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 600, color: "#a89e9c" }}>{l.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Progress card */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 800, color: "#16100f", marginBottom: 18 }}>Seu progresso</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
              <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `conic-gradient(#1f8a5b 0% ${course.progress}%, #eef1ef ${course.progress}% 100%)` }} />
                <div style={{ position: "absolute", inset: 9, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#16100f" }}>
                  {course.progress}%
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{course.currentLesson} de {course.totalLessons} aulas</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>concluídas</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#faf7f7", border: "1px solid #eadfdf", borderRadius: 11, padding: "12px 14px" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#3a3030" }}>≈ 1h20 restantes</span>
            </div>
          </div>

          {/* Teacher card */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 800, color: "#16100f", marginBottom: 16 }}>Professor</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg,${course.teacherColor},${course.teacherColor}cc)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff" }}>
                {course.teacherInitials}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>{course.teacher}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e" }}>Especialista em Segurança do Trabalho</div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.55, fontWeight: 500, color: "#6a605e" }}>
              Engenheiro de segurança com 12 anos de experiência em ambientes industriais. Responsável pelos treinamentos de NRs na Maxi 1.
            </p>
          </div>

          {/* Certificate card (locked) */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 800, color: "#16100f", marginBottom: 16 }}>Certificado</h3>
            <div style={{ border: "1.5px dashed #e2d2d2", borderRadius: 13, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: "#faf7f7" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f1ecec", display: "flex", alignItems: "center", justifyContent: "center", color: "#b3a6a6", marginBottom: 12, position: "relative" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                <div style={{ position: "absolute", bottom: -4, right: -4, width: 22, height: 22, borderRadius: "50%", background: "#fff", border: "1px solid #ece4e4", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a807e" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#16100f" }}>Disponível ao concluir</div>
              <p style={{ fontSize: 12.5, lineHeight: 1.5, fontWeight: 500, color: "#8a807e", marginTop: 5 }}>
                Conclua 100% das aulas e seja aprovado no quiz final para emitir seu certificado.
              </p>
              <div style={{ width: "100%", height: 6, background: "#eef1ef", borderRadius: 4, overflow: "hidden", marginTop: 14 }}>
                <div style={{ height: "100%", width: `${course.progress}%`, background: "#1f8a5b", borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#8a807e", marginTop: 8 }}>
                Faltam {course.totalLessons - course.currentLesson} aulas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
