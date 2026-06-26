"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  useApproveEnrollment,
  useRejectEnrollment,
  useRevokeEnrollment,
  useBulkApproveEnrollments,
  useDirectEnroll,
} from "@/hooks/use-enrollments";
import type { ApiEnrollment, EnrollmentsPage, PendingEnrollmentsResult } from "@/hooks/use-enrollments";
import { hashAvatarColor, makeInitials } from "@/lib/utils";
import { Toast } from "@/components/ui/Toast";
import { ArrowLeft, UserPlus, Search } from "lucide-react";

type ModalType = "approveAll" | "reject" | "revoke";
interface ModalState { type: ModalType; enrollmentId?: string; name?: string }

interface StudentUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

function Sk({ w, h, r = 8 }: { w?: number | string; h: number; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w ?? "100%", height: h, borderRadius: r, background: "#f1ece9" }}
    />
  );
}

function useCoursePendingEnrollments(courseId: string) {
  return useQuery({
    queryKey: ["enrollments-pending-course", courseId],
    queryFn: async () => {
      const { data } = await api.get<PendingEnrollmentsResult>("/enrollments/pending");
      const filtered = data.data.filter((e) => e.course.id === courseId);
      return { total: filtered.length, data: filtered };
    },
    staleTime: 15_000,
  });
}

function useCourseActiveEnrollments(courseId: string) {
  return useQuery({
    queryKey: ["enrollments-active", courseId],
    queryFn: async () => {
      const { data } = await api.get<EnrollmentsPage>("/enrollments", {
        params: { status: "ACTIVE", courseId, perPage: 200 },
      });
      return data;
    },
    staleTime: 15_000,
  });
}

function useCourseInfo(courseId: string) {
  return useQuery({
    queryKey: ["course-info", courseId],
    queryFn: async () => {
      const { data } = await api.get<{ id: string; title: string }>(`/courses/${courseId}`);
      return data;
    },
    staleTime: 60_000,
  });
}

