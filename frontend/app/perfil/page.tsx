"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Toast } from "@/components/ui/Toast";

const PRIMARY = "#CC1F1F";
type Tab = "dados" | "seg" | "pref" | "assin";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  fontFamily: "Manrope, system-ui, sans-serif",
  fontSize: 14.5,
  fontWeight: 500,
  color: "#16100f",
  background: "#faf7f7",
  border: "1px solid #eadfdf",
  borderRadius: 11,
  padding: "13px 15px",
  outline: "none",
  boxSizing: "border-box",
};
const LABEL_STYLE: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: "#3a3030", marginBottom: 7 };
const FOOTER_STYLE: React.CSSProperties = { padding: "18px 26px", borderTop: "1px solid #f4eded", background: "#fcfafa", display: "flex", gap: 12, justifyContent: "flex-end" };
const CANCEL_BTN: React.CSSProperties = { fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: "12px 20px", cursor: "pointer" };
const SAVE_BTN: React.CSSProperties = { fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: "12px 22px", cursor: "pointer", boxShadow: "0 8px 20px rgba(204,31,31,0.26)" };

interface ProfileData {
  name: string;
  email: string;
  avatarUrl: string | null;
  jobTitle?: string | null;
  bio?: string | null;
}

function Switch({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      type="button"
      style={{
        position: "relative",
        width: 44,
        height: 26,
        borderRadius: 100,
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background .2s",
        background: on ? PRIMARY : "#d8cccc",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          transition: "left .2s",
        }}
      />
    </button>
  );
}

const PAYMENTS = [
  { date: "14 jun 2026", method: "Cartão final 4291", amount: "R$ 799,00" },
  { date: "14 mai 2026", method: "Cartão final 4291", amount: "R$ 799,00" },
  { date: "14 abr 2026", method: "Cartão final 4291", amount: "R$ 799,00" },
];

