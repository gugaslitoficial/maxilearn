"use client";

import Link from "next/link";
import { Users, BookOpen, CheckCircle, Clock, Plus, Bell } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MOCK_ACTIVITIES,
  MOCK_ENGAGEMENT_DATA,
  MOCK_TOP_COURSES,
} from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";

const METRICS = [
  {
    icon: Users,
    value: "847",
    label: "Total de usuários",
    trend: "▲ 12%",
    trendUp: true,
  },
  {
    icon: BookOpen,
    value: "32",
    label: "Cursos ativos",
    trend: "▲ 4",
    trendUp: true,
  },
  {
    icon: CheckCircle,
    value: "91%",
    label: "Taxa de conclusão média",
    trend: "▲ 3%",
    trendUp: true,
  },
  {
    icon: Clock,
    value: "213",
    label: "Usuários ativos hoje",
    trend: "▼ 2%",
    trendUp: false,
  },
];

export default function DashboardPage() {
  return (
    <>
      {/* Topbar */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #ece4e4",
          padding: "20px clamp(20px,3vw,36px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
            Bom dia, Carlos 👋
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>
            Sábado, 21 de junho de 2026
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f6f1f1",
              border: "1px solid #ece4e4",
              borderRadius: 10,
              padding: "9px 13px",
              gap: 9,
              minWidth: 220,
            }}
            className="hidden sm:flex"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a89e9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: "#a89e9c" }}>Buscar...</span>
          </div>
          <button
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#f6f1f1",
              border: "1px solid #ece4e4",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={18} color="#6a605e" />
            <span
              style={{
                position: "absolute",
                top: 8,
                right: 9,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: PRIMARY,
                border: "1.5px solid #fff",
              }}
            />
          </button>
          <Link
            href="/cursos"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
              background: PRIMARY,
              padding: "11px 18px",
              borderRadius: 10,
              boxShadow: "0 6px 16px rgba(204,31,31,0.26)",
            }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Novo curso</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "clamp(20px,3vw,32px)",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
          {METRICS.map(({ icon: Icon, value, label, trend, trendUp }) => (
            <div
              key={label}
              style={{
                background: "#fff",
                border: "1px solid #ece4e4",
                borderRadius: 16,
                padding: 22,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: "#fceeee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={PRIMARY} />
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 12,
                    fontWeight: 800,
                    color: trendUp ? "#1f8a5b" : "#b9482f",
                    background: trendUp ? "#e8f5ee" : "#fbeede",
                    padding: "3px 8px",
                    borderRadius: 100,
                  }}
                >
                  {trend}
                </span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: "#16100f", marginTop: 16 }}>
                {value}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-[22px]">
          {/* Engagement chart */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #ece4e4",
              borderRadius: 16,
              padding: 24,
              minWidth: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Engajamento</h3>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>Últimos 30 dias</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: "#6a605e" }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: PRIMARY, display: "inline-block" }} />
                Acessos diários
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#16100f" }}>
              18.4k{" "}
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1f8a5b" }}>▲ 8.2%</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MOCK_ENGAGEMENT_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11.5, fontWeight: 600, fill: "#a89e9c", fontFamily: "Manrope, sans-serif" }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "#16100f",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                      fontFamily: "Manrope, sans-serif",
                    }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#a89e9c", marginBottom: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={PRIMARY}
                    strokeWidth={2.5}
                    fill="url(#engGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: PRIMARY, stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity feed */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #ece4e4",
              borderRadius: 16,
              padding: 24,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f", marginBottom: 18 }}>
              Últimas atividades
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
              {MOCK_ACTIVITIES.map((act, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: act.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {act.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, lineHeight: 1.45, fontWeight: 500, color: "#3a3030" }}>
                      {act.text}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#a89e9c", marginTop: 2 }}>
                      {act.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/relatorios"
              style={{
                display: "block",
                textAlign: "center",
                fontSize: 13.5,
                fontWeight: 700,
                color: PRIMARY,
                textDecoration: "none",
                marginTop: 18,
                paddingTop: 16,
                borderTop: "1px solid #f4eded",
              }}
            >
              Ver tudo
            </Link>
          </div>
        </div>

        {/* Top courses table */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #ece4e4",
            borderRadius: 16,
            padding: 24,
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Cursos mais acessados</h3>
            <Link href="/relatorios" style={{ fontSize: 13.5, fontWeight: 700, color: PRIMARY, textDecoration: "none" }}>
              Ver relatório completo
            </Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ece4e4" }}>
                  {["Curso", "Professor", "Alunos", "Conclusão"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "#a89e9c",
                        padding: "0 12px 12px",
                        textAlign: i === 0 ? "left" : i === 2 ? "right" : i === 1 ? "left" : "right",
                        paddingLeft: i === 0 ? 0 : 12,
                        paddingRight: i === 3 ? 0 : 12,
                        minWidth: i === 3 ? 140 : undefined,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_TOP_COURSES.map((c) => (
                  <tr key={c.tag} style={{ borderBottom: "1px solid #f6f1f1" }}>
                    <td style={{ padding: "14px 12px 14px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            background: c.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 800,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {c.tag}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 12px", fontSize: 13.5, fontWeight: 500, color: "#6a605e" }}>
                      {c.teacher}
                    </td>
                    <td style={{ padding: "14px 12px", textAlign: "right", fontSize: 13.5, fontWeight: 700, color: "#3a3030" }}>
                      {c.students}
                    </td>
                    <td style={{ padding: "14px 0 14px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                        <div style={{ width: 90, height: 7, background: "#f1e4e4", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${c.pct}%`, background: PRIMARY, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#16100f", width: 38, textAlign: "right" }}>
                          {c.pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
