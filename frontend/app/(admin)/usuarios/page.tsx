"use client";

import { useState, useMemo } from "react";
import type React from "react";
import { UserPlus, Search, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";
import { Toast } from "@/components/ui/Toast";
import { MOCK_USERS, type UserRole, type UserStatus } from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";

const ROLE_VARIANT: Record<UserRole, "admin" | "professor" | "estudante"> = {
  Admin: "admin",
  Professor: "professor",
  Estudante: "estudante",
};

export default function UsuariosPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | UserRole>("");
  const [statusFilter, setStatusFilter] = useState<"" | UserStatus>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", role: "Estudante" as UserRole, sendInvite: true });

  const filtered = useMemo(() => {
    return MOCK_USERS.filter((u) => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchStatus = !statusFilter || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [search, roleFilter, statusFilter]);

  function handleAddUser() {
    if (!form.name.trim() || !form.email.trim()) return;
    setModalOpen(false);
    setToast("Usuário adicionado com sucesso!");
    setForm({ name: "", email: "", role: "Estudante", sendInvite: true });
    // TODO: integrar com API real
  }

  function handleDelete() {
    setDeleteId(null);
    setToast("Usuário removido.");
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
            Gestão de Usuários
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
            847 usuários cadastrados
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
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
            <Search
              size={15}
              color="#a89e9c"
              style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
            <input
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "" | UserRole)}
            style={{ ...selectStyle, flex: "0 0 160px" }}
          >
            <option value="">Todos os perfis</option>
            <option value="Admin">Admin</option>
            <option value="Professor">Professor</option>
            <option value="Estudante">Estudante</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | UserStatus)}
            style={{ ...selectStyle, flex: "0 0 150px" }}
          >
            <option value="">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>

        {/* Table */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #ece4e4",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
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
                {filtered.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f6f1f1" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: u.avatarColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12.5,
                            fontWeight: 800,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {u.initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{u.name}</div>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Badge variant={ROLE_VARIANT[u.role]}>{u.role}</Badge>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "#6a605e" }}>
                      {u.courses}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13.5, fontWeight: 500, color: "#8a807e" }}>
                      {u.lastAccess}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: u.status === "Ativo" ? "#1f8a5b" : "#d0c4c4",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: u.status === "Ativo" ? "#1f8a5b" : "#8a807e",
                          }}
                        >
                          {u.status}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <ActionBtn icon={<Eye size={15} />} label="Ver" onClick={() => setToast("Visualizando usuário")} />
                        <ActionBtn icon={<Pencil size={14} />} label="Editar" onClick={() => setToast("Editar usuário")} />
                        <ActionBtn
                          icon={<Trash2 size={14} />}
                          label="Excluir"
                          danger
                          onClick={() => setDeleteId(u.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
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
              Mostrando {filtered.length} de 847 usuários
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {[<ChevronLeft key="prev" size={16} />, "1", "2", "3", "...", "47", <ChevronRight key="next" size={16} />].map((label, i) => (
                <button
                  key={i}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    border: `1px solid ${i === 1 ? PRIMARY : "#ece4e4"}`,
                    background: i === 1 ? PRIMARY : "#fff",
                    color: i === 1 ? "#fff" : "#6a605e",
                    fontSize: 13.5,
                    fontWeight: i === 1 ? 800 : 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {label}
                </button>
              ))}
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
            <button
              onClick={() => setModalOpen(false)}
              style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid #ece4e4", background: "#fff", fontSize: 14, fontWeight: 700, color: "#6a605e", cursor: "pointer" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleAddUser}
              style={{ padding: "11px 20px", borderRadius: 10, border: "none", background: PRIMARY, fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(204,31,31,0.22)" }}
            >
              Adicionar
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <Label>Nome completo</Label>
            <input
              placeholder="Ex: Maria Santos"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <Label>E-mail</Label>
            <input
              type="email"
              placeholder="maria@empresa.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <Label>Perfil</Label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
              style={selectStyle}
            >
              <option value="Estudante">Estudante</option>
              <option value="Professor">Professor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#fdfbfb", border: "1.5px solid #ece4e4", borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>Enviar convite por e-mail</div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>
                O usuário receberá um link de acesso.
              </div>
            </div>
            <Switch checked={form.sendInvite} onChange={() => setForm((f) => ({ ...f, sendInvite: !f.sendInvite }))} />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Remover usuário"
        subtitle="Essa ação não pode ser desfeita. Deseja continuar?"
        footer={
          <>
            <button
              onClick={() => setDeleteId(null)}
              style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid #ece4e4", background: "#fff", fontSize: 14, fontWeight: 700, color: "#6a605e", cursor: "pointer" }}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              style={{ padding: "11px 20px", borderRadius: 10, border: "none", background: "#cc2a2a", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" }}
            >
              Sim, remover
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, fontWeight: 500, color: "#6a605e", lineHeight: 1.6 }}>
          O usuário perderá acesso imediato à plataforma e todos os seus dados de progresso serão preservados nos relatórios.
        </p>
      </Modal>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

function ActionBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 32,
        height: 32,
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#6a605e", marginBottom: 6 }}>
      {children}
    </label>
  );
}
