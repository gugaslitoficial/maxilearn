"use client";

import { useState } from "react";
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
import { useAdminOverview } from "@/hooks/use-admin-overview";
import type { KpiItem, OverviewPeriod } from "@/hooks/use-admin-overview";
import { useAuth } from "@/hooks/use-auth";
import { hashAvatarColor } from "@/lib/utils";

const PRIMARY = "#CC1F1F";

const METRIC_ICONS = [Users, BookOpen, CheckCircle, Clock];
type MetricKey = "totalUsers" | "activeCourses" | "completionRate" | "activeToday";
const METRIC_KEYS: MetricKey[] = ["totalUsers", "activeCourses", "completionRate", "activeToday"];
const METRIC_LABELS = ["Total de usuários", "Cursos ativos", "Taxa de conclusão média", "Usuários ativos hoje"];

function formatValue(key: MetricKey, value: number): string {
  if (key === "completionRate") return `${value}%`;
  return value.toLocaleString("pt-BR");
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function todayLabel(): string {
  const s = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function TrendBadge({ item }: { item: KpiItem }) {
  const up = item.trend === "up";
  const neutral = item.trend === "neutral";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 12,
        fontWeight: 800,
        color: up ? "#1f8a5b" : neutral ? "#8a807e" : "#b9482f",
        background: up ? "#e8f5ee" : neutral ? "#f4eded" : "#fbeede",
        padding: "3px 8px",
        borderRadius: 100,
      }}
    >
      {!neutral && (up ? "▲" : "▼")} {item.trendPercent}%
    </span>
  );
}

function Sk({ w, h, r = 8 }: { w?: number | string; h: number; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w ?? "100%", height: h, borderRadius: r, background: "#f1ece9" }}
    />
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<OverviewPeriod>(30);
  const { user } = useAuth();
  const { data, isLoading } = useAdminOverview(period);

  const firstName = user?.name.split(" ")[0] ?? "";
  const engagementTotal = data?.engagement.reduce((s, p) => s + p.value, 0) ?? 0;
  const engagementKpi = data?.kpis.activeUsers;

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
            {greeting()}{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>
            {todayLabel()}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Period filter */}
          <div
            style={{
              display: "flex",
              border: "1.5px solid #ece4e4",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {([7, 30, 90] as OverviewPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "8px 13px",
                  border: "none",
                  background: period === p ? PRIMARY : "transparent",
                  color: period === p ? "#fff" : "#6a605e",
                  fontSize: 12.5,
                  fontWeight: period === p ? 800 : 600,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {p}d
              </button>
            ))}
          </div>

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a89e9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
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
          {METRIC_KEYS.map((key, i) => {
            const Icon = METRIC_ICONS[i];
            const kpi = data?.kpis[key];
            return (
              <div
                key={key}
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
                  {isLoading ? (
                    <Sk w={64} h={24} r={100} />
                  ) : kpi ? (
                    <TrendBadge item={kpi} />
                  ) : null}
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: "#16100f", marginTop: 16 }}>
                  {isLoading ? <Sk h={34} /> : kpi ? formatValue(key, kpi.value) : "—"}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
                  {METRIC_LABELS[i]}
                </div>
              </div>
            );
          })}
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
                <p style={{ fontSize: 13, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
                  Últimos {period} dias
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: "#6a605e" }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: PRIMARY, display: "inline-block" }} />
                Aulas concluídas
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#16100f" }}>
                {isLoading ? <Sk w={120} h={32} /> : engagementTotal.toLocaleString("pt-BR")}
              </div>
              {!isLoading && engagementKpi && engagementKpi.trend !== "neutral" && (
                <span style={{ fontSize: 13, fontWeight: 800, color: engagementKpi.trend === "up" ? "#1f8a5b" : "#b9482f" }}>
                  {engagementKpi.trend === "up" ? "▲" : "▼"} {engagementKpi.trendPercent}%
                </span>
              )}
            </div>
            <div style={{ marginTop: 18 }}>
              {isLoading ? (
                <Sk h={200} />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart
                    data={data?.engagement ?? []}
                    margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                  >
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
                      interval={Math.floor((data?.engagement.length ?? 30) / 7)}
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
              )}
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
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <Sk w={34} h={34} r={999} />
                      <div style={{ flex: 1 }}>
                        <Sk h={12} />
                        <div style={{ marginTop: 6 }}><Sk w="50%" h={10} /></div>
                      </div>
                    </div>
                  ))
                : (data?.activities ?? []).map((act, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: hashAvatarColor(act.initials),
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
              {!isLoading && (data?.activities ?? []).length === 0 && (
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "#a89e9c", textAlign: "center", paddingTop: 24 }}>
                  Nenhuma atividade no período.
                </p>
              )}
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
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f6f1f1" }}>
                        <td style={{ padding: "14px 12px 14px 0" }}><Sk h={20} /></td>
                        <td style={{ padding: "14px 12px" }}><Sk w={100} h={14} /></td>
                        <td style={{ padding: "14px 12px" }}><Sk w={40} h={14} /></td>
                        <td style={{ padding: "14px 0 14px 12px" }}><Sk h={14} /></td>
                      </tr>
                    ))
                  : (data?.topCourses ?? []).map((c) => (
                      <tr key={c.name} style={{ borderBottom: "1px solid #f6f1f1" }}>
                        <td style={{ padding: "14px 12px 14px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 9,
                                background: hashAvatarColor(c.tag),
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
                {!isLoading && (data?.topCourses ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 32, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#a89e9c" }}>
                      Nenhum curso publicado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
