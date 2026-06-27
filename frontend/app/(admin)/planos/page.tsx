"use client";

import { useState } from "react";

// TODO: integrar com GET /admin/plans e POST/PUT/DELETE /admin/plans/:id

const PRIMARY = "var(--color-primary)";

interface Plan {
  id: string;
  name: string;
  companies: string;
  monthly: string;
  annual: string;
  users: string;
  courses: string;
  custom: boolean;
  color: string;
  active: boolean;
}

const MOCK_PLANS: Plan[] = [
  { id: "1", name: "Starter", companies: "18 empresas", monthly: "R$ 299/mês", annual: "R$ 239/mês", users: "até 50", courses: "até 10", custom: false, color: "#3a6ea5", active: true },
  { id: "2", name: "Profissional", companies: "42 empresas", monthly: "R$ 799/mês", annual: "R$ 639/mês", users: "até 1.000", courses: "Ilimitado", custom: true, color: PRIMARY, active: true },
  { id: "3", name: "Empresarial", companies: "11 empresas", monthly: "R$ 1.999/mês", annual: "R$ 1.599/mês", users: "até 5.000", courses: "Ilimitado", custom: true, color: "#7a4fb9", active: true },
  { id: "4", name: "Enterprise", companies: "4 empresas", monthly: "Sob consulta", annual: "Sob consulta", users: "Ilimitado", courses: "Ilimitado", custom: true, color: "#1f8a5b", active: true },
];

const FEATURES = [
  "Personalização de marca (white-label)",
  "Quizzes e avaliações",
  "Certificados automáticos",
  "Relatórios avançados",
  "Suporte dedicado e SLA",
  "Integrações e SSO",
];

const inputS = {
  width: "100%",
  fontFamily: "Manrope, sans-serif",
  fontSize: 14.5,
  fontWeight: 600,
  color: "#16100f",
  background: "#faf7f7",
  border: "1px solid #eadfdf",
  borderRadius: 11,
  padding: "13px 15px",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color .15s, background .15s",
};

const labelS = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#3a3030",
  marginBottom: 7,
} as const;

const thS = {
  fontSize: 11.5,
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  color: "#a89e9c",
  padding: "14px 12px",
};

const actBtn = {
  width: 34,
  height: 34,
  borderRadius: 8,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#8a807e",
} as const;

type ModalMode = "create" | "edit";

