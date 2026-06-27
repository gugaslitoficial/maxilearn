"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { UserPlus, Search, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";
import { Toast } from "@/components/ui/Toast";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/use-users";
import type { ApiUser } from "@/hooks/use-users";
import {
  ROLE_LABEL,
  ROLE_PT_TO_API,
  hashAvatarColor,
  makeInitials,
  relativeTime,
  getErrorMessage,
} from "@/lib/utils";
import type { ApiRole } from "@/lib/utils";

const PRIMARY = "var(--color-primary)";
const PER_PAGE = 20;

const ROLE_BADGE_VARIANT: Record<ApiRole, "admin" | "professor" | "estudante"> = {
  ADMIN: "admin",
  PROFESSOR: "professor",
  STUDENT: "estudante",
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
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%23a89e9c' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 34,
};

export default function UsuariosPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<ApiRole | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null);
  const [editTarget, setEditTarget] = useState<ApiUser | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "STUDENT" as ApiRole, sendInvite: true });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const isActive =
    statusFilter === "true" ? true : statusFilter === "false" ? false : undefined;

  const { data, isLoading } = useUsers({
    page,
    perPage: PER_PAGE,
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    isActive,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 1;

  async function handleAddUser() {
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      await createUser.mutateAsync({ name: form.name, email: form.email, role: form.role, sendInvite: form.sendInvite });
      setModalOpen(false);
      setToast("Usuário adicionado com sucesso!");
      setForm({ name: "", email: "", role: "STUDENT", sendInvite: true });
    } catch (err) {
      setToast(getErrorMessage(err));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setToast("Usuário desativado.");
    } catch (err) {
      setToast(getErrorMessage(err));
    }
  }

  async function handleEdit() {
    if (!editTarget) return;
    try {
      await updateUser.mutateAsync({ id: editTarget.id, name: editTarget.name, email: editTarget.email, role: editTarget.role });
      setEditTarget(null);
      setToast("Usuário atualizado.");
    } catch (err) {
      setToast(getErrorMessage(err));
    }
  }

  function renderPageButtons() {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
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
            Gestão de Usuários
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
            {data ? `${data.total} usuários cadastrados` : "Carregando..."}
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
          <UserPlus size={16} />
          Adicionar usuário
        </button>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
            <Search size={15} color="#a89e9c" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as ApiRole | ""); setPage(1); }}
            style={{ ...selectStyle, flex: "0 0 160px" }}
          >
            <option value="">Todos os perfis</option>
            <option value="ADMIN">Admin</option>
            <option value="PROFESSOR">Professor</option>
            <option value="STUDENT">Estudante</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as "" | "true" | "false"); setPage(1); }}
            style={{ ...selectStyle, flex: "0 0 150px" }}
          >
            <option value="">Todos os status</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ece4e4", background: "#fdfbfb" }}>
                  {["Usuário", "Perfil", "Cursos", "Último acesso", "Status", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "#a89e9c",
                        padding: "13px 16px",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f6f1f1" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                            <Sk w={36} h={36} r={999} />
                            <div style={{ flex: 1 }}>
                              <Sk h={13} /><div style={{ marginTop: 5 }}><Sk w="70%" h={11} /></div>
                            </div>
                          </div>
                        </td>
                        {[36, 40, 80, 60, 32].map((w, j) => (
                          <td key={j} style={{ padding: "14px 16px" }}><Sk w={w} h={13} /></td>
                        ))}
                      </tr>
                    ))
                  : (data?.data ?? []).map((u) => {
                      const initials = makeInitials(u.name);
                      const avatarColor = hashAvatarColor(u.id);
                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid #f6f1f1" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  background: avatarColor,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 12.5,
                                  fontWeight: 800,
                                  color: "#fff",
                                  flexShrink: 0,
                                }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{u.name}</div>
                                <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <Badge variant={ROLE_BADGE_VARIANT[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "#6a605e" }}>
                            {u.courseCount || "—"}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: 13.5, fontWeight: 500, color: "#8a807e" }}>
                            {relativeTime(u.lastAccessAt)}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: u.isActive ? "#1f8a5b" : "#d0c4c4",
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ fontSize: 13, fontWeight: 700, color: u.isActive ? "#1f8a5b" : "#8a807e" }}>
                                {u.isActive ? "Ativo" : "Inativo"}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <ActionBtn icon={<Eye size={15} />} label="Ver" onClick={() => setEditTarget(u)} />
                              <ActionBtn icon={<Pencil size={14} />} label="Editar" onClick={() => setEditTarget(u)} />
                              <ActionBtn
                                icon={<Trash2 size={14} />}
                                label="Desativar"
                                danger
                                onClick={() => setDeleteTarget(u)}
                                disabled={!u.isActive}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                {!isLoading && (data?.data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#a89e9c" }}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderTop: "1px solid #f4eded",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e" }}>
              {data
                ? `Mostrando ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, data.total)} de ${data.total} usuários`
                : ""}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <PaginationBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={16} />
              </PaginationBtn>
              {renderPageButtons().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13.5, color: "#6a605e" }}>
                    …
                  </span>
                ) : (
                  <PaginationBtn key={p} active={p === page} onClick={() => setPage(p as number)}>
                    {p}
                  </PaginationBtn>
                )
              )}
              <PaginationBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={16} />
              </PaginationBtn>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Adicionar usuário"
        subtitle="Preencha os dados do novo usuário."
        footer={
          <>
            <button onClick={() => setModalOpen(false)} style={cancelBtnStyle}>Cancelar</button>
            <button onClick={handleAddUser} disabled={createUser.isPending} style={confirmBtnStyle}>
              {createUser.isPending ? "Adicionando..." : "Adicionar"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <Label>Nome completo</Label>
            <input placeholder="Ex: Maria Santos" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <Label>E-mail</Label>
            <input type="email" placeholder="maria@empresa.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <Label>Perfil</Label>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as ApiRole }))} style={selectStyle}>
              <option value="STUDENT">Estudante</option>
              <option value="PROFESSOR">Professor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#fdfbfb", border: "1.5px solid #ece4e4", borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>Enviar convite por e-mail</div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>O usuário receberá um link de acesso.</div>
            </div>
            <Switch checked={form.sendInvite} onChange={() => setForm((f) => ({ ...f, sendInvite: !f.sendInvite }))} />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {editTarget && (
        <Modal
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          title="Editar usuário"
          subtitle="Altere os dados do usuário."
          footer={
            <>
              <button onClick={() => setEditTarget(null)} style={cancelBtnStyle}>Cancelar</button>
              <button onClick={handleEdit} disabled={updateUser.isPending} style={confirmBtnStyle}>
                {updateUser.isPending ? "Salvando..." : "Salvar"}
              </button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <Label>Nome completo</Label>
              <input value={editTarget.name} onChange={(e) => setEditTarget((u) => u && { ...u, name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <Label>E-mail</Label>
              <input type="email" value={editTarget.email} onChange={(e) => setEditTarget((u) => u && { ...u, email: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <Label>Perfil</Label>
              <select value={editTarget.role} onChange={(e) => setEditTarget((u) => u && { ...u, role: e.target.value as ApiRole })} style={selectStyle}>
                <option value="STUDENT">Estudante</option>
                <option value="PROFESSOR">Professor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Desativar usuário"
        subtitle="O usuário perderá acesso à plataforma. Deseja continuar?"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} style={cancelBtnStyle}>Cancelar</button>
            <button onClick={handleDelete} disabled={deleteUser.isPending} style={{ ...confirmBtnStyle, background: "#cc2a2a" }}>
              {deleteUser.isPending ? "Desativando..." : "Sim, desativar"}
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, fontWeight: 500, color: "#6a605e", lineHeight: 1.6 }}>
          O usuário <strong>{deleteTarget?.name}</strong> perderá acesso imediato à plataforma. Os dados de progresso serão preservados.
        </p>
      </Modal>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionBtn({ icon, label, onClick, danger, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      disabled={disabled}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: `1px solid ${danger ? "#f6d6d6" : "#ece4e4"}`,
        background: danger ? "#fceeee" : "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        color: danger ? PRIMARY : "#6a605e",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {icon}
    </button>
  );
}

function PaginationBtn({ children, onClick, active, disabled }: { children: React.ReactNode; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 34,
        height: 34,
        borderRadius: 9,
        border: `1px solid ${active ? PRIMARY : "#ece4e4"}`,
        background: active ? PRIMARY : "#fff",
        color: active ? "#fff" : "#6a605e",
        fontSize: 13.5,
        fontWeight: active ? 800 : 600,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#6a605e", marginBottom: 6 }}>
      {children}
    </label>
  );
}

const cancelBtnStyle: React.CSSProperties = {
  padding: "11px 20px", borderRadius: 10, border: "1.5px solid #ece4e4",
  background: "#fff", fontSize: 14, fontWeight: 700, color: "#6a605e", cursor: "pointer",
};

const confirmBtnStyle: React.CSSProperties = {
  padding: "11px 20px", borderRadius: 10, border: "none",
  background: PRIMARY, fontSize: 14, fontWeight: 700, color: "#fff",
  cursor: "pointer", boxShadow: "0 4px 12px rgba(204,31,31,0.22)",
};
