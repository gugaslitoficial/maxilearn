"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCoursePreview } from "@/hooks/use-course-detail";
import { useAuth } from "@/hooks/use-auth";
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
        background: "linear-gradient(90deg,#2a2424 25%,#322a2a 50%,#2a2424 75%)",
        backgroundSize: "200% 100%",
        animation: "ml-shimmer 1.4s infinite",
      }}
    />
  );
}

export default function CursoPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading } = useCoursePreview(id);
  const { user } = useAuth();
  const router = useRouter();

  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  function toggleModule(moduleId: string) {
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  }

  const backToEditHref =
    user?.role === "ADMIN"
      ? `/cursos/${id}/editar`
      : `/professor/cursos/${id}/editar`;

  const levelLabel = course?.level ? (LEVEL_LABEL[course.level as ApiCourseLevel] ?? course.level) : null;
  const firstLesson = course?.modulesWithStatus.flatMap((m) => m.lessons)[0] ?? null;

  if (isLoading) {
    return (
      <div style={{ fontFamily: "Manrope, system-ui, sans-serif", color: "#16100f", minHeight: "100vh", background: "#f6f4f3" }}>
        <style>{`@keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        <div style={{ background: "#1e3a5f", padding: "10px clamp(20px,4vw,40px)", height: 44 }} />
        <div style={{ background: "#1A1A1A", padding: "36px clamp(20px,4vw,40px) 40px" }}>
          <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 280, height: 168, borderRadius: 14, background: "#2a2424", animation: "ml-shimmer 1.4s infinite", backgroundSize: "200% 100%" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              <Skeleton w={120} h={22} />
              <Skeleton w="80%" h={36} />
              <Skeleton w={280} h={20} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div style={{ fontFamily: "Manrope, system-ui, sans-serif", color: "#16100f", minHeight: "100vh", background: "#f6f4f3" }}>
      <style>{`@keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      {/* Preview banner */}
      <div
        style={{
          background: "#1e3a5f",
          borderBottom: "1px solid #2a4f7a",
          padding: "10px clamp(20px,4vw,40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7dbfff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#b8d9ff" }}>
            Modo de visualização — você está vendo este curso como um estudante o veria
          </span>
        </div>
        <Link
          href={backToEditHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13,
            fontWeight: 800,
            color: "#fff",
            textDecoration: "none",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 8,
            padding: "7px 14px",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Voltar para edição
        </Link>
      </div>

      {/* Course header */}
      <header style={{ background: "#1A1A1A", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -60, width: 380, height: 380, background: "radial-gradient(circle, rgba(204,31,31,0.22), transparent 70%)", borderRadius: "50%" }} />
        <div
          style={{
            position: "relative",
            maxWidth: 1180,
            margin: "0 auto",
            padding: "36px clamp(20px,4vw,40px) 40px",
            display: "flex",
            gap: 32,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 280,
              height: 168,
              flexShrink: 0,
              borderRadius: 14,
              background: course.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
            }}
          >
            <span style={{ fontSize: 56, fontWeight: 800, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.02em" }}>
              {course.tag}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              {course.category && (
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", padding: "4px 11px", borderRadius: 100 }}>
                  {course.category}
                </span>
              )}
              {levelLabel && (
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#1f8a5b", background: "#e8f5ee", padding: "4px 11px", borderRadius: 100 }}>
                  {levelLabel}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1 }}>
              {course.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg,${course.teacherColor},${course.teacherColor}cc)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {course.teacherInitials}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#e6dede" }}>{course.teacher.name}</span>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: "#b8aeac" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 8-6 4 6 4V8Z" /><rect x="2" y="6" width="14" height="12" rx="2" />
                </svg>
                {course.totalLessons} aulas
              </span>
            </div>
            {firstLesson && (
              <button
                onClick={() => router.push(`/curso/${id}/aula/${firstLesson.id}`)}
                type="button"
                style={{ marginTop: 22, display: "inline-flex", alignItems: "center", gap: 9, fontSize: 15, fontWeight: 800, color: "#fff", background: PRIMARY, borderRadius: 12, padding: "14px 28px", border: "none", cursor: "pointer", boxShadow: "0 10px 26px rgba(204,31,31,0.32)", fontFamily: "inherit" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                Ver primeira aula
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div
        className="curso-preview-body"
        style={{ maxWidth: 1180, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 56px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}
      >
        <style>{`
          @media (max-width: 900px) {
            .curso-preview-body { grid-template-columns: 1fr !important; }
            .objectives-grid { grid-template-columns: 1fr !important; }
          }
          .lesson-row-hover:hover { background: #fdf6f6 !important; }
        `}</style>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>

          {course.description && (
            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 26 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginBottom: 12 }}>
                Sobre o curso
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, fontWeight: 500, color: "#4a4040" }}>{course.description}</p>
            </div>
          )}

          {course.objectives && course.objectives.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 26 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginBottom: 16 }}>
                O que você vai aprender
              </h2>
              <div className="objectives-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
                {course.objectives.map((o, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ flexShrink: 0, marginTop: 1 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span style={{ fontSize: 14, lineHeight: 1.45, fontWeight: 500, color: "#3a3030" }}>{o}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modules accordion */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "22px 26px", borderBottom: "1px solid #f4eded", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
                Conteúdo do curso
              </h2>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#8a807e" }}>
                {course.modulesWithStatus.length} módulos · {course.totalLessons} aulas
              </span>
            </div>
            {course.modulesWithStatus.map((m, idx) => {
              const open = m.id in openModules ? openModules[m.id] : idx === 0;
              return (
                <div key={m.id} style={{ borderBottom: "1px solid #f6f1f1" }}>
                  <button
                    onClick={() => toggleModule(m.id)}
                    type="button"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "18px 26px",
                      background: open ? "#fcfafa" : "#fff",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
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
                        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "transform .2s",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>{m.title}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
                        {m.lessons.length} aula{m.lessons.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </button>
                  {open && (
                    <div style={{ padding: "4px 0 12px" }}>
                      {m.lessons.map((l) => (
                        <Link
                          key={l.id}
                          href={`/curso/${id}/aula/${l.id}`}
                          style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 26px", textDecoration: "none" }}
                          className="lesson-row-hover"
                        >
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background: "#f1ecec",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#8a807e"><path d="M8 5v14l11-7z" /></svg>
                          </span>
                          <span style={{ flexShrink: 0, display: "flex", color: "#a89e9c" }}>
                            {l.type === "video" ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m22 8-6 4 6 4V8Z" /><rect x="2" y="6" width="14" height="12" rx="2" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                              </svg>
                            )}
                          </span>
                          <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: "#16100f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {l.title}
                          </span>
                          {l.durationMinutes && (
                            <span style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 600, color: "#a89e9c" }}>
                              {l.durationMinutes} min
                            </span>
                          )}
                        </Link>
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

          {/* Course stats */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 800, color: "#16100f", marginBottom: 18 }}>Informações</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <InfoRow label="Módulos" value={String(course._count.modules)} />
              <InfoRow label="Aulas" value={String(course.totalLessons)} />
              <InfoRow label="Alunos matriculados" value={String(course._count.enrollments)} />
              {course.issueCertificate && <InfoRow label="Certificado" value="Sim" />}
              {course.minPassingScore > 0 && <InfoRow label="Nota mínima" value={`${course.minPassingScore}%`} />}
            </div>
          </div>

          {/* Teacher card */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 800, color: "#16100f", marginBottom: 16 }}>Professor</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `linear-gradient(135deg,${course.teacherColor},${course.teacherColor}cc)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {course.teacherInitials}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>{course.teacher.name}</div>
            </div>
          </div>

          {/* Edit shortcut */}
          <Link
            href={backToEditHref}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              padding: "14px",
              background: PRIMARY,
              color: "#fff",
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 8px 20px rgba(204,31,31,0.28)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Ir para edição do curso
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingBottom: 12, borderBottom: "1px solid #f6f1f1" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#8a807e" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color: "#16100f" }}>{value}</span>
    </div>
  );
}