export default function AdminMatriculasPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [addingStudentId, setAddingStudentId] = useState<string | null>(null);

  const { data: course } = useCourseInfo(id);
  const { data: pendingData, isLoading: loadingPending } = useCoursePendingEnrollments(id);
  const { data: activeData, isLoading: loadingActive } = useCourseActiveEnrollments(id);

  const approveMut = useApproveEnrollment();
  const rejectMut = useRejectEnrollment();
  const revokeMut = useRevokeEnrollment();
  const bulkMut = useBulkApproveEnrollments();
  const directEnroll = useDirectEnroll(id);

  const { data: studentsData } = useQuery({
    queryKey: ["students-search", studentSearch],
    queryFn: async () => {
      const { data } = await api.get<{ data: StudentUser[]; total: number }>("/users", {
        params: { role: "STUDENT", search: studentSearch || undefined, perPage: 20 },
      });
      return data;
    },
    enabled: addStudentOpen,
    staleTime: 10_000,
  });

  const pending: ApiEnrollment[] = pendingData?.data ?? [];
  const active: ApiEnrollment[] = activeData?.data ?? [];
  const enrolledIds = new Set([...pending, ...active].map((e) => e.student.id));
  const availableStudents = (studentsData?.data ?? []).filter((s) => !enrolledIds.has(s.id));

  async function handleAddStudent(studentId: string, studentName: string) {
    setAddingStudentId(studentId);
    try {
      await directEnroll.mutateAsync(studentId);
      setToast(`${studentName} matriculado com acesso ativo.`);
    } catch {
      setToast("Erro ao matricular aluno.");
    } finally {
      setAddingStudentId(null);
    }
  }

  const isConfirming = approveMut.isPending || rejectMut.isPending || revokeMut.isPending || bulkMut.isPending;

  async function approve(enrollmentId: string) {
    try {
      await approveMut.mutateAsync(enrollmentId);
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => router.push("/cursos")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              border: "1.5px solid #ece4e4",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6a605e",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
              Gerenciar Matrículas
            </h1>
            {course?.title && (
              <p style={{ fontSize: 13, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
                {course.title}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#16100f" }}>{pendingData?.total ?? 0}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#b9842f" }}>Pendentes</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#16100f" }}>{activeData?.total ?? 0}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1f8a5b" }}>Ativos</div>
          </div>
          <button
            onClick={() => setAddStudentOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#fff", background: "#CC1F1F", border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer", boxShadow: "0 4px 12px rgba(204,31,31,0.22)", flexShrink: 0 }}
          >
            <UserPlus size={15} />
            Adicionar aluno
          </button>
        </div>
      </header>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "clamp(20px,3vw,32px)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start",
          overflowY: "auto",
        }}
        className="matriculas-grid"
      >
        <style>{`@media(max-width:720px){.matriculas-grid{grid-template-columns:1fr!important;}}`}</style>

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
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
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
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>{requestedDate}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => approve(e.id)}
                          disabled={approveMut.isPending}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#fff", background: "#CC1F1F", border: "none", borderRadius: 9, padding: "9px 14px", cursor: "pointer" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                          Liberar
                        </button>
                        <button
                          onClick={() => setModal({ type: "reject", enrollmentId: e.id, name: e.student.name })}
                          style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #e2d9d9", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#a89e9c" }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Active column */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "20px 22px", borderBottom: "1px solid #f4eded", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#1f8a5b", boxShadow: "0 0 0 3px #e8f5ee", flexShrink: 0 }} />
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Alunos com acesso</h2>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1f8a5b", background: "#e8f5ee", border: "1px solid #cbe8d8", padding: "2px 9px", borderRadius: 100 }}>
              {activeData?.total ?? 0}
            </span>
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
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#8a807e", marginTop: 3 }}>Libere solicitações pendentes para que os alunos acessem este curso.</div>
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
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>
                          {e.student.email}{approvedDate ? ` · liberado ${approvedDate}` : ""}
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CC1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                )}
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginTop: 16 }}>
                {modal.type === "approveAll" ? "Liberar todos os pendentes?" : modal.type === "reject" ? "Rejeitar solicitação?" : "Revogar acesso?"}
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.55, fontWeight: 500, color: "#6a605e", marginTop: 8 }}>
                {modal.type === "approveAll"
                  ? `${pending.length} estudante(s) terão acesso imediato ao curso.`
                  : modal.type === "reject"
                    ? `A solicitação de ${modal.name} será rejeitada.`
                    : `${modal.name} perderá o acesso ao curso.`}
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

      {/* Add Student Modal */}
      {addStudentOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(20,10,10,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50 }}
          onClick={() => setAddStudentOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 480, maxHeight: "80vh", boxShadow: "0 30px 70px rgba(0,0,0,0.28)", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #ece4e4" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#16100f", marginBottom: 12 }}>Adicionar aluno ao curso</h2>
              <div style={{ position: "relative" }}>
                <Search size={15} color="#a89e9c" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  placeholder="Buscar aluno por nome ou e-mail..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  autoFocus
                  style={{ width: "100%", padding: "10px 13px 10px 36px", border: "1.5px solid #ece4e4", borderRadius: 10, fontSize: 14, fontFamily: "inherit", fontWeight: 500, color: "#16100f", background: "#fdfbfb", outline: "none", boxSizing: "border-box" as const }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
              {availableStudents.length === 0 ? (
                <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 14, fontWeight: 600, color: "#a89e9c" }}>
                  {studentSearch ? "Nenhum aluno encontrado." : "Todos os alunos já estão matriculados."}
                </div>
              ) : availableStudents.map((s) => {
                const initials = makeInitials(s.name);
                const color = hashAvatarColor(s.id);
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid #f0e8e8", borderRadius: 12, marginBottom: 8 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", background: color }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{s.name}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</div>
                    </div>
                    <button
                      onClick={() => handleAddStudent(s.id, s.name)}
                      disabled={addingStudentId === s.id}
                      style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#fff", background: "#CC1F1F", border: "none", borderRadius: 9, padding: "8px 14px", cursor: "pointer", flexShrink: 0, opacity: addingStudentId === s.id ? 0.7 : 1 }}
                    >
                      {addingStudentId === s.id ? "..." : "Matricular"}
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid #ece4e4" }}>
              <button
                onClick={() => setAddStudentOpen(false)}
                style={{ width: "100%", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#16100f", background: "#f6f1f1", border: "none", borderRadius: 10, padding: "11px", cursor: "pointer" }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
