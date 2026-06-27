"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, BookOpen, Users, Trash2, Edit2, Eye } from "lucide-react";
import {
  useCoursesProfessor,
  useDeleteCourseProfessor,
  useUpdateCourseStatusProfessor,
} from "@/hooks/use-courses-professor";
import {
  hashAvatarColor,
  makeTag,
  STATUS_LABEL,
  LEVEL_LABEL,
  type ApiCourseStatus,
  type ApiCourseLevel,
} from "@/lib/utils";
import { Toast } from "@/components/ui/Toast";

const PRIMARY = "#CC1F1F";

function Sk({ w, h, r = 8 }: { w?: number | string; h: number; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w ?? "100%", height: h, borderRadius: r, background: "#f1ece9" }}
    />
  );
}

const STATUS_STYLE: Record<ApiCourseStatus, { color: string; bg: string }> = {
  PUBLISHED: { color: "#1f8a5b", bg: "#e8f7ef" },
  DRAFT: { color: "#b9842f", bg: "#fdf3e2" },
  ARCHIVED: { color: "#8a807e", bg: "#f2edec" },
};

export default function ProfessorCursosPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApiCourseStatus | "">("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const { data, isLoading } = useCoursesProfessor({
    search: search || undefined,
    status: statusFilter || undefined,
    perPage: 20,
  });
  const deleteMut = useDeleteCourseProfessor();
  const toggleStatus = useUpdateCourseStatusProfessor();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMut.mutateAsync(deleteId);
      setToast("Curso excluído com sucesso.");
    } catch {
      setToast("Erro ao excluir o curso.");
    }
    setDeleteId(null);
  }

  async function handleToggleStatus(id: string, current: ApiCourseStatus) {
    const next: ApiCourseStatus = current === "PUBLISHED" ? "ARCHIVED" : "PUBLISHED";
    try {
      await toggleStatus.mutateAsync({ id, status: next });
      setToast(next === "PUBLISHED" ? "Curso publicado!" : "Curso arquivado.");
    } catch {
      setToast("Erro ao alterar status.");
    }
  }

  const courses = data?.data ?? [];

  return (
    <div style={{ padding: "clamp(16px,3vw,32px)", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", margin: 0 }}>Meus Cursos</h1>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#6a605e", marginTop: 4 }}>
            {isLoading ? "Carregando…" : `${data?.total ?? 0} cursos no total`}
          </p>
        </div>
        <Link
          href="/professor/cursos/novo"
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
            background: PRIMARY, color: "#fff", borderRadius: 10,
            fontSize: 14, fontWeight: 700, textDecoration: "none",
            boxShadow: "0 6px 18px rgba(204,31,31,0.22)",
          }}
        >
          <Plus size={16} /> Novo Curso
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a89e9c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            style={{ width: "100%", fontFamily: "inherit", fontSize: 14, fontWeight: 500, color: "#16100f", background: "#fff", border: "1.5px solid #e6dede", borderRadius: 10, padding: "10px 14px 10px 34px", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApiCourseStatus | "")}
          style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e6dede", borderRadius: 10, padding: "10px 14px", cursor: "pointer", outline: "none" }}
        >
          <option value="">Todos os status</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="DRAFT">Rascunho</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading
          ? [0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0eaea", padding: 18 }}>
                <Sk h={6} r={0} />
                <div style={{ marginTop: 14 }}><Sk h={40} r={10} /></div>
                <div style={{ marginTop: 12 }}><Sk h={16} /></div>
                <div style={{ marginTop: 8 }}><Sk h={14} w="60%" /></div>
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}><Sk h={36} /><Sk h={36} /></div>
              </div>
            ))
          : courses.map((c) => {
              const tag = makeTag(c.title, c.category);
              const color = hashAvatarColor(c.id);
              const st = STATUS_STYLE[c.status];
              const level = c.level ? (LEVEL_LABEL[c.level as ApiCourseLevel] ?? c.level) : "";
              return (
                <div key={c.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0eaea", overflow: "hidden" }}>
                  <div style={{ height: c.thumbnailUrl ? 90 : 6, background: c.thumbnailUrl ? undefined : color, backgroundImage: c.thumbnailUrl ? `url(${c.thumbnailUrl})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div style={{ padding: "18px 18px 16px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                          {tag}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#16100f", lineHeight: 1.3 }}>{c.title}</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#8a807e" }}>
                            {c.category ?? "Geral"}{level ? ` · ${level}` : ""}
                          </div>
                        </div>
                      </div>
                      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, padding: "3px 9px", borderRadius: 100 }}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 18, marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Users size={13} color="#8a807e" />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6a605e" }}>{c._count.enrollments} alunos</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <BookOpen size={13} color="#8a807e" />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6a605e" }}>{c._count.modules} módulos</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <Link
                        href={`/curso/${c.id}`}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          padding: "9px 12px", background: "#f6f4f3", borderRadius: 9,
                          fontSize: 13, fontWeight: 700, color: "#3a3030", textDecoration: "none",
                          border: "1px solid #ece4e4",
                        }}
                        title="Visualizar como aluno"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/professor/cursos/${c.id}/editar`}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          padding: "9px", background: "#f6f4f3", borderRadius: 9,
                          fontSize: 13, fontWeight: 700, color: "#3a3030", textDecoration: "none",
                          border: "1px solid #ece4e4",
                        }}
                      >
                        <Edit2 size={14} /> Editar
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        disabled={toggleStatus.isPending}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          padding: "9px",
                          background: c.status === "PUBLISHED" ? "#f6f4f3" : "#fceeee",
                          borderRadius: 9, fontSize: 13, fontWeight: 700,
                          color: c.status === "PUBLISHED" ? "#3a3030" : PRIMARY,
                          border: c.status === "PUBLISHED" ? "1px solid #ece4e4" : "1px solid #f6d6d6",
                          cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        {c.status === "PUBLISHED" ? "Arquivar" : "Publicar"}
                      </button>
                      <button
                        onClick={() => { setDeleteId(c.id); setDeleteName(c.title); }}
                        style={{ width: 38, height: 38, border: "1px solid #ece4e4", background: "#fff", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#c98a8a", flexShrink: 0 }}
                        className="hover:bg-[#fceeee] hover:border-[#f6d6d6] hover:text-[#CC1F1F]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {!isLoading && courses.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#16100f" }}>Nenhum curso encontrado.</div>
          <Link href="/professor/cursos/novo" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 14, fontWeight: 700, color: "#fff", background: PRIMARY, padding: "11px 18px", borderRadius: 10, textDecoration: "none" }}>
            <Plus size={15} /> Criar primeiro curso
          </Link>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(20,10,10,0.45)", backdropFilter: "blur(2px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setDeleteId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 420, boxShadow: "0 30px 70px rgba(0,0,0,0.3)", overflow: "hidden" }}
          >
            <div style={{ padding: "26px 26px 0", textAlign: "center" }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                <Trash2 size={24} color={PRIMARY} />
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", marginTop: 16 }}>Excluir curso</h2>
              <p style={{ fontSize: 14, lineHeight: 1.55, fontWeight: 500, color: "#6a605e", marginTop: 8 }}>
                Tem certeza que deseja excluir <strong style={{ color: "#16100f" }}>{deleteName}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div style={{ padding: "24px 26px", display: "flex", gap: 12 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleteMut.isPending} style={{ flex: 1, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: 13, cursor: "pointer" }}>
                {deleteMut.isPending ? "Excluindo…" : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
