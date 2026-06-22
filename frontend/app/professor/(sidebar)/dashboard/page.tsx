"use client";

import Link from "next/link";
import {
  PROFESSOR_COURSES,
  PROFESSOR_ACTIVITIES,
  PROFESSOR_CHART_BARS,
} from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";

const METRICS = [
  {
    value: "6",
    label: "Meus cursos ativos",
    trend: "▲ 1",
    trendUp: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    value: "734",
    label: "Total de alunos",
    trend: "▲ 24",
    trendUp: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    value: "87%",
    label: "Taxa média de conclusão",
    trend: "▲ 4%",
    trendUp: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <path d="M22 4 12 14.01l-3-3"/>
      </svg>
    ),
  },
];

const SHORTCUTS = [
  {
    title: "Criar novo curso",
    sub: "Monte uma nova trilha",
    href: "/professor/cursos/novo",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    title: "Ver alunos",
    sub: "Acompanhe o progresso",
    href: "/professor/alunos/liberar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    title: "Criar quiz",
    sub: "Avalie o aprendizado",
    href: "/professor/quizzes/novo",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
];

export default function ProfessorDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Page header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "20px clamp(20px,3vw,36px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Olá, Ricardo 👋</h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · você tem 3 quizzes para revisar
          </p>
        </div>
        <Link
          href="/professor/cursos/novo"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", background: PRIMARY, border: "none", padding: "12px 18px", borderRadius: 10, boxShadow: "0 6px 16px rgba(204,31,31,0.26)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Criar novo curso
        </Link>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 22, overflowY: "auto" }}>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {METRICS.map((m) => (
            <div key={m.label} style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {m.icon}
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 800, color: m.trendUp ? "#1f8a5b" : "#b9482f", background: m.trendUp ? "#e8f5ee" : "#fbeede", padding: "3px 8px", borderRadius: 100 }}>
                  {m.trend}
                </span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: "#16100f", marginTop: 16 }}>{m.value}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {SHORTCUTS.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, padding: 18, cursor: "pointer", textDecoration: "none", transition: "all .15s" }}
              className="hover:border-[#CC1F1F] hover:shadow-md"
            >
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

          {/* My courses with progress */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Meus cursos</h3>
              <Link href="/professor/cursos" style={{ fontSize: 13.5, fontWeight: 700, color: PRIMARY, textDecoration: "none" }}>Ver todos</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {PROFESSOR_COURSES.slice(0, 4).map((c) => (
                <div key={c.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 9 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", background: c.color }}>
                      {c.tag}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{c.name}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>{c.students} alunos · {c.lessons} aulas</div>
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: "#16100f", flexShrink: 0 }}>{c.progress}%</span>
                  </div>
                  <div style={{ height: 8, background: "#f1e4e4", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${c.progress}%`, background: PRIMARY, borderRadius: 5 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f", marginBottom: 18 }}>Atividades recentes</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
              {PROFESSOR_ACTIVITIES.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", background: a.color }}>
                    {a.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, lineHeight: 1.45, fontWeight: 500, color: "#3a3030" }}>{a.text}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#a89e9c", marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bar chart — full width */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, minWidth: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Alunos ativos por curso</h3>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#8a807e", marginTop: 2, marginBottom: 24 }}>Últimos 7 dias</p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "clamp(10px,3vw,32px)", height: 190 }}>
            {PROFESSOR_CHART_BARS.map((b) => (
              <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#16100f" }}>{b.value}</span>
                <div style={{ width: "100%", maxWidth: 54, height: `${b.heightPct}%`, background: b.color, borderRadius: "8px 8px 0 0" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#8a807e", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
