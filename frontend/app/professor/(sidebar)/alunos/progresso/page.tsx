"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { X } from "lucide-react";
import type { ProfessorStudent } from "@/lib/mock-data";
import { PROFESSOR_STUDENTS } from "@/lib/mock-data";

// TODO: integrar com GET /professor/students/progress

const PRIMARY = "#CC1F1F";

const PIE_GRADIENT = "conic-gradient(#1f8a5b 0% 58%, #d9821f 58% 88%, #cabbbb 88% 100%)";

const STATUS = {
  "Concluído":    { pill: "display:inline-flex; align-items:center; gap:7px; font-size:12.5px; font-weight:700; color:#1f8a5b; background:#e8f5ee; border:1px solid #cbe8d8; padding:4px 11px; border-radius:100px;", dot: "#1f8a5b", bar: "#1f8a5b" },
  "Em andamento": { pill: "display:inline-flex; align-items:center; gap:7px; font-size:12.5px; font-weight:700; color:#b9842f; background:#fdf3e2; border:1px solid #f3e1bf; padding:4px 11px; border-radius:100px;", dot: "#d9821f", bar: "#d9821f" },
  "Não iniciado": { pill: "display:inline-flex; align-items:center; gap:7px; font-size:12.5px; font-weight:700; color:#8a807e; background:#f1ecec; border:1px solid #e0d6d6; padding:4px 11px; border-radius:100px;", dot: "#cabbbb", bar: "#cabbbb" },
} as const;

const GRADE_COLOR = (g: string) =>
  g === "—" ? "#a89e9c" : parseFloat(g.replace(",", ".")) >= 7 ? "#1f8a5b" : "#b9482f";

const MODULE_BREAKDOWN = [
  { name: "Fundamentos da Segurança", pct: 100 },
  { name: "EPIs e Prevenção", pct: 80 },
  { name: "Normas e Compliance", pct: 55 },
];

const QUIZ_GRADES = [
  "Quiz — Conceitos iniciais",
  "Quiz — EPIs",
  "Avaliação final",
];

