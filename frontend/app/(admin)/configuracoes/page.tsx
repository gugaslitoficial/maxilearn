"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { Building2, CreditCard, Bell, Shield, Save, Lock } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { Toast } from "@/components/ui/Toast";
import { useCompany, useUpdateCompany } from "@/hooks/use-company";
import { getErrorMessage } from "@/lib/utils";

const PRIMARY = "#CC1F1F";

type Tab = "dados" | "plano" | "notificacoes" | "seguranca";

const TABS: { key: Tab; label: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { key: "dados", label: "Dados gerais", Icon: Building2 },
  { key: "plano", label: "Plano atual", Icon: CreditCard },
  { key: "notificacoes", label: "Notificações", Icon: Bell },
  { key: "seguranca", label: "Segurança", Icon: Shield },
];

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#6a605e", marginBottom: 6 }}>{children}</label>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 16, fontWeight: 800, color: "#16100f", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f4eded" }}>{children}</h3>;
}

function UsageBar({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700 }}>
        <span style={{ color: "#3a3030" }}>{label}</span>
        <span style={{ color: "#8a807e" }}>{used} / {total}</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.3)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#fff", opacity: 0.85, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f4eded", gap: 24 }}>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#16100f" }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>{description}</div>
      </div>
      <Switch checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}

function Sk({ h, r = 8 }: { h: number; r?: number }) {
  return <div className="animate-pulse" style={{ width: "100%", height: h, borderRadius: r, background: "#f1ece9" }} />;
}

