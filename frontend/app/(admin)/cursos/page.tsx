"use client";

import { useState, useMemo } from "react";
import type React from "react";
import { Plus, Search, LayoutGrid, List, Pencil, Trash2, Eye, Upload } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { MOCK_COURSES, type CourseStatus } from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";

const STATUS_VARIANT: Record<CourseStatus, "published" | "draft" | "archived"> = {
  Publicado: "published",
  Rascunho: "draft",
  Arquivado: "archived",
};

const CATEGORIES = ["Segurança", "Técnico", "Comportamental", "Compliance"];
const PROFESSORS = ["Ricardo Paz", "Helena Dias", "Bruno Alves", "Sofia Nunes"];

export default function CursosPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [professorFilter, setProfessorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | CourseStatus>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    professor: "",
    status: "Rascunho" as CourseStatus,
  });

  const filtered = useMemo(() => {
    return MOCK_COURSES.filter((c) => {
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = !categoryFilter || c.category === categoryFilter;
      const matchProf = !professorFilter || c.teacher === professorFilter;
      const matchStatus = !statusFilter || c.status === statusFilter;
      return matchSearch && matchCat && matchProf && matchStatus;
    });
  }, [search, categoryFilter, professorFilter, statusFilter]);

  function handleCreate() {
    if (!form.title.trim()) return;
    setModalOpen(false);
    setToast("Curso criado com sucesso!");
    setForm({ title: "", description: "", category: "", professor: "", status: "Rascunho" });
    // TODO: integrar com API real
  }

  function handleDelete() {
    setDeleteId(null);
    setToast("Curso removido.");
    // TODO: integrar com API real
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
            {MOCK_COURSES.length} cursos cadastrados
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
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
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={professorFilter} onChange={(e) => setProfessorFilter(e.target.value)} style={{ ...selectStyle, flex: "0 0 160px" }}>
            <option value="">Professor</option>
            {PROFESSORS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "" | CourseStatus)} style={{ ...selectStyle, flex: "0 0 150px" }}>
            <option value="">Status</option>
            <option value="Publicado">Publicado</option>
            <option value="Rascunho">Rascunho</option>
            <option value="Arquivado">Arquivado</option>
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

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
            {filtered.map((course) => (
              <div
                key={course.id}
                style={{
                  background: "#fff",
                  border: "1px solid #ece4e4",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    height: 130,
                    background: course.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.22)",
                      backdropFilter: "blur(8px)",
                      border: "2px solid rgba(255,255,255,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    {course.tag}
                  </div>
                  <div style={{ position: "absolute", top: 12, right: 12 }}>
                    <Badge variant={STATUS_VARIANT[course.status]}>{course.status}</Badge>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ marginBottom: 8 }}>
                    <Badge variant="draft">{course.category}</Badge>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#16100f", lineHeight: 1.35, marginBottom: 10 }}>
                    {course.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: course.teacherColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 800,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {course.teacherInitials}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#6a605e" }}>{course.teacher}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid #f4eded" }}>
                    <Stat label="Aulas" value={course.lessons} />
                    <Stat label="Alunos" value={course.students} />
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                      <CourseBtn icon={<Eye size={14} />} label="Ver" onClick={() => setToast("Visualizando curso")} />
                      <CourseBtn icon={<Pencil size={13} />} label="Editar" onClick={() => setToast("Editando curso")} />
                      <CourseBtn icon={<Trash2 size={13} />} label="Excluir" danger onClick={() => setDeleteId(course.id)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", padding: 48, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#a89e9c", background: "#fff", borderRadius: 16, border: "1px solid #ece4e4" }}>
                Nenhum curso encontrado.
              </div>
            )}
          </div>
        ) : (
          /* List view */
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 660 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #ece4e4", background: "#fdfbfb" }}>
                    {["Curso", "Categoria", "Professor", "Aulas", "Alunos", "Status", ""].map((h) => (
                      <th key={h} style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#a89e9c", padding: "13px 16px", textAlign: "left", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid #f6f1f1" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 9, background: c.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                            {c.tag}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{c.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13.5, fontWeight: 600, color: "#6a605e" }}>{c.category}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13.5, fontWeight: 500, color: "#6a605e" }}>{c.teacher}</td>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{c.lessons}</td>
                      <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "#3a3030" }}>{c.students}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <CourseBtn icon={<Eye size={14} />} label="Ver" onClick={() => setToast("Visualizando curso")} />
                          <CourseBtn icon={<Pencil size={13} />} label="Editar" onClick={() => setToast("Editando curso")} />
                          <CourseBtn icon={<Trash2 size={13} />} label="Excluir" danger onClick={() => setDeleteId(c.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* New Course Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo curso"
        subtitle="Preencha as informações do curso."
        maxWidth={520}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid #ece4e4", background: "#fff", fontSize: 14, fontWeight: 700, color: "#6a605e", cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={handleCreate} style={{ padding: "11px 20px", borderRadius: 10, border: "none", background: PRIMARY, fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(204,31,31,0.22)" }}>
              Criar curso
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <FieldLabel>Título do curso</FieldLabel>
            <input placeholder="Ex: Segurança no Trabalho" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <FieldLabel>Descrição</FieldLabel>
            <textarea
              placeholder="Descreva o objetivo do curso..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Categoria</FieldLabel>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={selectStyle}>
                <option value="">Selecionar</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Professor</FieldLabel>
              <select value={form.professor} onChange={(e) => setForm((f) => ({ ...f, professor: e.target.value }))} style={selectStyle}>
                <option value="">Selecionar</option>
                {PROFESSORS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          {/* Thumbnail upload */}
          <div>
            <FieldLabel>Thumbnail</FieldLabel>
            <div
              style={{
                border: "2px dashed #d8c8c8",
                borderRadius: 12,
                padding: 24,
                textAlign: "center",
                cursor: "pointer",
                background: "#fdfbfb",
              }}
            >
              <Upload size={22} color="#a89e9c" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#6a605e" }}>Clique para enviar</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#a89e9c", marginTop: 3 }}>PNG, JPG até 2 MB</div>
            </div>
          </div>
          {/* Status */}
          <div>
            <FieldLabel>Status inicial</FieldLabel>
            <div style={{ display: "flex", gap: 10 }}>
              {(["Rascunho", "Publicado"] as CourseStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 10,
                    border: `2px solid ${form.status === s ? PRIMARY : "#ece4e4"}`,
                    background: form.status === s ? "#fceeee" : "#fff",
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: form.status === s ? PRIMARY : "#6a605e",
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Remover curso"
        subtitle="Essa ação não pode ser desfeita."
        footer={
          <>
            <button onClick={() => setDeleteId(null)} style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid #ece4e4", background: "#fff", fontSize: 14, fontWeight: 700, color: "#6a605e", cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={handleDelete} style={{ padding: "11px 20px", borderRadius: 10, border: "none", background: "#cc2a2a", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
              Sim, remover
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, fontWeight: 500, color: "#6a605e", lineHeight: 1.6 }}>
          O curso será removido permanentemente. Todos os dados de progresso dos alunos serão preservados nos relatórios.
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
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        border: `1px solid ${danger ? "#f6d6d6" : "#ece4e4"}`,
        background: danger ? "#fceeee" : "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: danger ? PRIMARY : "#6a605e",
      }}
    >
      {icon}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#6a605e", marginBottom: 6 }}>
      {children}
    </label>
  );
}
