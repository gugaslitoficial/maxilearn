"use client";

import { useState, useEffect, useMemo } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, LayoutGrid, List, Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import {
  useCoursesAdmin,
  useDeleteCourse,
} from "@/hooks/use-courses-admin";
import type { ApiCourse } from "@/hooks/use-courses-admin";
import {
  STATUS_LABEL,
  hashAvatarColor,
  hashGradient,
  makeTag,
  getErrorMessage,
} from "@/lib/utils";
import type { ApiCourseStatus } from "@/lib/utils";

const PRIMARY = "#CC1F1F";

const STATUS_BADGE: Record<ApiCourseStatus, "published" | "draft" | "archived"> = {
  PUBLISHED: "published",
  DRAFT: "draft",
  ARCHIVED: "archived",
};

function Sk({ w, h, r = 8 }: { w?: number | string; h: number; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w ?? "100%", height: h, borderRadius: r, background: "#f1ece9" }}
    />
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  border: "1.5px solid #ece4e4",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
  color: "#16100f",
  background: "#fdfbfb",
  outline: "none",
  fontFamily: "Manrope, sans-serif",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%23a89e9c' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 34,
};

export default function CursosPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApiCourseStatus | "">("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteTarget, setDeleteTarget] = useState<ApiCourse | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useCoursesAdmin({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    perPage: 50,
  });

  const deleteCourse = useDeleteCourse();

  // Derive unique categories from loaded data
  const categories = useMemo(() => {
    if (!data?.data) return [];
    return [...new Set(data.data.map((c) => c.category).filter(Boolean))] as string[];
  }, [data?.data]);

  // Client-side professor filter (API doesn't support filtering by teacher name)
  const filtered = useMemo(() => {
    return data?.data ?? [];
  }, [data?.data]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCourse.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setToast("Curso arquivado.");
    } catch (err) {
      setToast(getErrorMessage(err));
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
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
            Gestão de Cursos
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
            {data ? `${data.total} cursos cadastrados` : "Carregando..."}
          </p>
        </div>
        <button
          onClick={() => router.push("/cursos/novo")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            background: PRIMARY,
            border: "none",
            padding: "11px 18px",
            borderRadius: 10,
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(204,31,31,0.26)",
          }}
        >
          <Plus size={16} />
          Novo curso
        </button>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
            <Search size={15} color="#a89e9c" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              placeholder="Buscar curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...selectStyle, flex: "0 0 160px" }}>
            <option value="">Categoria</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApiCourseStatus | "")}
            style={{ ...selectStyle, flex: "0 0 150px" }}
          >
            <option value="">Status</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="DRAFT">Rascunho</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
          <div style={{ display: "flex", border: "1.5px solid #ece4e4", borderRadius: 10, overflow: "hidden", marginLeft: "auto" }}>
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  width: 38,
                  height: 38,
                  border: "none",
                  background: viewMode === mode ? PRIMARY : "#fff",
                  color: viewMode === mode ? "#fff" : "#8a807e",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background .15s",
                }}
              >
                {mode === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
                <Sk h={130} r={0} />
                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <Sk w={80} h={20} r={100} />
                  <Sk h={16} />
                  <Sk w="60%" h={14} />
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {filtered.map((course) => {
              const tag = makeTag(course.title, course.category);
              const gradient = hashGradient(course.id);
              const teacherInitials = course.teacher.name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const teacherColor = hashAvatarColor(course.teacher.id);
              return (
                <div
                  key={course.id}
                  style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}
                >
                  <div style={{ height: 130, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)", border: "2px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>
                      {tag}
                    </div>
                    <div style={{ position: "absolute", top: 12, right: 12 }}>
                      <Badge variant={STATUS_BADGE[course.status]}>{STATUS_LABEL[course.status]}</Badge>
                    </div>
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ marginBottom: 8 }}>
                      {course.category && <Badge variant="draft">{course.category}</Badge>}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "#16100f", lineHeight: 1.35, marginBottom: 10 }}>
                      {course.title}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: teacherColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                        {teacherInitials}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#6a605e" }}>{course.teacher.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid #f4eded" }}>
                      <Stat label="Módulos" value={String(course._count.modules)} />
                      <Stat label="Alunos" value={String(course._count.enrollments)} />
                      <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                        <CourseBtn icon={<Eye size={14} />} label="Ver" onClick={() => setToast("Visualizando curso")} />
                        <CourseBtn icon={<Pencil size={13} />} label="Editar" onClick={() => router.push(`/cursos/${course.id}/editar`)} />
                        <CourseBtn icon={<Trash2 size={13} />} label="Arquivar" danger onClick={() => setDeleteTarget(course)} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", padding: 48, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#a89e9c", background: "#fff", borderRadius: 16, border: "1px solid #ece4e4" }}>
                Nenhum curso encontrado.
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 660 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #ece4e4", background: "#fdfbfb" }}>
                    {["Curso", "Categoria", "Professor", "Módulos", "Alunos", "Status", ""].map((h) => (
                      <th key={h} style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#a89e9c", padding: "13px 16px", textAlign: "left", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const tag = makeTag(c.title, c.category);
                    const gradient = hashGradient(c.id);
                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid #f6f1f1" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                              {tag}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{c.title}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13.5, fontWeight: 600, color: "#6a605e" }}>{c.category || "—"}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13.5, fontWeight: 500, color: "#6a605e" }}>{c.teacher.name}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{c._count.modules}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{c._count.enrollments}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <Badge variant={STATUS_BADGE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <CourseBtn icon={<Eye size={14} />} label="Ver" onClick={() => setToast("Visualizando curso")} />
                            <CourseBtn icon={<Pencil size={13} />} label="Editar" onClick={() => router.push(`/cursos/${c.id}/editar`)} />
                            <CourseBtn icon={<Trash2 size={13} />} label="Arquivar" danger onClick={() => setDeleteTarget(c)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: 40, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#a89e9c" }}>
                        Nenhum curso encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Arquivar curso"
        subtitle="O curso será arquivado e ficará invisível para os alunos."
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} style={cancelBtnStyle}>Cancelar</button>
            <button onClick={handleDelete} disabled={deleteCourse.isPending} style={{ ...confirmBtnStyle, background: "#cc2a2a" }}>
              {deleteCourse.isPending ? "Arquivando..." : "Sim, arquivar"}
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, fontWeight: 500, color: "#6a605e", lineHeight: 1.6 }}>
          O curso <strong>{deleteTarget?.title}</strong> será arquivado. Os dados de progresso dos alunos serão preservados.
        </p>
      </Modal>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#a89e9c" }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>{value}</div>
    </div>
  );
}

function CourseBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} title={label} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${danger ? "#f6d6d6" : "#ece4e4"}`, background: danger ? "#fceeee" : "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: danger ? "#CC1F1F" : "#6a605e" }}>
      {icon}
    </button>
  );
}

const cancelBtnStyle: React.CSSProperties = { padding: "11px 20px", borderRadius: 10, border: "1.5px solid #ece4e4", background: "#fff", fontSize: 14, fontWeight: 700, color: "#6a605e", cursor: "pointer" };
const confirmBtnStyle: React.CSSProperties = { padding: "11px 20px", borderRadius: 10, border: "none", background: "#CC1F1F", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(204,31,31,0.22)" };
