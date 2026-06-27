"use client";

import Link from "next/link";
import { useProfessorOverview } from "@/hooks/use-professor-overview";
import { useCoursesProfessor } from "@/hooks/use-courses-professor";
import { useAuth } from "@/lib/auth-context";
import {
  hashAvatarColor,
  makeTag,
  STATUS_LABEL,
  LEVEL_LABEL,
  type ApiCourseLevel,
} from "@/lib/utils";

const PRIMARY = "var(--color-primary)";

function Sk({ w, h, r = 8 }: { w?: number | string; h: number; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w ?? "100%", height: h, borderRadius: r, background: "#f1ece9" }}
    />
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function todayLabel() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const METRIC_ICONS = [
  <svg key="c" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  <svg key="s" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  <svg key="p" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>,
];

const SHORTCUTS = [
  {
    title: "Criar novo curso",
    sub: "Monte uma nova trilha",
    href: "/professor/cursos/novo",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
  {
    title: "Gerenciar alunos",
    sub: "Libere e acompanhe",
    href: "/professor/alunos/liberar",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  },
  {
    title: "Criar quiz",
    sub: "Avalie o aprendizado",
    href: "/professor/quizzes/novo",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  },
];

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const { data: overview, isLoading: loadingOverview } = useProfessorOverview();
  const { data: coursesPage, isLoading: loadingCourses } = useCoursesProfessor({ perPage: 4 });

  const firstName = user?.name.split(" ")[0] ?? "…";

  const kpis = overview?.kpis;
  const metrics = [
    { label: "Meus cursos ativos", value: kpis?.activeCourses.value ?? 0, trend: kpis?.activeCourses.trend, trendPct: kpis?.activeCourses.trendPercent ?? 0 },
    { label: "Total de alunos", value: kpis?.totalStudents.value ?? 0, trend: kpis?.totalStudents.trend, trendPct: kpis?.totalStudents.trendPercent ?? 0 },
    { label: "Taxa média de conclusão", value: kpis?.completionRate.value ?? 0, trend: kpis?.completionRate.trend, trendPct: kpis?.completionRate.trendPercent ?? 0, pct: true },
  ];

  const chartBars = overview?.chartBars ?? [];
  const maxVal = Math.max(...chartBars.map((b) => b.value), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "20px clamp(20px,3vw,36px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          {loadingOverview ? (
            <>
              <Sk w={200} h={26} r={6} />
              <div style={{ marginTop: 6 }}><Sk w={300} h={16} r={4} /></div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
                {greeting()}, {firstName} 👋
              </h1>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>
                {todayLabel()}
              </p>
            </>
          )}
        </div>
        <Link
          href="/professor/cursos/novo"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", background: PRIMARY, padding: "12px 18px", borderRadius: 10, boxShadow: "0 6px 16px rgba(204,31,31,0.26)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Criar novo curso
        </Link>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 22, overflowY: "auto" }}>

        {/* KPI metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {loadingOverview
            ? [0, 1, 2].map((i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
                  <Sk w={42} h={42} r={11} /><div style={{ marginTop: 16 }}><Sk h={32} /></div><div style={{ marginTop: 6 }}><Sk h={16} /></div>
                </div>
              ))
            : metrics.map((m, i) => {
                const trendUp = m.trend === "up";
                const trendDown = m.trend === "down";
                return (
                  <div key={m.label} style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {METRIC_ICONS[i]}
                      </div>
                      {m.trendPct > 0 && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 800, color: trendUp ? "#1f8a5b" : trendDown ? "#b9482f" : "#b9842f", background: trendUp ? "#e8f5ee" : trendDown ? "#fbeede" : "#fdf3e2", padding: "3px 8px", borderRadius: 100 }}>
                          {trendUp ? "▲" : "▼"} {m.trendPct}%
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: "#16100f", marginTop: 16 }}>
                      {m.pct ? `${m.value}%` : m.value.toLocaleString("pt-BR")}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>{m.label}</div>
                  </div>
                );
              })}
        </div>

        {/* Quick shortcuts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {SHORTCUTS.map((s) => (
            <Link key={s.title} href={s.href} style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, padding: 18, textDecoration: "none", transition: "all .15s" }} className="hover:border-[#CC1F1F] hover:shadow-md">
              <div style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: "#16100f" }}>{s.title}</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", marginTop: 1 }}>{s.sub}</div>
              </div>
              <span style={{ fontSize: 18, color: PRIMARY }}>→</span>
            </Link>
          ))}
        </div>

        {/* Courses + Activity */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22, alignItems: "start" }}>

          {/* My courses */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Meus cursos</h3>
              <Link href="/professor/cursos" style={{ fontSize: 13.5, fontWeight: 700, color: PRIMARY, textDecoration: "none" }}>Ver todos</Link>
            </div>
            {loadingCourses ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[0, 1, 2].map((i) => <div key={i}><Sk h={38} /></div>)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {(coursesPage?.data ?? []).slice(0, 4).map((c) => {
                  const tag = makeTag(c.title, c.category);
                  const color = hashAvatarColor(c.id);
                  const level = c.level ? LEVEL_LABEL[c.level as ApiCourseLevel] ?? c.level : "";
                  return (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", background: color }}>
                        {tag}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>
                          {c._count.enrollments} alunos · {c._count.modules} módulos
                          {level ? ` · ${level}` : ""}
                        </div>
                      </div>
                      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: c.status === "PUBLISHED" ? "#1f8a5b" : "#b9842f", background: c.status === "PUBLISHED" ? "#e8f5ee" : "#fdf3e2", padding: "3px 9px", borderRadius: 100 }}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </div>
                  );
                })}
                {!loadingCourses && (coursesPage?.data ?? []).length === 0 && (
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: "#8a807e", textAlign: "center", padding: "20px 0" }}>Nenhum curso criado ainda.</p>
                )}
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f", marginBottom: 18 }}>Atividades recentes</h3>
            {loadingOverview ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[0, 1, 2, 4].map((i) => <div key={i} style={{ display: "flex", gap: 12 }}><Sk w={34} h={34} r={100} /><div style={{ flex: 1 }}><Sk h={14} /></div></div>)}
              </div>
            ) : (overview?.activities ?? []).length === 0 ? (
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "#8a807e" }}>Nenhuma atividade recente.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {(overview?.activities ?? []).map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", background: hashAvatarColor(a.initials) }}>
                      {a.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, lineHeight: 1.45, fontWeight: 500, color: "#3a3030" }}>{a.text}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#a89e9c", marginTop: 2 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Bar chart */}
        {!loadingOverview && chartBars.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Alunos ativos por curso</h3>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#8a807e", marginTop: 2, marginBottom: 24 }}>Últimos 7 dias</p>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "clamp(10px,3vw,32px)", height: 190 }}>
              {chartBars.map((b, i) => {
                const heightPct = Math.max(8, Math.round((b.value / maxVal) * 100));
                const color = i % 2 === 0 ? PRIMARY : "#e0856f";
                return (
                  <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, height: "100%", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#16100f" }}>{b.value}</span>
                    <div style={{ width: "100%", maxWidth: 54, height: `${heightPct}%`, background: color, borderRadius: "8px 8px 0 0" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#8a807e", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