export default function PerfilPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("dados");
  const [twofa, setTwofa] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [prefNovo, setPrefNovo] = useState(true);
  const [prefConcl, setPrefConcl] = useState(true);
  const [prefResumo, setPrefResumo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form state — personal data
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Form state — password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const profileQ = useQuery<ProfileData>({
    queryKey: ["profile-me"],
    queryFn: async () => {
      const { data } = await api.get<ProfileData>("/users/me");
      return data;
    },
    staleTime: 30_000,
    retry: 1,
  });

  useEffect(() => {
    if (profileQ.data) {
      setName(profileQ.data.name ?? "");
      setJobTitle(profileQ.data.jobTitle ?? "");
      setBio(profileQ.data.bio ?? "");
      setAvatarUrl(profileQ.data.avatarUrl ?? "");
    }
  }, [profileQ.data]);

  const updateProfile = useMutation({
    mutationFn: (payload: { name: string; jobTitle: string; bio: string; avatarUrl: string }) =>
      api.patch("/users/me", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile-me"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      setToast("Alterações salvas com sucesso!");
    },
    onError: () => setToast("Erro ao salvar. Tente novamente."),
  });

  const updatePassword = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      api.patch("/users/me/password", payload),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToast("Senha atualizada com sucesso!");
    },
    onError: () => setToast("Erro ao atualizar senha. Verifique a senha atual."),
  });

  function handleSaveProfile() {
    updateProfile.mutate({ name, jobTitle, bio, avatarUrl });
  }

  function handleSavePassword() {
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setToast("As senhas não coincidem.");
      return;
    }
    updatePassword.mutate({ currentPassword, newPassword });
  }

  const role = user?.role ?? "ADMIN";
  const initials = name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "??";

  const tabStyle = (k: Tab): React.CSSProperties => tab === k
    ? { fontFamily: "inherit", fontSize: 14, fontWeight: 800, padding: "11px 16px", border: "none", background: "transparent", cursor: "pointer", borderBottom: `2.5px solid ${PRIMARY}`, color: PRIMARY }
    : { fontFamily: "inherit", fontSize: 14, fontWeight: 700, padding: "11px 16px", border: "none", background: "transparent", cursor: "pointer", borderBottom: "2.5px solid transparent", color: "#8a807e" };

  return (
    <div style={{ fontFamily: "Manrope, system-ui, sans-serif", color: "#16100f", background: "#f6f4f3", minHeight: "100vh" }}>
      <style>{`
        @media(max-width:600px){.perfil-tabs{overflow-x:auto; white-space:nowrap;} .perfil-grid2{grid-template-columns:1fr!important;}}
      `}</style>
      <Toast message={toast} onDismiss={() => setToast(null)} />

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "22px clamp(20px,3vw,36px) 0" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Meu perfil</h1>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>Gerencie seus dados, segurança e preferências.</p>
        <div className="perfil-tabs" style={{ display: "flex", gap: 4, marginTop: 18 }}>
          <button onClick={() => setTab("dados")} style={tabStyle("dados")}>Dados pessoais</button>
          <button onClick={() => setTab("seg")}   style={tabStyle("seg")}>Segurança</button>
          <button onClick={() => setTab("pref")}  style={tabStyle("pref")}>Preferências</button>
          {role === "ADMIN" && (
            <button onClick={() => setTab("assin")} style={tabStyle("assin")}>Assinatura</button>
          )}
        </div>
      </header>

      <div style={{ flex: 1, padding: "clamp(22px,3vw,34px)", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 720 }}>

          {/* TAB: DADOS */}
          {tab === "dados" && (
            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "24px 26px", borderBottom: "1px solid #f4eded" }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#16100f" }}>Dados pessoais</h2>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "#8a807e", marginTop: 3 }}>Informações exibidas no seu perfil.</p>
              </div>
              <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 22 }}>
                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                  <div style={{ flexShrink: 0 }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 84, height: 84, borderRadius: "50%", background: "linear-gradient(135deg,#CC1F1F,#e85a4f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, color: "#fff" }}>
                        {initials}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>Foto de perfil</div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", marginTop: 2, marginBottom: 10 }}>Cole uma URL de imagem (JPG ou PNG).</div>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://exemplo.com/foto.jpg"
                      style={{ ...INPUT_STYLE, fontSize: 13 }}
                    />
                  </div>
                </div>

                <div className="perfil-grid2" style={{ borderTop: "1px solid #f4eded", paddingTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={LABEL_STYLE}>Nome completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={INPUT_STYLE}
                    />
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Cargo / função</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Ex: Gerente de RH"
                      style={INPUT_STYLE}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={LABEL_STYLE}>
                      E-mail{" "}
                      <span style={{ fontWeight: 600, color: "#a89e9c" }}>(somente leitura)</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="email"
                        value={user?.email ?? ""}
                        readOnly
                        style={{ ...INPUT_STYLE, background: "#f1ecec", color: "#8a807e", cursor: "not-allowed", paddingRight: 42 }}
                      />
                      <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#b3a6a6" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </span>
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={LABEL_STYLE}>
                      Bio{" "}
                      <span style={{ fontWeight: 600, color: "#a89e9c" }}>(opcional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Conte um pouco sobre você…"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      style={{ ...INPUT_STYLE, resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>
              <div style={FOOTER_STYLE}>
                <button type="button" style={CANCEL_BTN} onClick={() => profileQ.refetch()}>Cancelar</button>
                <button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  type="button"
                  style={{ ...SAVE_BTN, opacity: updateProfile.isPending ? 0.7 : 1 }}
                >
                  {updateProfile.isPending ? "Salvando…" : "Salvar alterações"}
                </button>
              </div>
            </div>
          )}

          {/* TAB: SEGURANÇA */}
          {tab === "seg" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "24px 26px", borderBottom: "1px solid #f4eded" }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "#16100f" }}>Alterar senha</h2>
                </div>
                <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={LABEL_STYLE}>Senha atual</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      style={INPUT_STYLE}
                    />
                  </div>
                  <div className="perfil-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={LABEL_STYLE}>Nova senha</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        style={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label style={LABEL_STYLE}>Confirmar nova senha</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        style={INPUT_STYLE}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#faf7f7", border: "1px solid #eadfdf", borderRadius: 10, padding: "11px 14px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6a605e" }}>Mínimo 8 caracteres, com ao menos um número e um caractere especial.</span>
                  </div>
                </div>
                <div style={FOOTER_STYLE}>
                  <button
                    onClick={handleSavePassword}
                    disabled={updatePassword.isPending || !currentPassword || !newPassword}
                    type="button"
                    style={{ ...SAVE_BTN, opacity: updatePassword.isPending ? 0.7 : 1 }}
                  >
                    {updatePassword.isPending ? "Atualizando…" : "Atualizar senha"}
                  </button>
                </div>
              </div>
              <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: "22px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>Autenticação de dois fatores (2FA)</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#8a807e", marginTop: 3 }}>Adicione uma camada extra de segurança ao seu login.</div>
                </div>
                <Switch on={twofa} toggle={() => setTwofa(v => !v)} />
              </div>
            </div>
          )}

          {/* TAB: PREFERÊNCIAS */}
          {tab === "pref" && (
            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "24px 26px", borderBottom: "1px solid #f4eded" }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#16100f" }}>Preferências</h2>
              </div>
              <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 22 }}>
                <div className="perfil-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={LABEL_STYLE}>Idioma da interface</label>
                    <select style={{ ...INPUT_STYLE, fontWeight: 600, cursor: "pointer" }}>
                      <option>Português (Brasil)</option>
                      <option>English (US)</option>
                      <option>Español</option>
                    </select>
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Tema</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["light", "dark"] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          type="button"
                          style={{
                            flex: 1,
                            fontFamily: "inherit",
                            fontSize: 13.5,
                            fontWeight: 700,
                            padding: 13,
                            borderRadius: 11,
                            cursor: "pointer",
                            transition: "all .15s",
                            background: theme === t ? PRIMARY : "#fff",
                            color:      theme === t ? "#fff" : "#6a605e",
                            border: `1.5px solid ${theme === t ? PRIMARY : "#e6dede"}`,
                          }}
                        >
                          {t === "light" ? "☀ Claro" : "☾ Escuro"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #f4eded", paddingTop: 18 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#16100f", marginBottom: 6 }}>Notificações por e-mail</div>
                  {[
                    { label: "Novos alunos e inscrições", desc: "Avisar quando alguém entrar.", on: prefNovo, toggle: () => setPrefNovo(v => !v) },
                    { label: "Conclusões e certificados",  desc: "Resumo de conclusões de curso.",  on: prefConcl, toggle: () => setPrefConcl(v => !v) },
                    { label: "Resumo semanal",             desc: "Relatório por e-mail toda segunda.", on: prefResumo, toggle: () => setPrefResumo(v => !v) },
                  ].map((p, i, arr) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid #f6f1f1" : "none" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{p.label}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", marginTop: 1 }}>{p.desc}</div>
                      </div>
                      <Switch on={p.on} toggle={p.toggle} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={FOOTER_STYLE}>
                <button type="button" style={CANCEL_BTN}>Cancelar</button>
                <button onClick={() => setToast("Preferências salvas!")} type="button" style={SAVE_BTN}>Salvar alterações</button>
              </div>
            </div>
          )}

          {/* TAB: ASSINATURA (Admin only) */}
          {tab === "assin" && role === "ADMIN" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Plan card */}
              <div style={{ position: "relative", background: "linear-gradient(135deg,#CC1F1F,#a3160f)", borderRadius: 16, padding: 26, overflow: "hidden", boxShadow: "0 16px 40px rgba(204,31,31,0.22)" }}>
                <div style={{ position: "absolute", top: -50, right: -40, width: 220, height: 220, background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)", borderRadius: "50%" }} />
                <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.82)" }}>Plano atual</span>
                    <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", marginTop: 6 }}>Profissional</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,0.86)", marginTop: 5 }}>R$ 799/mês · renova em 14 de julho de 2026</div>
                  </div>
                  <button
                    type="button"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 800, color: PRIMARY, background: "#fff", border: "none", padding: "12px 20px", borderRadius: 11, cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.16)", whiteSpace: "nowrap" }}
                  >
                    Fazer upgrade →
                  </button>
                </div>
              </div>
              {/* Payment history */}
              <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "20px 26px", borderBottom: "1px solid #f4eded" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: "#16100f" }}>Histórico de pagamentos</h2>
                </div>
                <div style={{ padding: "6px 26px" }}>
                  {PAYMENTS.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < PAYMENTS.length - 1 ? "1px solid #f6f1f1" : "none" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "#e8f5ee", display: "flex", alignItems: "center", justifyContent: "center", color: "#1f8a5b" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{p.date}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>Plano Profissional · {p.method}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#16100f", whiteSpace: "nowrap" }}>{p.amount}</div>
                      <a href="#" style={{ fontSize: 12.5, fontWeight: 700, color: PRIMARY, textDecoration: "none", flexShrink: 0 }}>Recibo</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