export default function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
  const [modal, setModal] = useState(false);
  const [mode, setMode] = useState<ModalMode>("create");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [monthly, setMonthly] = useState("");
  const [annual, setAnnual] = useState("");
  const [users, setUsers] = useState("");
  const [courses, setCourses] = useState("");
  const [features, setFeatures] = useState<boolean[]>([true, true, true, false, false, false]);

  function openCreate() {
    setMode("create");
    setName(""); setMonthly(""); setAnnual(""); setUsers(""); setCourses("");
    setFeatures([true, true, true, false, false, false]);
    setEditId(null);
    setModal(true);
  }

  function openEdit(p: Plan) {
    setMode("edit");
    setName(p.name);
    setMonthly(p.monthly);
    setAnnual(p.annual);
    setUsers(p.users);
    setCourses(p.courses);
    setFeatures([true, true, true, p.custom, false, false]);
    setEditId(p.id);
    setModal(true);
  }

  function handleSave() {
    if (!name.trim()) return;
    if (mode === "create") {
      setPlans((prev) => [...prev, {
        id: String(Date.now()), name, companies: "0 empresas",
        monthly: monthly || "—", annual: annual || "—",
        users: users || "Ilimitado", courses: courses || "Ilimitado",
        custom: features[0], color: PRIMARY, active: true,
      }]);
    } else if (editId) {
      setPlans((prev) => prev.map((p) => p.id === editId ? { ...p, name, monthly, annual, users: users || p.users, courses: courses || p.courses } : p));
    }
    setModal(false);
  }

  function handleDelete() {
    if (!deleteId) return;
    setPlans((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  }

  function toggleFeature(i: number) {
    setFeatures((prev) => prev.map((v, j) => j === i ? !v : v));
  }

  const barStyle = (w: number, color: string) => ({
    height: "100%",
    width: `${w}%`,
    background: color,
    borderRadius: 5,
  });

  return (
    <>
      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "22px clamp(20px,3vw,36px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Planos</h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>Gerencie os planos que as empresas podem assinar.</p>
        </div>
        <button
          onClick={openCreate}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#fff", background: PRIMARY, border: "none", padding: "12px 18px", borderRadius: 10, cursor: "pointer", boxShadow: "0 6px 16px rgba(204,31,31,0.26)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Criar plano
        </button>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 22 }}>

        {/* Summary card */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 24, display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 28, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#a89e9c" }}>Plano da empresa</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Profissional</div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", color: PRIMARY, background: "#fceeee", border: "1px solid #f6d6d6", padding: "3px 9px", borderRadius: 100 }}>Ativo</span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 6 }}>R$ 799/mês · renova em 14 jul 2026</div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#3a3030" }}>Usuários</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#6a605e" }}>847 / 1.000</span>
            </div>
            <div style={{ height: 8, background: "#f1e4e4", borderRadius: 5, overflow: "hidden" }}>
              <div style={barStyle(85, PRIMARY)} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#3a3030" }}>Cursos</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1f8a5b" }}>32 · ilimitado</span>
            </div>
            <div style={{ height: 8, background: "#f1e4e4", borderRadius: 5, overflow: "hidden" }}>
              <div style={barStyle(32, "#1f8a5b")} />
            </div>
          </div>
        </div>

        {/* Plans table */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Planos disponíveis</h2>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#8a807e" }}>{plans.length} planos</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ece4e4" }}>
                  <th style={{ ...thS, textAlign: "left", paddingLeft: 16 }}>Plano</th>
                  <th style={{ ...thS, textAlign: "right" }}>Mensal</th>
                  <th style={{ ...thS, textAlign: "right" }}>Anual</th>
                  <th style={{ ...thS, textAlign: "center" }}>Usuários</th>
                  <th style={{ ...thS, textAlign: "center" }}>Cursos</th>
                  <th style={{ ...thS, textAlign: "center" }}>Personalização</th>
                  <th style={{ ...thS, textAlign: "right", paddingRight: 16 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f6f1f1" }}>
                    <td style={{ padding: "15px 12px 15px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 14.5, fontWeight: 800, color: "#16100f" }}>{p.name}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#a89e9c" }}>{p.companies}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "15px 12px", textAlign: "right", fontSize: 14, fontWeight: 700, color: "#16100f", whiteSpace: "nowrap" }}>{p.monthly}</td>
                    <td style={{ padding: "15px 12px", textAlign: "right", fontSize: 14, fontWeight: 700, color: "#16100f", whiteSpace: "nowrap" }}>{p.annual}</td>
                    <td style={{ padding: "15px 12px", textAlign: "center", fontSize: 13.5, fontWeight: 600, color: "#6a605e" }}>{p.users}</td>
                    <td style={{ padding: "15px 12px", textAlign: "center", fontSize: 13.5, fontWeight: 600, color: "#6a605e" }}>{p.courses}</td>
                    <td style={{ padding: "15px 12px", textAlign: "center" }}>
                      {p.custom ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800, color: "#1f8a5b", background: "#e8f5ee", border: "1px solid #cbe8d8", padding: "3px 10px", borderRadius: 100 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          Sim
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#a89e9c", background: "#f6f1f1", padding: "3px 10px", borderRadius: 100 }}>Não</span>
                      )}
                    </td>
                    <td style={{ padding: "15px 16px 15px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                        <button onClick={() => openEdit(p)} style={actBtn} title="Editar" className="hover:bg-[#f6f1f1] hover:text-[#16100f]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        <button style={actBtn} title="Duplicar" className="hover:bg-[#f6f1f1] hover:text-[#16100f]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                        <button onClick={() => setDeleteId(p.id)} style={{ ...actBtn, color: "#c98a8a" }} title="Excluir" className="hover:bg-[#fceeee] hover:text-[#CC1F1F]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(20,10,10,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 }}
          onClick={() => setModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 70px rgba(0,0,0,0.3)" }}
          >
            {/* Header */}
            <div style={{ padding: "24px 26px", borderBottom: "1px solid #f4eded", display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>{mode === "create" ? "Criar plano" : "Editar plano"}</h2>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "#8a807e", marginTop: 4 }}>Defina preços, limites e recursos do plano.</p>
              </div>
              <button onClick={() => setModal(false)} style={{ width: 34, height: 34, borderRadius: 9, border: "none", background: "#f6f1f1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6a605e" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelS}>Nome do plano</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Profissional" style={inputS} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelS}>Preço mensal (R$)</label>
                  <input type="text" value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="799" style={inputS} />
                </div>
                <div>
                  <label style={labelS}>Preço anual (R$/mês)</label>
                  <input type="text" value={annual} onChange={(e) => setAnnual(e.target.value)} placeholder="639" style={inputS} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelS}>Limite de usuários</label>
                  <input type="text" value={users} onChange={(e) => setUsers(e.target.value)} placeholder="100" style={inputS} />
                </div>
                <div>
                  <label style={labelS}>Limite de cursos</label>
                  <input type="text" value={courses} onChange={(e) => setCourses(e.target.value)} placeholder="Ilimitado" style={inputS} />
                </div>
              </div>
              <div>
                <label style={labelS}>Recursos habilitados</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                  {FEATURES.map((feat, i) => (
                    <button
                      key={feat}
                      onClick={() => toggleFeature(i)}
                      type="button"
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", border: `1.5px solid ${features[i] ? PRIMARY : "#e6dede"}`, borderRadius: 10, background: features[i] ? "#fcfafa" : "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                    >
                      <span style={{ width: 20, height: 20, borderRadius: 6, background: features[i] ? PRIMARY : "#f4eded", border: `1.5px solid ${features[i] ? PRIMARY : "#ddd"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {features[i] && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#3a3030" }}>{feat}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "20px 26px", borderTop: "1px solid #f4eded", display: "flex", gap: 12, justifyContent: "flex-end", position: "sticky", bottom: 0, background: "#fff" }}>
              <button onClick={() => setModal(false)} style={{ fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: "12px 20px", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleSave} style={{ fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: "12px 22px", cursor: "pointer", boxShadow: "0 8px 20px rgba(204,31,31,0.26)" }}>
                {mode === "create" ? "Criar plano" : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(20,10,10,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 }}
          onClick={() => setDeleteId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 420, boxShadow: "0 30px 70px rgba(0,0,0,0.3)" }}
          >
            <div style={{ padding: "26px 26px 0", textAlign: "center" }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginTop: 16 }}>Excluir plano?</h2>
              <p style={{ fontSize: 14, lineHeight: 1.55, fontWeight: 500, color: "#6a605e", marginTop: 8 }}>
                Esta ação não pode ser desfeita. Empresas usando este plano precisarão ser migradas.
              </p>
            </div>
            <div style={{ padding: "24px 26px", display: "flex", gap: 12 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleDelete} style={{ flex: 1, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: 13, cursor: "pointer" }}>
                Excluir plano
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
