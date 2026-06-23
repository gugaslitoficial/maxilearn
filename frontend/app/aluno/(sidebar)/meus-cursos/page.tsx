"use client";

// TODO: integrar com GET /students/me/progress (progresso geral + por curso)
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { STUDENT_CATALOG, STUDENT_COMPLETED_COURSES, STUDENT_WEEKLY_HOURS, STUDENT_ACHIEVEMENTS } from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";

const BAR_COLORS = ["#cbe8d8", "#86ceaa", "#43b787", "#1f8a5b"];

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  "first-lesson": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>,
  "first-cert": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  "10h": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 .01 0"/><path d="M12 6v6l4 2"/></svg>,
  "7days": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  "5courses": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  "top-grade": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>,
};

const SUMMARY = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, value: "5", label: "Cursos iniciados", color: "#CC1F1F", bg: "#fceeee" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>, value: "3", label: "Cursos concluídos", color: "#1f8a5b", bg: "#e8f5ee" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b9842f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>, value: "23h", label: "Horas de estudo", color: "#b9842f", bg: "#fdf3e2" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a4fb9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>, value: "3", label: "Certificados obtidos", color: "#7a4fb9", bg: "#f1ebf8" },
];

const allCourses = [
  ...STUDENT_CATALOG.filter((c) => c.status === "progress"),
  ...STUDENT_COMPLETED_COURSES.map((c) => ({ ...c, status: "done" as const, progress: 100, category: "Compliance", teacher: "—", teacherInitials: "—", teacherColor: "#999", duration: "—", level: "Básico" as const, totalLessons: 0, currentLesson: 0 })),
];

export default function MeusCursosPage() {
  return (
    <>
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "22px clamp(20px,3vw,36px)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Meu progresso</h1>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>Acompanhe sua jornada de aprendizado e conquistas.</p>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
          {SUMMARY.map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: "#16100f", marginTop: 16 }}>{s.value}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart + Achievements */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 24, alignItems: "stretch" }} className="meus-cursos-mid">
          <style>{`@media (max-width: 768px) { .meus-cursos-mid { grid-template-columns: 1fr !important; } }`}</style>

          {/* Bar chart */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Horas de estudo</h2>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>Últimas 4 semanas</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>23h</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1f8a5b" }}>▲ 18% vs. mês anterior</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={STUDENT_WEEKLY_HOURS} barCategoryGap="35%" margin={{ top: 8, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "#8a807e", fontFamily: "Manrope, sans-serif" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a89e9c", fontFamily: "Manrope, sans-serif" }} unit="h" />
                <Tooltip
                  formatter={(v) => [`${v ?? 0}h`, "Horas"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #ece4e4", fontSize: 13, fontFamily: "Manrope, sans-serif" }}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar dataKey="hours" radius={[8, 8, 0, 0]} maxBarSize={54}>
                  {STUDENT_WEEKLY_HOURS.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Achievements */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Conquistas</h2>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#8a807e" }}>4 de 6</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {STUDENT_ACHIEVEMENTS.map((a) => (
                <div
                  key={a.key}
                  style={{
                    textAlign: "center",
                    background: a.unlocked ? "#fcfafa" : "#faf8f8",
                    border: a.unlocked ? "1px solid #f0e8e8" : "1px dashed #e6dede",
                    borderRadius: 13,
                    padding: "16px 12px",
                    opacity: a.unlocked ? 1 : 0.7,
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      margin: "0 auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: a.unlocked ? a.bg : "#f1ecec",
                      color: a.unlocked ? a.color : "#b3a6a6",
                      boxShadow: a.unlocked ? `0 6px 14px ${a.bg}` : "none",
                    }}
                  >
                    {ACHIEVEMENT_ICONS[a.key]}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: a.unlocked ? "#16100f" : "#8a807e", lineHeight: 1.25, marginTop: 9 }}>{a.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#a89e9c", marginTop: 3 }}>{a.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress by course */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f", marginBottom: 18 }}>Progresso por curso</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { tag: "ST", title: "Segurança no Trabalho", progress: 78, status: "Em andamento", grad: "linear-gradient(135deg,#CC1F1F,#e85a4f)", href: "/aluno/curso/1" },
              { tag: "AC", title: "Atendimento ao Cliente", progress: 44, status: "Em andamento", grad: "linear-gradient(135deg,#1f8a5b,#43b787)", href: "/aluno/curso/3" },
              { tag: "LG", title: "LGPD na Prática", progress: 100, status: "Concluído", grad: "linear-gradient(135deg,#7a4fb9,#a06fe0)", href: "/aluno/curso/5" },
              { tag: "CO", title: "Comunicação Eficaz", progress: 100, status: "Concluído", grad: "linear-gradient(135deg,#b9842f,#e0a94d)", href: "/aluno/curso/co" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: 14, borderRadius: 13, background: "#fcfafa", border: "1px solid #f4eded", flexWrap: "wrap" }}>
                <div style={{ width: 46, height: 46, borderRadius: 11, flexShrink: 0, background: c.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>
                  {c.tag}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 800, color: "#16100f" }}>{c.title}</span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        color: c.status === "Concluído" ? "#1f8a5b" : "#b9842f",
                        background: c.status === "Concluído" ? "#e8f5ee" : "#fdf3e2",
                        border: `1px solid ${c.status === "Concluído" ? "#cbe8d8" : "#f3e1bf"}`,
                        padding: "3px 10px",
                        borderRadius: 100,
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, height: 8, background: "#eef1ef", borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${c.progress}%`, background: c.status === "Concluído" ? "#1f8a5b" : "#d9821f", borderRadius: 5 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#16100f", width: 42, textAlign: "right" }}>{c.progress}%</span>
                  </div>
                </div>
                <Link
                  href={c.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 13,
                    fontWeight: c.status === "Concluído" ? 700 : 800,
                    color: c.status === "Concluído" ? "#16100f" : "#fff",
                    textDecoration: "none",
                    background: c.status === "Concluído" ? "#fff" : PRIMARY,
                    border: c.status === "Concluído" ? "1.5px solid #e2d9d9" : "none",
                    borderRadius: 10,
                    padding: "10px 18px",
                    flexShrink: 0,
                  }}
                >
                  {c.status === "Concluído" ? "Revisar" : "Continuar"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
