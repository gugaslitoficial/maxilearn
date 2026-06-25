"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useStudentOverview } from "@/hooks/use-student-overview";
import { useCatalog } from "@/hooks/use-catalog";
import { useCertificates } from "@/hooks/use-certificates";
import { useQuizzes } from "@/hooks/use-quizzes";
import { LEVEL_LABEL } from "@/lib/utils";
import type { ApiCourseLevel } from "@/lib/utils";

const PRIMARY = "#CC1F1F";

function Skeleton({ w, h, radius = 8 }: { w: string | number; h: number; radius?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: "linear-gradient(90deg,#f0eaea 25%,#e8e0e0 50%,#f0eaea 75%)",
        backgroundSize: "200% 100%",
        animation: "ml-shimmer 1.4s infinite",
      }}
    />
  );
}

export default function AlunoDashboardPage() {
  const { user } = useAuth();
  const overview = useStudentOverview();
  const catalog = useCatalog();
  const certs = useCertificates();
  const quizzes = useQuizzes({ perPage: 50 });

  const firstName = user?.name?.split(" ")[0] ?? "Aluno";

  const activeCourses = catalog.data?.filter((c) => c.enrollmentStatus === "ACTIVE") ?? [];
  const certCourseIds = new Set((certs.data?.data ?? []).map((c) => c.courseId));
  const inProgress = activeCourses.filter((c) => !certCourseIds.has(c.id));
  const featuredCourse = inProgress[0] ?? activeCourses[0] ?? null;

  const completedCerts = certs.data?.data ?? [];

  const enrolledCourseIds = new Set(activeCourses.map((c) => c.id));
  const upcomingQuizzes = (quizzes.data?.data ?? [])
    .filter((q) => enrolledCourseIds.has(q.courseId) && q.status === "PUBLISHED")
    .slice(0, 4);

  const isLoading = overview.isLoading || catalog.isLoading;

  return (
    <>
      <style>{`
        @keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @media (max-width: 900px) { .aluno-dashboard-grid { grid-template-columns: 1fr !important; } }
      `}</style>

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
          {isLoading ? (
            <>
              <Skeleton w={280} h={28} />
              <div style={{ marginTop: 8 }}><Skeleton w={220} h={16} /></div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
                Olá, {firstName}! Continue de onde parou 👋
              </h1>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>
                {inProgress.length > 0
                  ? `Você tem ${inProgress.length} curso${inProgress.length > 1 ? "s" : ""} em andamento.`
                  : "Explore cursos e comece seu aprendizado."}
              </p>
            </>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ textAlign: "right" }}>
            {overview.isLoading ? (
              <Skeleton w={48} h={24} />
            ) : (
              <div style={{ fontSize: 20, fontWeight: 800, color: "#b9842f", letterSpacing: "-0.02em" }}>
                {overview.data?.hours ?? 0}h
              </div>
            )}
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#8a807e" }}>horas estudadas</div>
          </div>
          <div style={{ width: 1, height: 32, background: "#ece4e4" }} />
          <div style={{ textAlign: "right" }}>
            {overview.isLoading ? (
              <Skeleton w={32} h={24} />
            ) : (
              <div style={{ fontSize: 20, fontWeight: 800, color: "#16100f", letterSpacing: "-0.02em" }}>
                {overview.data?.certificates ?? 0}
              </div>
            )}
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
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26, minWidth: 0 }}>

          {/* Featured */}
          {isLoading ? (
            <div style={{ borderRadius: 18, overflow: "hidden" }}>
              <Skeleton w="100%" h={200} radius={18} />
            </div>
          ) : featuredCourse ? (
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
              <div style={{ position: "absolute", top: -60, right: -40, width: 260, height: 260, background: "radial-gradient(circle, rgba(204,31,31,0.30), transparent 70%)", borderRadius: "50%" }} />
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#e8a5a5" }}>
                    Continue assistindo
                  </span>
                  <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", marginTop: 8, lineHeight: 1.2 }}>
                    {featuredCourse.title}
                  </h2>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.72)", marginTop: 6 }}>
                    {featuredCourse.teacher.name}
                    {featuredCourse.category ? ` · ${featuredCourse.category}` : ""}
                  </p>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#16100f"><path d="M8 5v14l11-7z" /></svg>
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
          ) : (
            <div style={{ background: "linear-gradient(120deg,#16100f 0%,#3a2422 100%)", borderRadius: 18, padding: 28, textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600 }}>
                Nenhum curso em andamento.{" "}
                <Link href="/aluno/explorar" style={{ color: "#e8a5a5", textDecoration: "underline" }}>
                  Explorar catálogo
                </Link>
              </p>
            </div>
          )}

          {/* In Progress */}
          {inProgress.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Meus cursos em andamento</h2>
                <Link href="/aluno/meus-cursos" style={{ fontSize: 13.5, fontWeight: 700, color: PRIMARY, textDecoration: "none" }}>Ver todos</Link>
              </div>
              {catalog.isLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
                  {[1, 2, 3].map((i) => <Skeleton key={i} w="100%" h={180} radius={16} />)}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
                  {inProgress.slice(0, 4).map((c) => (
                    <Link
                      key={c.id}
                      href={`/aluno/curso/${c.id}`}
                      style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", textDecoration: "none" }}
                    >
                      <div style={{ height: 104, background: c.gradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        <span style={{ fontSize: 30, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>{c.tag}</span>
                        {c.category && (
                          <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", color: "#fff", background: "rgba(0,0,0,0.22)", padding: "3px 9px", borderRadius: 100 }}>
                            {c.category}
                          </span>
                        )}
                      </div>
                      <div style={{ padding: 15, display: "flex", flexDirection: "column", flex: 1 }}>
                        <h3 style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "-0.01em", color: "#16100f", lineHeight: 1.3 }}>{c.title}</h3>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginTop: 4 }}>{c.teacher.name}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Completed */}
          {completedCerts.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Cursos concluídos</h2>
                <Link href="/aluno/certificados" style={{ fontSize: 13.5, fontWeight: 700, color: PRIMARY, textDecoration: "none" }}>Ver certificados</Link>
              </div>
              <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
                {completedCerts.slice(0, 6).map((cert) => (
                  <div key={cert.id} style={{ flexShrink: 0, width: 230, background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ height: 88, background: "linear-gradient(135deg,#1f8a5b,#43b787)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>
                        {cert.courseName.split(/\s+/).map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                      <span style={{ position: "absolute", top: 9, right: 9, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: "#1f8a5b", background: "#fff", padding: "3px 8px", borderRadius: 100, boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
                        Certificado
                      </span>
                    </div>
                    <div style={{ padding: "13px 15px" }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800, color: "#16100f", lineHeight: 1.3 }}>{cert.courseName}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1f8a5b" }}>Concluído</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Activities */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #f4eded", display: "flex", alignItems: "center", gap: 9 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              <h2 style={{ fontSize: 15.5, fontWeight: 800, color: "#16100f" }}>Próximas atividades</h2>
            </div>
            <div style={{ padding: "6px 20px" }}>
              {quizzes.isLoading ? (
                <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2, 3].map((i) => <Skeleton key={i} w="100%" h={52} />)}
                </div>
              ) : upcomingQuizzes.length === 0 ? (
                <p style={{ padding: "18px 0", fontSize: 13, fontWeight: 600, color: "#8a807e", textAlign: "center" }}>
                  Nenhuma atividade pendente.
                </p>
              ) : (
                upcomingQuizzes.map((q) => (
                  <div key={q.id} style={{ display: "flex", gap: 12, padding: "15px 0", borderBottom: "1px solid #f6f1f1" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#16100f", lineHeight: 1.35 }}>{q.title}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>{q.courseName}</div>
                      <span style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 800, color: "#1f8a5b", background: "#e8f5ee", padding: "3px 9px", borderRadius: 100 }}>
                        {q.questionCount} questões
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: "14px 20px" }}>
              <Link href="/aluno/meus-cursos" style={{ display: "block", textAlign: "center", fontSize: 13.5, fontWeight: 700, color: PRIMARY, textDecoration: "none" }}>
                Ver meu progresso
              </Link>
            </div>
          </div>

          {/* KPI card */}
          {!overview.isLoading && overview.data && (
            <div style={{ background: "linear-gradient(135deg,#e8f5ee,#fff)", border: "1px solid #cbe8d8", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#1f8a5b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>Seu progresso</div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.5, fontWeight: 500, color: "#3a5a4a" }}>
                <strong style={{ fontWeight: 800 }}>{overview.data.started}</strong> curso{overview.data.started !== 1 ? "s" : ""} iniciado{overview.data.started !== 1 ? "s" : ""} ·{" "}
                <strong style={{ fontWeight: 800 }}>{overview.data.certificates}</strong> certificado{overview.data.certificates !== 1 ? "s" : ""} obtido{overview.data.certificates !== 1 ? "s" : ""} ·{" "}
                <strong style={{ fontWeight: 800 }}>{overview.data.hours}h</strong> de estudo
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
