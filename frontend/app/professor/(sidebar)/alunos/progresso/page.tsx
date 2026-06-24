"use client";

import { useState, useMemo, type CSSProperties } from "react";
import { X } from "lucide-react";
import { useProfessorStudents, type ApiProfessorStudent } from "@/hooks/use-professor-students";
import { useCoursesProfessorAll } from "@/hooks/use-courses-professor";
import { hashAvatarColor, makeInitials, STUDENT_PROGRESS_LABEL, type StudentProgressStatus } from "@/lib/utils";

const PRIMARY = "#CC1F1F";

function Sk({ w, h, r = 6 }: { w?: number | string; h: number; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w ?? "100%", height: h, borderRadius: r, background: "#f1ece9" }}
    />
  );
}

const STATUS_CONFIG: Record<StudentProgressStatus, { color: string; bg: string; border: string; bar: string; dot: string }> = {
  done:        { color: "#1f8a5b", bg: "#e8f5ee", border: "1px solid #cbe8d8", bar: "#1f8a5b", dot: "#1f8a5b" },
  progress:    { color: "#b9842f", bg: "#fdf3e2", border: "1px solid #f3e1bf", bar: "#d9821f", dot: "#d9821f" },
  not_started: { color: "#8a807e", bg: "#f1ecec", border: "1px solid #e0d6d6", bar: "#cabbbb", dot: "#cabbbb" },
};

function gradeColor(grade: number) {
  if (grade <= 0) return "#a89e9c";
  return grade >= 7 ? "#1f8a5b" : "#b9482f";
}

function fmtGrade(grade: number) {
  if (grade <= 0) return "—";
  return grade.toFixed(1).replace(".", ",");
}

