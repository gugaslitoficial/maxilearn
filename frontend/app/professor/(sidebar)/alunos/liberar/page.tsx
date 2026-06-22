"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProfessorPendingStudent } from "@/lib/mock-data";
import { PROFESSOR_PENDING, PROFESSOR_ACTIVE_STUDENTS } from "@/lib/mock-data";

// TODO: integrar com GET /professor/students/pending e /professor/students/active
// TODO: integrar com POST /professor/students/:id/approve, /reject, /revoke

type ModalType = "approveAll" | "reject" | "revoke";

interface ModalState {
  type: ModalType;
  index?: number;
}

export default function LiberarAlunosPage() {
  const [pending, setPending] = useState<ProfessorPendingStudent[]>(PROFESSOR_PENDING);
  const [active, setActive] = useState(PROFESSOR_ACTIVE_STUDENTS);
  const [modal, setModal] = useState<ModalState | null>(null);

  function approve(i: number) {
    setPending((prev) => {
      const u = prev[i];
      if (!u) return prev;
      setActive((a) => [{ id: u.id, initials: u.initials, name: u.name, email: u.email, date: "agora", color: u.color }, ...a]);
      return prev.filter((_, j) => j !== i);
    });
  }

  function confirm() {
    if (!modal) return;
    if (modal.type === "approveAll") {
      setActive((a) => [...pending.map((u) => ({ id: u.id, initials: u.initials, name: u.name, email: u.email, date: "agora", color: u.color })), ...a]);
      setPending([]);
    } else if (modal.type === "reject" && modal.index !== undefined) {
      setPending((prev) => prev.filter((_, j) => j !== modal.index));
    } else if (modal.type === "revoke" && modal.index !== undefined) {
      setActive((prev) => prev.filter((_, j) => j !== modal.index));
    }
    setModal(null);
  }

  const avatar = (bg: string) =>
    `width:40px; height:40px; border-radius:50%; flex:none; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; background:${bg};`;

  const selectStyle = {
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
    appearance: "none" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "22px clamp(20px,3vw,36px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Gerenciar alunos</h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>Libere ou revogue o acesso de estudantes aos seus cursos.</p>
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

      {/* Content */}
      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start", overflowY: "auto" }}>

        {/* Pending column */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "20px 22px", borderBottom: "1px solid #f4eded", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#b9842f", boxShadow: "0 0 0 3px #fdf3e2", flexShrink: 0 }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Aguardando liberação</h2>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#b9842f", background: "#fdf3e2", border: "1px solid #f3e1bf", padding: "2px 9px", borderRadius: 100 }}>
                {pending.length}
              </span>
            </div>
            {pending.length > 0 && (
              <button
                onClick={() => setModal({ type: "approveAll" })}
                style={{ fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "#CC1F1F", background: "#fceeee", border: "1px solid #f6d6d6", borderRadius: 9, padding: "8px 13px", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Liberar todos
              </button>
            )}
          </div>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 120 }}>
            {pending.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>Tudo em dia!</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#8a807e", marginTop: 3 }}>Nenhuma solicitação pendente.</div>
              </div>
            ) : (
              pending.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", border: "1px solid #f0e8e8", borderRadius: 12 }}>
                  <div style={{ ...parseInlineStyle(avatar(p.color)), width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", background: p.color }}>
                    {p.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.email} · {p.date}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => approve(i)}
                      title="Liberar"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#fff", background: "#CC1F1F", border: "none", borderRadius: 9, padding: "9px 14px", cursor: "pointer" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      Liberar
                    </button>
                    <button
                      onClick={() => setModal({ type: "reject", index: i })}
                      title="Rejeitar"
                      style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #e2d9d9", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#a89e9c" }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active column */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "20px 22px", borderBottom: "1px solid #f4eded", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#1f8a5b", boxShadow: "0 0 0 3px #e8f5ee", flexShrink: 0 }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Alunos com acesso</h2>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1f8a5b", background: "#e8f5ee", border: "1px solid #cbe8d8", padding: "2px 9px", borderRadius: 100 }}>
                {active.length}
              </span>
            </div>
            <Link
              href="/professor/alunos/progresso"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "#16100f", textDecoration: "none", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 9, padding: "8px 13px", whiteSpace: "nowrap" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6a605e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              Ver progresso
            </Link>
          </div>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 120 }}>
            {active.map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", border: "1px solid #f0e8e8", borderRadius: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", background: a.color }}>
                  {a.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.email} · liberado {a.date}</div>
                </div>
                <button
                  onClick={() => setModal({ type: "revoke", index: i })}
                  style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 9, padding: "9px 14px", cursor: "pointer", flexShrink: 0 }}
                >
                  Revogar
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Confirm modal */}
      {modal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(20,10,10,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 }}
          onClick={() => setModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 420, boxShadow: "0 30px 70px rgba(0,0,0,0.3)", overflow: "hidden" }}
          >
            <div style={{ padding: "26px 26px 0", textAlign: "center" }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: modal.type === "approveAll" ? "#e8f5ee" : "#fceeee" }}>
                {modal.type === "approveAll" ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                )}
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginTop: 16 }}>
                {modal.type === "approveAll" ? "Liberar todos os pendentes?" : modal.type === "reject" ? "Rejeitar solicitação?" : "Revogar acesso?"}
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.55, fontWeight: 500, color: "#6a605e", marginTop: 8 }}>
                {modal.type === "approveAll"
                  ? `${pending.length} estudantes terão acesso imediato ao curso selecionado.`
                  : modal.type === "reject" && modal.index !== undefined
                    ? `A solicitação de ${pending[modal.index]?.name} será removida. O estudante poderá solicitar novamente.`
                    : modal.index !== undefined
                      ? `${active[modal.index]?.name} perderá o acesso ao curso e ao progresso registrado.`
                      : ""}
              </p>
            </div>
            <div style={{ padding: "24px 26px", display: "flex", gap: 12 }}>
              <button
                onClick={() => setModal(null)}
                style={{ flex: 1, fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: 13, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={confirm}
                style={{ flex: 1, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: modal.type === "approveAll" ? "#1f8a5b" : "#CC1F1F", border: "none", borderRadius: 11, padding: 13, cursor: "pointer" }}
              >
                {modal.type === "approveAll" ? "Liberar todos" : modal.type === "reject" ? "Rejeitar" : "Revogar acesso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to avoid TS issues with inline style strings
function parseInlineStyle(_s: string) { return {}; }
