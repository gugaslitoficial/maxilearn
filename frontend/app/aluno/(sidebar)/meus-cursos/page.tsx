"use client";

import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useStudentOverview } from "@/hooks/use-student-overview";
import { useCatalog } from "@/hooks/use-catalog";
import { useCertificates } from "@/hooks/use-certificates";
import { hashGradient, makeTag } from "@/lib/utils";

const PRIMARY = "#CC1F1F";
const BAR_COLORS = ["#cbe8d8", "#86ceaa", "#43b787", "#1f8a5b"];

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  "first-lesson": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></svg>,
  "first-cert": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>,
  "10h": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 .01 0" /><path d="M12 6v6l4 2" /></svg>,
  "5courses": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>,
};

function Skeleton({ w, h, radius = 8 }: { w: string | number; h: number; radius?: number }) {
  return (
    <div style={{ width: w, height: h, borderRadius: radius, background: "linear-gradient(90deg,#f0eaea 25%,#e8e0e0 50%,#f0eaea 75%)", backgroundSize: "200% 100%", animation: "ml-shimmer 1.4s infinite" }} />
  );
}

export default function MeusCursosPage() {
  const overviewQ = useStudentOverview();
  const catalogQ = useCatalog({ enrollStatus: "ACTIVE" });
  const certsQ = useCertificates();

  const overview = overviewQ.data;
  const activeCourses = catalogQ.data ?? [];
  const certs = certsQ.data?.data ?? [];

  const certCourseIds = new Set(certs.map((c) => c.courseId));

  const inProgress = activeCourses.filter((c) => !certCourseIds.has(c.id));
  const completedCourses = activeCourses.filter((c) => certCourseIds.has(c.id));

  const isLoading = overviewQ.isLoading || catalogQ.isLoading || certsQ.isLoading;

  const achievements = overview
    ? [
        { key: "first-lesson", title: "Primeiro passo", sub: "Complete sua 1ª aula", unlocked: overview.started >= 1, color: "#CC1F1F", bg: "#fceeee" },
        { key: "first-cert", title: "Certificado de ouro", sub: "Obtenha 1 certificado", unlocked: overview.certificates >= 1, color: "#7a4fb9", bg: "#f1ebf8" },
        { key: "10h", title: "10 horas de foco", sub: "10+ horas de estudo", unlocked: overview.hours >= 10, color: "#b9842f", bg: "#fdf3e2" },
        { key: "5courses", title: "Viciado em cursos", sub: "Conclua 5 cursos", unlocked: overview.completed >= 5, color: "#1f8a5b", bg: "#e8f5ee" },
      ]
    : [];

  const weeklyHours = overview?.weeklyHours ?? [];
  const totalHoursDisplay = overview ? (Number.isInteger(overview.hours) ? `${overview.hours}h` : `${overview.hours.toFixed(1)}h`) : "—";

  const summaryCards = [
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>, value: overview?.started ?? "—", label: "Cursos iniciados", color: "#CC1F1F", bg: "#fceeee" },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></svg>, value: overview?.completed ?? "—", label: "Cursos concluídos", color: "#1f8a5b", bg: "#e8f5ee" },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b9842f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" /></svg>, value: totalHoursDisplay, label: "Horas de estudo", color: "#b9842f", bg: "#fdf3e2" },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a4fb9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>, value: overview?.certificates ?? "—", label: "Certificados obtidos", color: "#7a4fb9", bg: "#f1ebf8" },
  ];

  return (
    <>
      <style>{`@keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} } @media (max-width:768px){.meus-cursos-mid{grid-template-columns:1fr !important}}`}</style>

      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "22px clamp(20px,3vw,36px)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Meu progresso</h1>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>Acompanhe sua jornada de aprendizado e conquistas.</p>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
          {summaryCards.map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
              {isLoading ? (
                <div style={{ marginTop: 16 }}><Skeleton w={70} h={30} /></div>
              ) : (
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: "#16100f", marginTop: 16 }}>{s.value}</div>
              )}
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart + Achievements */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24, alignItems: "stretch" }} className="meus-cursos-mid">

          {/* Bar chart */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Horas de estudo</h2>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>Últimas 4 semanas</p>
              </div>
              <div style={{ textAlign: "right" }}>
                {isLoading ? <Skeleton w={60} h={28} /> : (
                  <>
                    <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>{totalHoursDisplay}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1f8a5b" }}>Total acumulado</div>
                  </>
                )}
              </div>
            </div>
            {isLoading ? (
              <div style={{ marginTop: 24 }}><Skeleton w="100%" h={180} radius={10} /></div>
            ) : weeklyHours.length === 0 ? (
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#8a807e" }}>Sem dados de horas ainda.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyHours} barCategoryGap="35%" margin={{ top: 8, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "#8a807e", fontFamily: "Manrope, sans-serif" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a89e9c", fontFamily: "Manrope, sans-serif" }} unit="h" />
                  <Tooltip formatter={(v) => [`${v ?? 0}h`, "Horas"]} contentStyle={{ borderRadius: 10, border: "1px solid #ece4e4", fontSize: 13, fontFamily: "Manrope, sans-serif" }} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="hours" radius={[8, 8, 0, 0]} maxBarSize={54}>
                    {weeklyHours.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Achievements */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Conquistas</h2>
              {!isLoading && overview && (
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#8a807e" }}>{achievements.filter((a) => a.unlocked).length} de {achievements.length}</span>
              )}
            </div>
            {isLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} w="100%" h={110} radius={13} />)}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {achievements.map((a) => (
                  <div key={a.key} style={{ textAlign: "center", background: a.unlocked ? "#fcfafa" : "#faf8f8", border: a.unlocked ? "1px solid #f0e8e8" : "1px dashed #e6dede", borderRadius: 13, padding: "16px 12px", opacity: a.unlocked ? 1 : 0.7 }}>
                    <div style={{ width: 46, height: 46, borderRadius: "50%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: a.unlocked ? a.bg : "#f1ecec", color: a.unlocked ? a.color : "#b3a6a6", boxShadow: a.unlocked ? `0 6px 14px ${a.bg}` : "none" }}>
                      {ACHIEVEMENT_ICONS[a.key]}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: a.unlocked ? "#16100f" : "#8a807e", lineHeight: 1.25, marginTop: 9 }}>{a.title}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#a89e9c", marginTop: 3 }}>{a.sub}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Course progress list */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f", marginBottom: 18 }}>Progresso por curso</h2>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} w="100%" h={76} radius={13} />)}
            </div>
          ) : (inProgress.length === 0 && completedCourses.length === 0) ? (
            <div style={{ padding: "40px 0", textAlign: "center", fontSize: 14, fontWeight: 600, color: "#8a807e" }}>
              Nenhum curso em andamento.{" "}
              <Link href="/aluno/explorar" style={{ color: PRIMARY, fontWeight: 800, textDecoration: "none" }}>Explorar cursos</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...inProgress, ...completedCourses].map((c) => {
                const done = certCourseIds.has(c.id);
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 18, padding: 14, borderRadius: 13, background: "#fcfafa", border: "1px solid #f4eded", flexWrap: "wrap" }}>
                    <div style={{ width: 46, height: 46, borderRadius: 11, flexShrink: 0, background: c.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>
                      {c.tag}
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 800, color: "#16100f" }}>{c.title}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 800, color: done ? "#1f8a5b" : "#b9842f", background: done ? "#e8f5ee" : "#fdf3e2", border: `1px solid ${done ? "#cbe8d8" : "#f3e1bf"}`, padding: "3px 10px", borderRadius: 100 }}>
                          {done ? "Concluído" : "Em andamento"}
                        </span>
                      </div>
                      {done ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ flex: 1, height: 8, background: "#eef1ef", borderRadius: 5, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: "100%", background: "#1f8a5b", borderRadius: 5 }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#1f8a5b", width: 42, textAlign: "right" }}>100%</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#b9842f", flexShrink: 0 }} />
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e" }}>Acesse o curso para ver o progresso</span>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/aluno/curso/${c.id}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: done ? 700 : 800, color: done ? "#16100f" : "#fff", textDecoration: "none", background: done ? "#fff" : PRIMARY, border: done ? "1.5px solid #e2d9d9" : "none", borderRadius: 10, padding: "10px 18px", flexShrink: 0 }}
                    >
                      {done ? "Revisar" : "Continuar"}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