export default function ProgressoAlunosPage() {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selected, setSelected] = useState<ApiProfessorStudent | null>(null);

  const { data: courses } = useCoursesProfessorAll();
  const { data: studentsData, isLoading } = useProfessorStudents(selectedCourseId || undefined);

  const students = studentsData?.data ?? [];

  const stats = useMemo(() => {
    if (students.length === 0) return { done: 0, inProgress: 0, notStarted: 0, total: 0, avgProgress: 0, avgGrade: 0, certs: 0 };
    const done = students.filter((s) => s.status === "done").length;
    const inProgress = students.filter((s) => s.status === "progress").length;
    const notStarted = students.filter((s) => s.status === "not_started").length;
    const total = students.length;
    const avgProgress = Math.round(students.reduce((a, s) => a + s.progress, 0) / total);
    const withGrade = students.filter((s) => s.grade > 0);
    const avgGrade = withGrade.length > 0 ? withGrade.reduce((a, s) => a + s.grade, 0) / withGrade.length : 0;
    const certs = students.filter((s) => s.hasCert).length;
    return { done, inProgress, notStarted, total, avgProgress, avgGrade, certs };
  }, [students]);

  const donePct  = stats.total > 0 ? stats.done / stats.total : 0;
  const progPct  = stats.total > 0 ? stats.inProgress / stats.total : 0;
  const pieGrad  = `conic-gradient(#1f8a5b 0% ${(donePct * 100).toFixed(1)}%, #d9821f ${(donePct * 100).toFixed(1)}% ${((donePct + progPct) * 100).toFixed(1)}%, #cabbbb ${((donePct + progPct) * 100).toFixed(1)}% 100%)`;

  const selectStyle: CSSProperties = {
    fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#16100f",
    background: "#fff", border: "1.5px solid #e6dede", borderRadius: 10,
    padding: "10px 38px 10px 14px", cursor: "pointer", outline: "none",
    appearance: "none", minWidth: 200,
  };

  const thStyle: CSSProperties = {
    fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em",
    textTransform: "uppercase", color: "#a89e9c", padding: 14,
  };

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
          <div style={{ position: "relative" }}>
            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} style={selectStyle}>
              <option value="">Todos os cursos</option>
              {(courses ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 22, overflowY: "auto" }}>

        {/* Summary: pie + stats */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Pie */}
            <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
              {isLoading
                ? <div className="animate-pulse" style={{ width: 140, height: 140, borderRadius: "50%", background: "#f1ece9" }} />
                : <div style={{ width: 140, height: 140, borderRadius: "50%", background: stats.total > 0 ? pieGrad : "#f1ece9" }} />}
              <div style={{ position: "absolute", inset: 24, background: "#fff", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>{isLoading ? "…" : stats.total}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#8a807e" }}>alunos</span>
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { color: "#1f8a5b", label: "Concluído", value: stats.done, pct: stats.total > 0 ? `${Math.round(donePct * 100)}%` : "0%" },
                { color: "#d9821f", label: "Em andamento", value: stats.inProgress, pct: stats.total > 0 ? `${Math.round(progPct * 100)}%` : "0%" },
                { color: "#cabbbb", label: "Não iniciado", value: stats.notStarted, pct: stats.total > 0 ? `${Math.round((1 - donePct - progPct) * 100)}%` : "0%" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 3, flexShrink: 0, background: l.color }} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#3a3030", minWidth: 120 }}>{l.label}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: "#16100f" }}>{isLoading ? "…" : l.value}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#a89e9c" }}>{isLoading ? "" : l.pct}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, borderLeft: "1px solid #f0e8e8", paddingLeft: 28 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
                {isLoading ? "…" : `${stats.avgProgress}%`}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>Progresso médio</div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
                {isLoading ? "…" : stats.avgGrade > 0 ? stats.avgGrade.toFixed(1).replace(".", ",") : "—"}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>Nota média</div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
                {isLoading ? "…" : stats.certs}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>Certificados</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 8, minWidth: 0 }}>
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
                {isLoading
                  ? [0, 1, 2, 3, 4].map((i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f6f1f1" }}>
                        <td style={{ padding: "13px 12px 13px 16px" }}><div style={{ display: "flex", gap: 10, alignItems: "center" }}><Sk w={38} h={38} r={100} /><Sk h={14} w={130} /></div></td>
                        <td style={{ padding: "13px 12px" }}><div style={{ display: "flex", justifyContent: "center" }}><Sk h={14} w={24} /></div></td>
                        <td style={{ padding: "13px 12px" }}><Sk h={8} /></td>
                        <td style={{ padding: "13px 12px" }}><div style={{ display: "flex", justifyContent: "center" }}><Sk h={14} w={30} /></div></td>
                        <td style={{ padding: "13px 12px" }}><Sk h={14} w={90} /></td>
                        <td style={{ padding: "13px 12px" }}><Sk h={22} w={90} r={100} /></td>
                        <td style={{ padding: "13px 16px 13px 12px" }} />
                      </tr>
                    ))
                  : students.map((s) => {
                      const st = STATUS_CONFIG[s.status];
                      const initials = s.initials || makeInitials(s.name);
                      const color = hashAvatarColor(s.id);
                      return (
                        <tr
                          key={s.id}
                          onClick={() => setSelected(s)}
                          style={{ borderBottom: "1px solid #f6f1f1", cursor: "pointer" }}
                          className="hover:bg-[#fcfafa]"
                        >
                          <td style={{ padding: "13px 12px 13px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{s.name}</div>
                                <div style={{ fontSize: 12, fontWeight: 500, color: "#a89e9c" }}>{s.email}</div>
                              </div>
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
                          <td style={{ padding: "13px 12px", textAlign: "center", fontSize: 14, fontWeight: 800, color: gradeColor(s.grade) }}>{fmtGrade(s.grade)}</td>
                          <td style={{ padding: "13px 12px", fontSize: 13.5, fontWeight: 500, color: "#6a605e" }}>{s.lastAccess}</td>
                          <td style={{ padding: "13px 12px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, padding: "4px 11px", borderRadius: 100, color: st.color, background: st.bg, border: st.border }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.dot }} />
                              {STUDENT_PROGRESS_LABEL[s.status]}
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
          {!isLoading && students.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>Nenhum aluno encontrado.</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#8a807e", marginTop: 4 }}>Selecione um curso com alunos matriculados.</div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer overlay */}
      {selected && (
        <div
          style={{ position: "absolute", inset: 0, background: "rgba(20,10,10,0.42)", backdropFilter: "blur(2px)", zIndex: 50 }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{ position: "absolute", top: 0, right: 0, height: "100%", width: "min(440px, 100vw)", background: "#f6f4f3", boxShadow: "-12px 0 40px rgba(0,0,0,0.18)", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "22px 24px", position: "sticky", top: 0, zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", background: hashAvatarColor(selected.id) }}>
                    {selected.initials || makeInitials(selected.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>{selected.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#8a807e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selected.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ width: 34, height: 34, borderRadius: 9, border: "none", background: "#f6f1f1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <X size={18} color="#6a605e" />
                </button>
              </div>
              {/* Quick stats */}
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                {[
                  { label: "Progresso", value: `${selected.progress}%` },
                  { label: "Nota média", value: fmtGrade(selected.grade) },
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
              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #ece4e4", borderRadius: 13, padding: 16 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: STATUS_CONFIG[selected.status].dot, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#16100f" }}>{STUDENT_PROGRESS_LABEL[selected.status]}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>Último acesso: {selected.lastAccess}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#3a3030" }}>Progresso geral</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#16100f" }}>{selected.progress}%</span>
                </div>
                <div style={{ height: 10, background: "#f1e4e4", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${selected.progress}%`, background: STATUS_CONFIG[selected.status].bar, borderRadius: 5 }} />
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
                      {selected.certDate && (
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>
                          {new Date(selected.certDate).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#faf7f7", border: "1px dashed #e2d2d2", borderRadius: 13, padding: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: "#f1ecec", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#a89e9c" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e" }}>
                      Ainda não emitido — disponível ao concluir 100% do curso.
                    </div>
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
