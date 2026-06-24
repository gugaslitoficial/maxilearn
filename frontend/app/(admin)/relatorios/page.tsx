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
import { useAdminOverview } from "@/hooks/use-admin-overview";
import { useReportUsers, useReportCourses } from "@/hooks/use-reports";
import type { ReportPeriod } from "@/hooks/use-reports";
import { api } from "@/lib/api";
import { hashAvatarColor } from "@/lib/utils";

const PRIMARY = "#CC1F1F";

const PERIOD_OPTIONS = [
  { label: "7 dias", value: 7 as ReportPeriod },
  { label: "30 dias", value: 30 as ReportPeriod },
  { label: "90 dias", value: 90 as ReportPeriod },
] as const;

function Sk({ w, h, r = 8 }: { w?: number | string; h: number; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w ?? "100%", height: h, borderRadius: r, background: "#f1ece9" }}
    />
  );
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<ReportPeriod>(30);
  const [exporting, setExporting] = useState(false);

  const { data: overview, isLoading: loadingOverview } = useAdminOverview(period);
  const { data: usersReport, isLoading: loadingUsers } = useReportUsers(period);
  const { data: coursesReport, isLoading: loadingCourses } = useReportCourses(period);

  const kpis = overview?.kpis;

  const KPI_CARDS = [
    { icon: Users, value: kpis?.activeUsers.value ?? null, label: "Usuários ativos", sub: "no período" },
    { icon: Clock, value: kpis?.learningHours.value ?? null, label: "Horas de aprendizagem", sub: "consumidas", fmt: (v: number) => `${v}h` },
    { icon: CheckCircle, value: kpis?.completionRate.value ?? null, label: "Taxa de conclusão", sub: "média do período", fmt: (v: number) => `${v}%` },
    { icon: Award, value: kpis?.certificates.value ?? null, label: "Certificados emitidos", sub: "no período" },
  ];

  async function handleExport() {
    setExporting(true);
    try {
      const response = await api.get("/reports/admin/export", {
        params: { period },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data as BlobPart], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-${period}d.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

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
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Relatórios</h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
            Análise de desempenho e engajamento da plataforma.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Period filter */}
          <div style={{ display: "flex", border: "1.5px solid #ece4e4", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
            {PERIOD_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                style={{
                  padding: "9px 14px",
                  border: "none",
                  background: period === value ? PRIMARY : "transparent",
                  color: period === value ? "#fff" : "#6a605e",
                  fontSize: 13,
                  fontWeight: period === value ? 800 : 600,
                  cursor: "pointer",
                  transition: "all .15s",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
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
              cursor: exporting ? "not-allowed" : "pointer",
              opacity: exporting ? 0.6 : 1,
            }}
          >
            <Download size={15} />
            {exporting ? "Exportando..." : "Exportar CSV"}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
          {KPI_CARDS.map(({ icon: Icon, value, label, sub, fmt }) => (
            <div
              key={label}
              style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 10 }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={19} color={PRIMARY} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", color: "#16100f" }}>
                  {loadingOverview ? <Sk h={32} /> : value !== null ? (fmt ? fmt(value) : value.toLocaleString("pt-BR")) : "—"}
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
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f", marginBottom: 20 }}>Cursos por conclusão</h3>
            {loadingCourses ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Array.from({ length: 5 }).map((_, i) => <Sk key={i} h={40} />)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(coursesReport?.data ?? []).map((c) => (
                  <div key={c.tag}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: hashAvatarColor(c.tag), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                          {c.tag}
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#16100f" }}>{c.name}</span>
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: c.progress >= 80 ? "#1f8a5b" : c.progress >= 60 ? "#b9842f" : "#cc2a2a", background: c.progress >= 80 ? "#e8f5ee" : c.progress >= 60 ? "#fdf3e2" : "#fceeee", padding: "3px 9px", borderRadius: 100 }}>
                        {c.progress}%
                      </span>
                    </div>
                    <div style={{ height: 8, background: "#f1e4e4", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${c.progress}%`, background: hashAvatarColor(c.tag), borderRadius: 4, transition: "width .6s ease" }} />
                    </div>
                  </div>
                ))}
                {(coursesReport?.data ?? []).length === 0 && (
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "#a89e9c", textAlign: "center", padding: "24px 0" }}>Nenhum curso no período.</p>
                )}
              </div>
            )}
          </div>

          {/* Engagement AreaChart */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f", marginBottom: 4 }}>Evolução do engajamento</h3>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#8a807e", marginBottom: 16 }}>
              Aulas concluídas — {PERIOD_OPTIONS.find((p) => p.value === period)?.label}
            </p>
            {loadingOverview ? (
              <Sk h={220} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={overview?.engagement ?? []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
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
                    interval={Math.floor((overview?.engagement.length ?? 30) / 7)}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: "#16100f", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "Manrope, sans-serif" }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#a89e9c", marginBottom: 4 }}
                  />
                  <Area type="monotone" dataKey="value" stroke={PRIMARY} strokeWidth={2.5} fill="url(#relGrad)" dot={false} activeDot={{ r: 5, fill: PRIMARY, stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[22px]">
          {/* Por usuário */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 22px 14px", borderBottom: "1px solid #ece4e4" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Por usuário</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                <thead>
                  <tr style={{ background: "#fdfbfb" }}>
                    {["Usuário", "Iniciados", "Concluídos", "Horas", "Certs."].map((h) => (
                      <th key={h} style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#a89e9c", padding: "11px 16px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} style={{ borderTop: "1px solid #f6f1f1" }}>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <Sk w={30} h={30} r={999} />
                              <Sk w={100} h={13} />
                            </div>
                          </td>
                          {[30, 30, 40, 30].map((w, j) => <td key={j} style={{ padding: "13px 16px" }}><Sk w={w} h={13} /></td>)}
                        </tr>
                      ))
                    : (usersReport?.data ?? []).map((u) => (
                        <tr key={u.name} style={{ borderTop: "1px solid #f6f1f1" }}>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <div style={{ width: 30, height: 30, borderRadius: "50%", background: hashAvatarColor(u.initials), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                {u.initials}
                              </div>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#16100f" }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{u.started}</td>
                          <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{u.completed}</td>
                          <td style={{ padding: "13px 16px", fontSize: 13.5, fontWeight: 700, color: "#6a605e" }}>{u.hours}h</td>
                          <td style={{ padding: "13px 16px" }}>
                            <span style={{ fontSize: 12.5, fontWeight: 800, color: "#1f8a5b", background: "#e8f5ee", padding: "3px 9px", borderRadius: 100 }}>
                              {u.certs}
                            </span>
                          </td>
                        </tr>
                      ))}
                  {!loadingUsers && (usersReport?.data ?? []).length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#a89e9c" }}>Nenhum dado no período.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Por curso */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 22px 14px", borderBottom: "1px solid #ece4e4" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Por curso</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
                <thead>
                  <tr style={{ background: "#fdfbfb" }}>
                    {["Curso", "Alunos", "Conclusão"].map((h) => (
                      <th key={h} style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#a89e9c", padding: "11px 16px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingCourses
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} style={{ borderTop: "1px solid #f6f1f1" }}>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <Sk w={28} h={28} r={8} />
                              <Sk w={120} h={13} />
                            </div>
                          </td>
                          <td style={{ padding: "13px 16px" }}><Sk w={40} h={13} /></td>
                          <td style={{ padding: "13px 16px" }}><Sk h={13} /></td>
                        </tr>
                      ))
                    : (coursesReport?.data ?? []).map((c) => (
                        <tr key={c.tag} style={{ borderTop: "1px solid #f6f1f1" }}>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: hashAvatarColor(c.tag), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                {c.tag}
                              </div>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#16100f" }}>{c.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{c.students}</td>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 7, background: "#f1e4e4", borderRadius: 4, overflow: "hidden", minWidth: 60 }}>
                                <div style={{ height: "100%", width: `${c.progress}%`, background: hashAvatarColor(c.tag), borderRadius: 4 }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 800, color: c.progress >= 80 ? "#1f8a5b" : c.progress >= 60 ? "#b9842f" : "#cc2a2a", background: c.progress >= 80 ? "#e8f5ee" : c.progress >= 60 ? "#fdf3e2" : "#fceeee", padding: "2px 8px", borderRadius: 100, whiteSpace: "nowrap" }}>
                                {c.progress}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  {!loadingCourses && (coursesReport?.data ?? []).length === 0 && (
                    <tr><td colSpan={3} style={{ padding: 32, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#a89e9c" }}>Nenhum dado no período.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
