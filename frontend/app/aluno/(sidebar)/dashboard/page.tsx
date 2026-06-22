// TODO: integrar com GET /students/me/dashboard (progresso, atividades, cursos)
import Link from "next/link";
import { STUDENT_CATALOG, STUDENT_COMPLETED_COURSES, STUDENT_ACTIVITIES } from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";

const featuredCourse = STUDENT_CATALOG.find((c) => c.id === "1")!;
const inProgress = STUDENT_CATALOG.filter((c) => c.status === "progress");

export default function AlunoDashboardPage() {
  return (
    <>
      {/* Header */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #ece4e4",
          padding: "22px clamp(20px,3vw,36px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
            Olá, Ana! Continue de onde parou 👋
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>
            Você está a 2 aulas de concluir mais um curso.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1f8a5b", letterSpacing: "-0.02em" }}>🔥 12</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#8a807e" }}>dias seguidos</div>
          </div>
          <div style={{ width: 1, height: 32, background: "#ece4e4" }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#16100f", letterSpacing: "-0.02em" }}>3</div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#8a807e" }}>certificados</div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div
        style={{
          flex: 1,
          padding: "clamp(20px,3vw,32px)",
          display: "grid",
          gridTemplateColumns: "1fr clamp(260px,320px,320px)",
          gap: 22,
          alignItems: "start",
        }}
        className="aluno-dashboard-grid"
      >
        <style>{`
          @media (max-width: 900px) {
            .aluno-dashboard-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26, minWidth: 0 }}>

          {/* Featured — continue */}
          <div
            style={{
              position: "relative",
              background: "linear-gradient(120deg,#16100f 0%,#3a2422 100%)",
              borderRadius: 18,
              padding: 28,
              overflow: "hidden",
              boxShadow: "0 18px 44px rgba(40,20,18,0.22)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -40,
                width: 260,
                height: 260,
                background: "radial-gradient(circle, rgba(204,31,31,0.30), transparent 70%)",
                borderRadius: "50%",
              }}
            />
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#e8a5a5" }}>
                  Continue assistindo
                </span>
                <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", marginTop: 8, lineHeight: 1.2 }}>
                  {featuredCourse.title}
                </h2>
                <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.72)", marginTop: 6 }}>
                  Módulo 2 · Aula {featuredCourse.currentLesson} — Equipamentos de proteção individual
                </p>
                <div style={{ marginTop: 18, maxWidth: 380 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>Progresso do curso</span>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: "#fff" }}>{featuredCourse.progress}%</span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.16)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${featuredCourse.progress}%`, background: "linear-gradient(90deg,#43b787,#1f8a5b)", borderRadius: 5 }} />
                  </div>
                </div>
                <Link
                  href={`/aluno/curso/${featuredCourse.id}`}
                  style={{
                    marginTop: 22,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: "#16100f",
                    textDecoration: "none",
                    background: "#fff",
                    borderRadius: 11,
                    padding: "13px 24px",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#16100f"><path d="M8 5v14l11-7z"/></svg>
                  Continuar
                </Link>
              </div>
              <div
                style={{
                  width: 200,
                  height: 130,
                  flexShrink: 0,
                  borderRadius: 13,
                  background: featuredCourse.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                }}
              >
                <span style={{ fontSize: 46, fontWeight: 800, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.02em" }}>
                  {featuredCourse.tag}
                </span>
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Meus cursos em andamento</h2>
              <Link href="/aluno/meus-cursos" style={{ fontSize: 13.5, fontWeight: 700, color: PRIMARY, textDecoration: "none" }}>Ver todos</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
              {inProgress.map((c) => (
                <Link
                  key={c.id}
                  href={`/aluno/curso/${c.id}`}
                  style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", textDecoration: "none" }}
                >
                  <div style={{ height: 104, background: c.gradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <span style={{ fontSize: 30, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>{c.tag}</span>
                    <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", color: "#fff", background: "rgba(0,0,0,0.22)", padding: "3px 9px", borderRadius: 100 }}>
                      {c.category}
                    </span>
                  </div>
                  <div style={{ padding: 15, display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "-0.01em", color: "#16100f", lineHeight: 1.3 }}>{c.title}</h3>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginTop: 4 }}>
                      Aula {c.currentLesson} de {c.totalLessons}
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#6a605e" }}>Progresso</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#1f8a5b" }}>{c.progress}%</span>
                      </div>
                      <div style={{ height: 7, background: "#eef1ef", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${c.progress}%`, background: "#1f8a5b", borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Completed */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Cursos concluídos</h2>
              <Link href="/aluno/certificados" style={{ fontSize: 13.5, fontWeight: 700, color: PRIMARY, textDecoration: "none" }}>Ver certificados</Link>
            </div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
              {STUDENT_COMPLETED_COURSES.map((c) => (
                <div key={c.id} style={{ flexShrink: 0, width: 230, background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ height: 88, background: c.gradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>{c.tag}</span>
                    <span style={{ position: "absolute", top: 9, right: 9, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: "#1f8a5b", background: "#fff", padding: "3px 8px", borderRadius: 100, boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                      Certificado
                    </span>
                  </div>
                  <div style={{ padding: "13px 15px" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: "#16100f", lineHeight: 1.3 }}>{c.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#1f8a5b" }}>Concluído · nota {c.grade}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — activities */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Activities card */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #f4eded", display: "flex", alignItems: "center", gap: 9 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <h2 style={{ fontSize: 15.5, fontWeight: 800, color: "#16100f" }}>Próximas atividades</h2>
            </div>
            <div style={{ padding: "6px 20px" }}>
              {STUDENT_ACTIVITIES.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "15px 0", borderBottom: i < STUDENT_ACTIVITIES.length - 1 ? "1px solid #f6f1f1" : "none" }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: a.type === "quiz" ? "#fceeee" : "#e8f5ee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: a.type === "quiz" ? PRIMARY : "#1f8a5b",
                    }}
                  >
                    {a.type === "quiz" ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#16100f", lineHeight: 1.35 }}>{a.title}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>{a.course}</div>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        fontSize: 11,
                        fontWeight: 800,
                        color: a.tagKind === "urgent" ? "#b9482f" : a.tagKind === "new" ? "#1f8a5b" : "#6a605e",
                        background: a.tagKind === "urgent" ? "#fbeede" : a.tagKind === "new" ? "#e8f5ee" : "#f1ecec",
                        padding: "3px 9px",
                        borderRadius: 100,
                      }}
                    >
                      {a.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 20px" }}>
              <Link href="/aluno/meus-cursos" style={{ display: "block", textAlign: "center", fontSize: 13.5, fontWeight: 700, color: PRIMARY, textDecoration: "none" }}>
                Ver agenda completa
              </Link>
            </div>
          </div>

          {/* Motivational card */}
          <div style={{ background: "linear-gradient(135deg,#e8f5ee,#fff)", border: "1px solid #cbe8d8", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#1f8a5b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>Quase lá!</div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, fontWeight: 500, color: "#3a5a4a" }}>
              Conclua mais 1 curso esta semana para desbloquear o selo{" "}
              <strong style={{ fontWeight: 800 }}>Aprendiz Dedicado</strong>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