export default function ProgressoAlunosPage() {
  const [selected, setSelected] = useState<ProfessorStudent | null>(null);

  const selectStyle: CSSProperties = {
    fontFamily: "inherit",
    fontSize: 13.5,
    fontWeight: 700,
    color: "#16100f",
    background: "#fff",
    border: "1.5px solid #e6dede",
    borderRadius: 10,
    padding: "10px 38px 10px 14px",
    cursor: "pointer",
    outline: "none",
    appearance: "none",
  };

  const drawerStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100%",
    width: "min(440px, 100vw)",
    background: "#f6f4f3",
    boxShadow: "-12px 0 40px rgba(0,0,0,0.18)",
    overflowY: "auto",
    animation: "ml-slidein .25s ease",
  };

  const thStyle: CSSProperties = { fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#a89e9c", padding: 14 };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative", overflow: "hidden" }}>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "22px clamp(20px,3vw,36px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Progresso dos alunos</h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>Acompanhe o avanço de cada aluno por curso.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#8a807e" }}>Curso:</span>
          <select style={selectStyle}>
            <option>Segurança no Trabalho</option>
            <option>Lubrificação Industrial</option>
            <option>Gestão de Manutenção</option>
          </select>
        </div>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 22, overflowY: "auto" }}>

        {/* Summary: pie + stats */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Pie */}
            <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
              <div style={{ width: 140, height: 140, borderRadius: "50%", background: PIE_GRADIENT }} />
              <div style={{ position: "absolute", inset: 24, background: "#fff", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>312</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#8a807e" }}>alunos</span>
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { color: "#1f8a5b", label: "Concluído", value: "181", pct: "58%" },
                { color: "#d9821f", label: "Em andamento", value: "94", pct: "30%" },
                { color: "#cabbbb", label: "Não iniciado", value: "37", pct: "12%" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 3, flexShrink: 0, background: l.color }} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#3a3030", minWidth: 120 }}>{l.label}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: "#16100f" }}>{l.value}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#a89e9c" }}>{l.pct}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, borderLeft: "1px solid #f0e8e8", paddingLeft: 28 }}>
            <div><div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>82%</div><div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>Progresso médio</div></div>
            <div><div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>8.4</div><div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>Nota média</div></div>
            <div><div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>147</div><div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>Certificados</div></div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: "8px", minWidth: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ece4e4" }}>
                  <th style={{ ...thStyle, textAlign: "left", paddingLeft: 16 }}>Aluno</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Aulas</th>
                  <th style={{ ...thStyle, textAlign: "left", minWidth: 180 }}>Progresso</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Nota média</th>
                  <th style={{ ...thStyle, textAlign: "left" }}>Último acesso</th>
                  <th style={{ ...thStyle, textAlign: "left" }}>Status</th>
                  <th style={{ ...thStyle, textAlign: "right", paddingRight: 16 }}></th>
                </tr>
              </thead>
              <tbody>
                {PROFESSOR_STUDENTS.map((s) => {
                  const st = STATUS[s.status];
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelected(s)}
                      style={{ borderBottom: "1px solid #f6f1f1", cursor: "pointer" }}
                      className="hover:bg-[#fcfafa]"
                    >
                      <td style={{ padding: "13px 12px 13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                            {s.initials}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 12px", textAlign: "center", fontSize: 13.5, fontWeight: 600, color: "#6a605e" }}>{s.lessons}</td>
                      <td style={{ padding: "13px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1, height: 8, background: "#f1e4e4", borderRadius: 5, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${s.progress}%`, background: st.bar, borderRadius: 5 }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#16100f", width: 38, textAlign: "right" }}>{s.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 12px", textAlign: "center", fontSize: 14, fontWeight: 800, color: GRADE_COLOR(s.grade) }}>{s.grade}</td>
                      <td style={{ padding: "13px 12px", fontSize: 13.5, fontWeight: 500, color: "#6a605e" }}>{s.lastAccess}</td>
                      <td style={{ padding: "13px 12px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, padding: "4px 11px", borderRadius: 100, color: st.pill.includes("1f8a5b") ? "#1f8a5b" : st.pill.includes("b9842f") ? "#b9842f" : "#8a807e", background: st.pill.includes("1f8a5b") ? "#e8f5ee" : st.pill.includes("b9842f") ? "#fdf3e2" : "#f1ecec", border: st.pill.includes("1f8a5b") ? "1px solid #cbe8d8" : st.pill.includes("b9842f") ? "1px solid #f3e1bf" : "1px solid #e0d6d6" }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.dot }} />
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px 13px 12px", textAlign: "right" }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#c0b6b4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Drawer */}
      {selected && (
        <div
          style={{ position: "absolute", inset: 0, background: "rgba(20,10,10,0.42)", backdropFilter: "blur(2px)", zIndex: 50 }}
          onClick={() => setSelected(null)}
        >
          <div style={drawerStyle} onClick={(e) => e.stopPropagation()}>
            {/* Drawer header */}
            <div style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "22px 24px", position: "sticky", top: 0, zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", background: selected.color }}>
                    {selected.initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>{selected.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#8a807e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selected.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ width: 34, height: 34, borderRadius: 9, border: "none", background: "#f6f1f1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6a605e", flexShrink: 0 }}
                >
                  <X size={18} color="#6a605e" />
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                {[
                  { label: "Progresso", value: `${selected.progress}%` },
                  { label: "Nota média", value: selected.grade },
                  { label: "Aulas", value: selected.lessons },
                ].map((stat) => (
                  <div key={stat.label} style={{ flex: 1, background: "#faf7f7", border: "1px solid #eadfdf", borderRadius: 11, padding: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#16100f" }}>{stat.value}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "#8a807e" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
              {/* Progress by module */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#16100f", marginBottom: 14 }}>Progresso por módulo</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {MODULE_BREAKDOWN.map((m) => {
                    const pct = Math.min(100, Math.max(0, selected.progress - 10 + m.pct - 80));
                    return (
                      <div key={m.name}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#3a3030" }}>{m.name}</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#16100f" }}>{Math.min(100, Math.max(0, pct))}%</span>
                        </div>
                        <div style={{ height: 8, background: "#f1e4e4", borderRadius: 5, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`, background: PRIMARY, borderRadius: 5 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quiz grades */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#16100f", marginBottom: 14 }}>Notas por quiz</h3>
                <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 12, overflow: "hidden" }}>
                  {QUIZ_GRADES.map((name, i) => {
                    const g = selected.grade === "—" ? "—" : selected.grade;
                    const isGood = g !== "—" && parseFloat(g.replace(",", ".")) >= 7;
                    return (
                      <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 15px", borderBottom: i < QUIZ_GRADES.length - 1 ? "1px solid #f6f1f1" : "none" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#3a3030" }}>{name}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, padding: "3px 11px", borderRadius: 100, color: g === "—" ? "#a89e9c" : isGood ? "#1f8a5b" : "#b9482f", background: g === "—" ? "#f1ecec" : isGood ? "#e8f5ee" : "#fbeede", border: g === "—" ? "none" : isGood ? "1px solid #cbe8d8" : "1px solid #f3d9bf" }}>
                          {g}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Certificate */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#16100f", marginBottom: 14 }}>Certificado</h3>
                {selected.hasCert ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(135deg,#fceeee,#fff)", border: "1px solid #f6d6d6", borderRadius: 13, padding: 16 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 11, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#16100f" }}>Certificado emitido</div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>{selected.certDate}</div>
                    </div>
                    <button style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: PRIMARY, background: "#fff", border: "1px solid #f6d6d6", borderRadius: 9, padding: "8px 13px", cursor: "pointer", flexShrink: 0 }}>Ver</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#faf7f7", border: "1px dashed #e2d2d2", borderRadius: 13, padding: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: "#f1ecec", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#a89e9c" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e" }}>Ainda não emitido — disponível ao concluir 100% do curso.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
