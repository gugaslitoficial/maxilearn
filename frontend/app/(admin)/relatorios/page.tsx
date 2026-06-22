"use client";

import { useState } from "react";
import { Download, Users, Clock, CheckCircle, Award } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MOCK_REPORT_USERS, MOCK_REPORT_COURSES, MOCK_ENGAGEMENT_DATA } from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";

const PERIODS = ["7 dias", "30 dias", "90 dias", "Personalizado"] as const;
type Period = typeof PERIODS[number];

const KPI_CARDS = [
  { icon: Users, value: "213", label: "Usuários ativos", sub: "no período" },
  { icon: Clock, value: "4.820h", label: "Horas de aprendizagem", sub: "consumidas" },
  { icon: CheckCircle, value: "91%", label: "Taxa de conclusão", sub: "média do período" },
  { icon: Award, value: "658", label: "Certificados emitidos", sub: "no período" },
];

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<Period>("30 dias");

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
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
            Relatórios
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
            Análise de desempenho e engajamento da plataforma.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Period filter */}
          <div
            style={{
              display: "flex",
              border: "1.5px solid #ece4e4",
              borderRadius: 10,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "9px 14px",
                  border: "none",
                  background: period === p ? PRIMARY : "transparent",
                  color: period === p ? "#fff" : "#6a605e",
                  fontSize: 13,
                  fontWeight: period === p ? 800 : 600,
                  cursor: "pointer",
                  transition: "all .15s",
                  whiteSpace: "nowrap",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              border: "1.5px solid #ece4e4",
              background: "#fff",
              fontSize: 14,
              fontWeight: 700,
              color: "#6a605e",
              cursor: "pointer",
            }}
          >
            <Download size={15} />
            Exportar
          </button>
        </div>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
          {KPI_CARDS.map(({ icon: Icon, value, label, sub }) => (
            <div
              key={label}
              style={{
                background: "#fff",
                border: "1px solid #ece4e4",
                borderRadius: 16,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: "#fceeee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={19} color={PRIMARY} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", color: "#16100f" }}>
                  {value}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#3a3030" }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#a89e9c" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-[22px]">
          {/* Horizontal bar chart — Top 5 cursos */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #ece4e4",
              borderRadius: 16,
              padding: 24,
              minWidth: 0,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f", marginBottom: 20 }}>
              Cursos por conclusão
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {MOCK_REPORT_COURSES.map((c) => (
                <div key={c.tag}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 7,
                          background: c.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 800,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {c.tag}
                      </div>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#16100f" }}>{c.name}</span>
                    </div>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 800,
                        color: c.progress >= 80 ? "#1f8a5b" : c.progress >= 60 ? "#b9842f" : "#cc2a2a",
                        background: c.progress >= 80 ? "#e8f5ee" : c.progress >= 60 ? "#fdf3e2" : "#fceeee",
                        padding: "3px 9px",
                        borderRadius: 100,
                      }}
                    >
                      {c.progress}%
                    </span>
                  </div>
                  <div style={{ height: 8, background: "#f1e4e4", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${c.progress}%`,
                        background: c.color,
                        borderRadius: 4,
                        transition: "width .6s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement AreaChart */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #ece4e4",
              borderRadius: 16,
              padding: 24,
              minWidth: 0,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f", marginBottom: 4 }}>
              Evolução do engajamento
            </h3>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#8a807e", marginBottom: 16 }}>
              Acessos diários — {period}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_ENGAGEMENT_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="relGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fontWeight: 600, fill: "#a89e9c", fontFamily: "Manrope, sans-serif" }}
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
                  fill="url(#relGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: PRIMARY, stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[22px]">
          {/* Por usuário */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #ece4e4",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px 22px 14px", borderBottom: "1px solid #ece4e4" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Por usuário</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                <thead>
                  <tr style={{ background: "#fdfbfb" }}>
                    {["Usuário", "Iniciados", "Concluídos", "Horas", "Certs."].map((h) => (
                      <th key={h} style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#a89e9c", padding: "11px 16px", textAlign: "left", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_REPORT_USERS.map((u) => (
                    <tr key={u.initials} style={{ borderTop: "1px solid #f6f1f1" }}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              background: u.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10.5,
                              fontWeight: 800,
                              color: "#fff",
                              flexShrink: 0,
                            }}
                          >
                            {u.initials}
                          </div>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#16100f" }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{u.started}</td>
                      <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{u.completed}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13.5, fontWeight: 700, color: "#6a605e" }}>{u.hours}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: "#1f8a5b", background: "#e8f5ee", padding: "3px 9px", borderRadius: 100 }}>
                          {u.certs}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Por curso */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #ece4e4",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px 22px 14px", borderBottom: "1px solid #ece4e4" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Por curso</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
                <thead>
                  <tr style={{ background: "#fdfbfb" }}>
                    {["Curso", "Alunos", "Conclusão"].map((h) => (
                      <th key={h} style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#a89e9c", padding: "11px 16px", textAlign: "left", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_REPORT_COURSES.map((c) => (
                    <tr key={c.tag} style={{ borderTop: "1px solid #f6f1f1" }}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                            {c.tag}
                          </div>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#16100f" }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{c.students}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 7, background: "#f1e4e4", borderRadius: 4, overflow: "hidden", minWidth: 60 }}>
                            <div style={{ height: "100%", width: `${c.progress}%`, background: c.color, borderRadius: 4 }} />
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: c.progress >= 80 ? "#1f8a5b" : c.progress >= 60 ? "#b9842f" : "#cc2a2a",
                              background: c.progress >= 80 ? "#e8f5ee" : c.progress >= 60 ? "#fdf3e2" : "#fceeee",
                              padding: "2px 8px",
                              borderRadius: 100,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.progress}%
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
      </div>
    </>
  );
}