export default function ConfiguracoesPage() {
  const [tab, setTab] = useState<Tab>("dados");
  const [toast, setToast] = useState<string | null>(null);

  const { data: company, isLoading } = useCompany();
  const updateCompany = useUpdateCompany();

  // Local form state — initialized from API once loaded
  const [dados, setDados] = useState({ name: "", cnpj: "", segment: "", contactEmail: "", phone: "", site: "" });
  const [notifs, setNotifs] = useState({ notifNewUser: true, notifCourseDone: true, notifInactiveAlert: false });
  const [sec, setSec] = useState({ secTwoFactor: false, secStrongPassword: true, secSessionHours: 8 });

  useEffect(() => {
    if (!company) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDados({
      name: company.name ?? "",
      cnpj: company.cnpj ?? "",
      segment: company.segment ?? "",
      contactEmail: company.contactEmail ?? "",
      phone: company.phone ?? "",
      site: company.site ?? "",
    });
    setNotifs({
      notifNewUser: company.notifNewUser,
      notifCourseDone: company.notifCourseDone,
      notifInactiveAlert: company.notifInactiveAlert,
    });
    setSec({
      secTwoFactor: company.secTwoFactor,
      secStrongPassword: company.secStrongPassword,
      secSessionHours: company.secSessionHours,
    });
  }, [company]);

  async function handleSaveDados() {
    try {
      await updateCompany.mutateAsync({
        name: dados.name,
        cnpj: dados.cnpj || undefined,
        segment: dados.segment || undefined,
        contactEmail: dados.contactEmail || undefined,
        phone: dados.phone || undefined,
        site: dados.site || undefined,
      });
      setToast("Configurações salvas com sucesso!");
    } catch (err) {
      setToast(getErrorMessage(err));
    }
  }

  async function handleSaveSec() {
    try {
      await updateCompany.mutateAsync({
        secTwoFactor: sec.secTwoFactor,
        secStrongPassword: sec.secStrongPassword,
        secSessionHours: sec.secSessionHours,
      });
      setToast("Configurações de segurança salvas!");
    } catch (err) {
      setToast(getErrorMessage(err));
    }
  }

  async function toggleNotif(key: keyof typeof notifs) {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    try {
      await updateCompany.mutateAsync({ [key]: next[key] });
      setToast("Preferências atualizadas!");
    } catch (err) {
      setNotifs(notifs); // revert
      setToast(getErrorMessage(err));
    }
  }

  return (
    <>
      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "20px clamp(20px,3vw,36px)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>
          Configurações da Empresa
        </h1>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
          Gerencie os dados e preferências da sua conta.
        </p>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 0, maxWidth: 820 }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, padding: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: "1 1 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: tab === key ? PRIMARY : "transparent",
                color: tab === key ? "#fff" : "#6a605e",
                fontSize: 13.5,
                fontWeight: tab === key ? 800 : 600,
                cursor: "pointer",
                transition: "all .15s",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={15} color={tab === key ? "#fff" : "#8a807e"} />
              {label}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: "clamp(22px,3vw,32px)" }}>
          {/* DADOS GERAIS */}
          {tab === "dados" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <SectionTitle>Informações da empresa</SectionTitle>
              {isLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Array.from({ length: 5 }).map((_, i) => <Sk key={i} h={42} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div style={{ gridColumn: "1/-1" }}>
                    <FieldLabel>Nome da empresa</FieldLabel>
                    <input value={dados.name} onChange={(e) => setDados((d) => ({ ...d, name: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>CNPJ</FieldLabel>
                    <input value={dados.cnpj} onChange={(e) => setDados((d) => ({ ...d, cnpj: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Segmento</FieldLabel>
                    <select value={dados.segment} onChange={(e) => setDados((d) => ({ ...d, segment: e.target.value }))} style={selectStyle}>
                      <option value="">Selecionar</option>
                      <option>Indústria</option>
                      <option>Varejo</option>
                      <option>Serviços</option>
                      <option>Tecnologia</option>
                      <option>Saúde</option>
                      <option>Educação</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>E-mail de contato</FieldLabel>
                    <input type="email" value={dados.contactEmail} onChange={(e) => setDados((d) => ({ ...d, contactEmail: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Telefone</FieldLabel>
                    <input value={dados.phone} onChange={(e) => setDados((d) => ({ ...d, phone: e.target.value }))} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <FieldLabel>Site</FieldLabel>
                    <input value={dados.site} onChange={(e) => setDados((d) => ({ ...d, site: e.target.value }))} style={inputStyle} />
                  </div>
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={handleSaveDados}
                  disabled={updateCompany.isPending || isLoading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 22px",
                    borderRadius: 10,
                    border: "none",
                    background: PRIMARY,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    cursor: "pointer",
                    boxShadow: "0 6px 16px rgba(204,31,31,0.22)",
                    opacity: updateCompany.isPending ? 0.7 : 1,
                  }}
                >
                  <Save size={16} />
                  {updateCompany.isPending ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </div>
          )}

          {/* PLANO ATUAL — read-only */}
          {tab === "plano" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <SectionTitle>Plano atual</SectionTitle>
              <div style={{ borderRadius: 18, background: "linear-gradient(135deg,#CC1F1F 0%,#a01515 100%)", padding: "28px 30px", color: "#fff", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7, marginBottom: 8 }}>Plano</div>
                <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 4 }}>Profissional</div>
                <div style={{ fontSize: 18, fontWeight: 800, opacity: 0.9, marginBottom: 20 }}>R$ 799<span style={{ fontSize: 13, fontWeight: 600, opacity: 0.75 }}>/mês</span></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <UsageBar label="Usuários" used={847} total={1000} />
                  <UsageBar label="Cursos" used={32} total={100} />
                  <UsageBar label="Armazenamento" used={18} total={50} />
                </div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.2)", fontSize: 13.5, fontWeight: 700, opacity: 0.85 }}>
                  Renovação em <span style={{ color: "#ffd6d6", fontWeight: 800 }}>14 de julho de 2026</span>
                </div>
              </div>
              <div style={{ padding: "14px 18px", background: "#fdfbfb", border: "1.5px solid #ece4e4", borderRadius: 12, fontSize: 13.5, fontWeight: 500, color: "#6a605e", lineHeight: 1.6 }}>
                Para alterar, cancelar ou fazer upgrade do plano, entre em contato com{" "}
                <span style={{ color: PRIMARY, fontWeight: 700 }}>suporte@maxilearn.com.br</span>
              </div>
            </div>
          )}

          {/* NOTIFICAÇÕES */}
          {tab === "notificacoes" && (
            <div>
              <SectionTitle>Preferências de notificação</SectionTitle>
              {isLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Array.from({ length: 3 }).map((_, i) => <Sk key={i} h={56} />)}
                </div>
              ) : (
                <>
                  <ToggleRow label="Novo usuário cadastrado" description="Receba um e-mail quando um novo usuário se cadastrar." checked={notifs.notifNewUser} onChange={() => toggleNotif("notifNewUser")} />
                  <ToggleRow label="Curso concluído" description="Seja notificado quando um aluno concluir um curso." checked={notifs.notifCourseDone} onChange={() => toggleNotif("notifCourseDone")} />
                  <ToggleRow label="Alerta de inatividade" description="Receba alertas sobre usuários sem acesso há mais de 14 dias." checked={notifs.notifInactiveAlert} onChange={() => toggleNotif("notifInactiveAlert")} />
                </>
              )}
            </div>
          )}

          {/* SEGURANÇA */}
          {tab === "seguranca" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {isLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Array.from({ length: 3 }).map((_, i) => <Sk key={i} h={56} />)}
                </div>
              ) : (
                <>
                  <div>
                    <SectionTitle>Autenticação</SectionTitle>
                    <ToggleRow
                      label="Autenticação de dois fatores (2FA)"
                      description="Exige código de verificação adicional no login de todos os usuários Admin."
                      checked={sec.secTwoFactor}
                      onChange={() => setSec((s) => ({ ...s, secTwoFactor: !s.secTwoFactor }))}
                    />
                  </div>
                  <div>
                    <SectionTitle>Política de senha</SectionTitle>
                    <ToggleRow
                      label="Exigir senha forte"
                      description="Mínimo de 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos."
                      checked={sec.secStrongPassword}
                      onChange={() => setSec((s) => ({ ...s, secStrongPassword: !s.secStrongPassword }))}
                    />
                  </div>
                  <div>
                    <SectionTitle>Sessão</SectionTitle>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <Lock size={18} color="#8a807e" />
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#16100f" }}>Tempo máximo de sessão inativa</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>Usuários serão desconectados após o tempo definido.</div>
                      </div>
                      <select value={String(sec.secSessionHours)} onChange={(e) => setSec((s) => ({ ...s, secSessionHours: Number(e.target.value) }))} style={{ ...selectStyle, width: 140 }}>
                        <option value="1">1 hora</option>
                        <option value="4">4 horas</option>
                        <option value="8">8 horas</option>
                        <option value="24">24 horas</option>
                        <option value="0">Nunca</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              <div>
                <button
                  onClick={handleSaveSec}
                  disabled={updateCompany.isPending || isLoading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 22px",
                    borderRadius: 10,
                    border: "none",
                    background: PRIMARY,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    cursor: "pointer",
                    boxShadow: "0 6px 16px rgba(204,31,31,0.22)",
                    opacity: updateCompany.isPending ? 0.7 : 1,
                  }}
                >
                  <Save size={16} />
                  {updateCompany.isPending ? "Salvando..." : "Salvar configurações"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
