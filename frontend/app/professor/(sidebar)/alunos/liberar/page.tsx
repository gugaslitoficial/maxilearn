"use client";

import { useState } from "react";
import Link from "next/link";
import {
  usePendingEnrollments,
  useActiveEnrollments,
  useApproveEnrollment,
  useRejectEnrollment,
  useRevokeEnrollment,
  useBulkApproveEnrollments,
} from "@/hooks/use-enrollments";
import { useCoursesProfessorAll } from "@/hooks/use-courses-professor";
import { hashAvatarColor, makeInitials } from "@/lib/utils";
import { Toast } from "@/components/ui/Toast";

type ModalType = "approveAll" | "reject" | "revoke";
interface ModalState { type: ModalType; enrollmentId?: string; name?: string }

function Sk({ w, h, r = 8 }: { w?: number | string; h: number; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w ?? "100%", height: h, borderRadius: r, background: "#f1ece9" }}
    />
  );
}

export default function LiberarAlunosPage() {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: courses } = useCoursesProfessorAll();
  const { data: pendingData, isLoading: loadingPending } = usePendingEnrollments();
  const { data: activeData, isLoading: loadingActive } = useActiveEnrollments(selectedCourseId || undefined);

  const approveMut = useApproveEnrollment();
  const rejectMut = useRejectEnrollment();
  const revokeMut = useRevokeEnrollment();
  const bulkMut = useBulkApproveEnrollments();

  const pending = pendingData?.data ?? [];
  const active = activeData?.data ?? [];

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
    minWidth: 180,
  };

  async function approve(id: string) {
    try {
      await approveMut.mutateAsync(id);
      setToast("Acesso liberado com sucesso.");
    } catch {
      setToast("Erro ao liberar acesso.");
    }
  }

  async function confirm() {
    if (!modal) return;
    try {
      if (modal.type === "approveAll") {
        await bulkMut.mutateAsync(pending.map((e) => e.id));
        setToast(`${pending.length} aluno(s) liberado(s).`);
      } else if (modal.type === "reject" && modal.enrollmentId) {
        await rejectMut.mutateAsync(modal.enrollmentId);
        setToast("Solicitação rejeitada.");
      } else if (modal.type === "revoke" && modal.enrollmentId) {
        await revokeMut.mutateAsync(modal.enrollmentId);
        setToast("Acesso revogado.");
      }
    } catch {
      setToast("Erro ao processar a ação.");
    }
    setModal(null);
  }

  const isConfirming = approveMut.isPending || rejectMut.isPending || revokeMut.isPending || bulkMut.isPending;

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
          <div style={{ position: "relative" }}>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              style={selectStyle}
            >
              <option value="">Todos os cursos</option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
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
                {pendingData?.total ?? 0}
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
            {loadingPending
              ? [0, 1, 2].map((i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "13px 14px", border: "1px solid #f0e8e8", borderRadius: 12, alignItems: "center" }}>
                    <Sk w={40} h={40} r={100} />
                    <div style={{ flex: 1 }}><Sk h={14} /><div style={{ marginTop: 6 }}><Sk h={12} w="60%" /></div></div>
                  </div>
                ))
              : pending.length === 0
                ? (
                  <div style={{ padding: "40px 20px", textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>Tudo em dia!</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#8a807e", marginTop: 3 }}>Nenhuma solicitação pendente.</div>
                  </div>
                )
                : pending.map((e) => {
                    const initials = makeInitials(e.student.name);
                    const color = hashAvatarColor(e.student.id);
                    const requestedDate = new Date(e.requestedAt).toLocaleDateString("pt-BR");
                    return (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", border: "1px solid #f0e8e8", borderRadius: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", background: color }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.student.name}</div>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {e.course.title} · {requestedDate}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => approve(e.id)}
                            disabled={approveMut.isPending}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#fff", background: "#CC1F1F", border: "none", borderRadius: 9, padding: "9px 14px", cursor: "pointer" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            Liberar
                          </button>
                          <button
                            onClick={() => setModal({ type: "reject", enrollmentId: e.id, name: e.student.name })}
                            style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #e2d9d9", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#a89e9c" }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
          </div>
        </div>

        {/* Active column */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "20px 22px", borderBottom: "1px solid #f4eded", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#1f8a5b", boxShadow: "0 0 0 3px #e8f5ee", flexShrink: 0 }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Alunos com acesso</h2>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1f8a5b", background: "#e8f5ee", border: "1px solid #cbe8d8", padding: "2px 9px", borderRadius: 100 }}>
                {activeData?.total ?? 0}
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
            {loadingActive
              ? [0, 1, 2].map((i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "13px 14px", border: "1px solid #f0e8e8", borderRadius: 12, alignItems: "center" }}>
                    <Sk w={40} h={40} r={100} />
                    <div style={{ flex: 1 }}><Sk h={14} /><div style={{ marginTop: 6 }}><Sk h={12} w="60%" /></div></div>
                    <Sk w={80} h={34} r={9} />
                  </div>
                ))
              : active.length === 0
                ? (
                  <div style={{ padding: "40px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>Nenhum aluno com acesso ativo.</div>
                  </div>
                )
                : active.map((e) => {
                    const initials = makeInitials(e.student.name);
                    const color = hashAvatarColor(e.student.id);
                    const approvedDate = e.approvedAt ? new Date(e.approvedAt).toLocaleDateString("pt-BR") : "";
                    return (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", border: "1px solid #f0e8e8", borderRadius: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", background: color }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.student.name}</div>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {e.course.title}{approvedDate ? ` · liberado ${approvedDate}` : ""}
                          </div>
                        </div>
                        <button
                          onClick={() => setModal({ type: "revoke", enrollmentId: e.id, name: e.student.name })}
                          style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 9, padding: "9px 14px", cursor: "pointer", flexShrink: 0 }}
                        >
                          Revogar
                        </button>
                      </div>
                    );
                  })}
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
                  ? `${pending.length} estudante(s) terão acesso imediato ao curso.`
                  : modal.type === "reject"
                    ? `A solicitação de ${modal.name} será rejeitada. O estudante poderá solicitar novamente.`
                    : `${modal.name} perderá o acesso ao curso e ao progresso registrado.`}
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
                disabled={isConfirming}
                style={{ flex: 1, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: modal.type === "approveAll" ? "#1f8a5b" : "#CC1F1F", border: "none", borderRadius: 11, padding: 13, cursor: "pointer" }}
              >
                {isConfirming ? "Aguarde…" : modal.type === "approveAll" ? "Liberar todos" : modal.type === "reject" ? "Rejeitar" : "Revogar acesso"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
