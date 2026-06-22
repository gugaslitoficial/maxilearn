"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import type { CSSProperties, Dispatch, SetStateAction } from "react";

const PRIMARY = "#CC1F1F";

type Step = 0 | 1 | 2;
type Plan = "starter" | "pro" | "ent";

interface Step1Data {
  companyName: string;
  cnpj: string;
  phone: string;
  segment: string;
}

interface Step2Data {
  adminName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const inputBase: CSSProperties = {
  width: "100%",
  fontFamily: "inherit",
  fontSize: 14.5,
  fontWeight: 500,
  color: "#16100f",
  background: "#faf7f7",
  border: "1px solid #eadfdf",
  borderRadius: 11,
  padding: "13px 15px",
  outline: "none",
  transition: "border-color .15s, background .15s",
  boxSizing: "border-box",
};

function maskCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (!d.length) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// ─── Stepper ─────────────────────────────────────────────────────────────────

function StepperBar({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
      {[0, 1, 2].map((i) => (
        <Fragment key={i}>
          {i > 0 && (
            <div
              style={{
                flex: 1,
                height: 2,
                margin: "0 6px",
                background: step >= i ? PRIMARY : "#ece4e4",
                transition: "background .35s",
              }}
            />
          )}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all .25s",
              ...(step > i
                ? { background: PRIMARY, boxShadow: "none" }
                : step === i
                ? { background: PRIMARY, boxShadow: "0 6px 16px rgba(204,31,31,0.3)" }
                : { background: "#f3eaea", border: "1px solid #ecdede" }),
            }}
          >
            {step > i ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: step === i ? "#fff" : "#b3a6a6",
                }}
              >
                {i + 1}
              </span>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

// ─── Step 1: Empresa ─────────────────────────────────────────────────────────

function Step1Form({
  data,
  setData,
  errors,
}: {
  data: Step1Data;
  setData: Dispatch<SetStateAction<Step1Data>>;
  errors: Record<string, string>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#3a3030", marginBottom: 7 }}>
          Nome da empresa
        </label>
        <input
          type="text"
          placeholder="Maxi 1 Lubrificantes"
          value={data.companyName}
          onChange={(e) => setData((d) => ({ ...d, companyName: e.target.value }))}
          style={{ ...inputBase, borderColor: errors.companyName ? PRIMARY : "#eadfdf" }}
          className="focus:border-[#CC1F1F] focus:bg-white"
        />
        {errors.companyName && (
          <p style={{ fontSize: 12, color: PRIMARY, marginTop: 4, fontWeight: 600 }}>{errors.companyName}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#3a3030", marginBottom: 7 }}>
            CNPJ
          </label>
          <input
            type="text"
            placeholder="00.000.000/0001-00"
            value={data.cnpj}
            onChange={(e) => setData((d) => ({ ...d, cnpj: maskCNPJ(e.target.value) }))}
            style={inputBase}
            className="focus:border-[#CC1F1F] focus:bg-white"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#3a3030", marginBottom: 7 }}>
            Telefone
          </label>
          <input
            type="text"
            placeholder="(11) 99999-9999"
            value={data.phone}
            onChange={(e) => setData((d) => ({ ...d, phone: maskPhone(e.target.value) }))}
            style={inputBase}
            className="focus:border-[#CC1F1F] focus:bg-white"
          />
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#3a3030", marginBottom: 7 }}>
          Segmento
        </label>
        <div style={{ position: "relative" }}>
          <select
            value={data.segment}
            onChange={(e) => setData((d) => ({ ...d, segment: e.target.value }))}
            style={{
              ...inputBase,
              paddingRight: 40,
              borderColor: errors.segment ? PRIMARY : "#eadfdf",
              background: data.segment ? "#faf7f7" : "#faf7f7",
              color: data.segment ? "#16100f" : "#9a9090",
              cursor: "pointer",
            }}
            className="focus:border-[#CC1F1F] focus:bg-white"
          >
            <option value="" disabled>Selecione o segmento</option>
            <option value="industria">Indústria e Manufatura</option>
            <option value="varejo">Varejo e Distribuição</option>
            <option value="logistica">Logística e Transporte</option>
            <option value="construcao">Construção Civil</option>
            <option value="tecnologia">Tecnologia</option>
            <option value="saude">Saúde e Farmácia</option>
            <option value="financeiro">Financeiro</option>
            <option value="educacao">Educação</option>
            <option value="outro">Outro</option>
          </select>
          <svg
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#8a807e" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        {errors.segment && (
          <p style={{ fontSize: 12, color: PRIMARY, marginTop: 4, fontWeight: 600 }}>{errors.segment}</p>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Administrador ────────────────────────────────────────────────────

function Step2Form({
  data,
  setData,
  errors,
}: {
  data: Step2Data;
  setData: Dispatch<SetStateAction<Step2Data>>;
  errors: Record<string, string>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#3a3030", marginBottom: 7 }}>
          Nome completo
        </label>
        <input
          type="text"
          placeholder="João da Silva"
          value={data.adminName}
          onChange={(e) => setData((d) => ({ ...d, adminName: e.target.value }))}
          style={{ ...inputBase, borderColor: errors.adminName ? PRIMARY : "#eadfdf" }}
          className="focus:border-[#CC1F1F] focus:bg-white"
        />
        {errors.adminName && (
          <p style={{ fontSize: 12, color: PRIMARY, marginTop: 4, fontWeight: 600 }}>{errors.adminName}</p>
        )}
      </div>

      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#3a3030", marginBottom: 7 }}>
          E-mail corporativo
        </label>
        <input
          type="email"
          placeholder="joao@empresa.com.br"
          value={data.email}
          onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
          style={{ ...inputBase, borderColor: errors.email ? PRIMARY : "#eadfdf" }}
          className="focus:border-[#CC1F1F] focus:bg-white"
        />
        {errors.email && (
          <p style={{ fontSize: 12, color: PRIMARY, marginTop: 4, fontWeight: 600 }}>{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#3a3030", marginBottom: 7 }}>
            Senha
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={data.password}
            onChange={(e) => setData((d) => ({ ...d, password: e.target.value }))}
            style={{ ...inputBase, borderColor: errors.password ? PRIMARY : "#eadfdf" }}
            className="focus:border-[#CC1F1F] focus:bg-white"
          />
          {errors.password && (
            <p style={{ fontSize: 12, color: PRIMARY, marginTop: 4, fontWeight: 600 }}>{errors.password}</p>
          )}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#3a3030", marginBottom: 7 }}>
            Confirmar senha
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={data.confirmPassword}
            onChange={(e) => setData((d) => ({ ...d, confirmPassword: e.target.value }))}
            style={{ ...inputBase, borderColor: errors.confirmPassword ? PRIMARY : "#eadfdf" }}
            className="focus:border-[#CC1F1F] focus:bg-white"
          />
          {errors.confirmPassword && (
            <p style={{ fontSize: 12, color: PRIMARY, marginTop: 4, fontWeight: 600 }}>{errors.confirmPassword}</p>
          )}
        </div>
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 500, color: "#a89e9c", marginTop: -6 }}>
        Mínimo de 8 caracteres.
      </p>
    </div>
  );
}

// ─── Step 3: Plano ────────────────────────────────────────────────────────────

const toggleBase: CSSProperties = {
  padding: "8px 20px",
  border: "none",
  borderRadius: 100,
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  transition: "all .18s",
  background: "transparent",
  color: "#8a807e",
};
const toggleActive: CSSProperties = {
  ...toggleBase,
  background: PRIMARY,
  color: "#fff",
  boxShadow: "0 4px 12px rgba(204,31,31,0.26)",
};

function Step3Plan({
  plan,
  setPlan,
  annual,
  setAnnual,
}: {
  plan: Plan;
  setPlan: Dispatch<SetStateAction<Plan>>;
  annual: boolean;
  setAnnual: Dispatch<SetStateAction<boolean>>;
}) {
  const starterPrice = annual ? "R$239" : "R$299";
  const proPrice = annual ? "R$639" : "R$799";
  const billingLabel = annual ? "por mês, cobrado anualmente" : "cobrança mensal";

  const plans: { id: Plan; name: string; price: string; note: string; features: string[]; badge?: string }[] = [
    {
      id: "starter",
      name: "Starter",
      price: starterPrice,
      note: billingLabel,
      features: ["Até 20 usuários", "Até 5 cursos", "Relatórios de progresso"],
    },
    {
      id: "pro",
      name: "Profissional",
      price: proPrice,
      note: billingLabel,
      features: ["Até 100 usuários", "Cursos ilimitados", "Personalização básica de marca"],
      badge: "Mais popular",
    },
    {
      id: "ent",
      name: "Enterprise",
      price: "Sob consulta",
      note: "Plano sob medida",
      features: ["Usuários ilimitados", "White-label total", "Suporte dedicado e SLA"],
    },
  ];

  return (
    <div>
      {/* Billing toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "#fff",
            border: "1px solid #e8e0e0",
            borderRadius: 100,
            padding: 4,
            boxShadow: "0 2px 8px rgba(60,20,20,0.05)",
          }}
        >
          <button onClick={() => setAnnual(false)} style={annual ? toggleBase : toggleActive}>
            Mensal
          </button>
          <button onClick={() => setAnnual(true)} style={annual ? toggleActive : toggleBase}>
            Anual
          </button>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: PRIMARY,
            background: "#fceeee",
            border: "1px solid #f6d6d6",
            padding: "5px 11px",
            borderRadius: 100,
          }}
        >
          2 meses grátis
        </span>
      </div>

      {/* Plan cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {plans.map(({ id, name, price, note, features, badge }) => {
          const selected = plan === id;
          return (
            <div key={id} style={{ position: "relative", paddingTop: badge ? 12 : 0 }}>
              {badge && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: 18,
                    background: PRIMARY,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    padding: "4px 12px",
                    borderRadius: 100,
                    boxShadow: "0 4px 10px rgba(204,31,31,0.28)",
                  }}
                >
                  {badge}
                </span>
              )}
              <div
                role="radio"
                aria-checked={selected}
                onClick={() => setPlan(id)}
                style={{
                  borderRadius: 13,
                  padding: "16px 18px",
                  cursor: "pointer",
                  border: selected ? `2px solid ${PRIMARY}` : "2px solid #ece4e4",
                  boxShadow: selected ? "0 8px 22px rgba(204,31,31,0.14)" : "none",
                  transition: "border-color .15s, box-shadow .15s",
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 800, color: selected ? PRIMARY : "#16100f" }}>
                    {name}
                  </span>
                  {/* Radio indicator */}
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: selected ? `6px solid ${PRIMARY}` : "2px solid #d4caca",
                      background: "#fff",
                      transition: "border .15s",
                      flexShrink: 0,
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: id === "ent" ? 16 : 22, fontWeight: 800, color: "#16100f", letterSpacing: "-0.02em" }}>
                    {price}
                  </span>
                  {id !== "ent" && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#8a807e" }}>/mês</span>
                  )}
                </div>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#a89e9c", marginBottom: 10 }}>{note}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
                  {features.map((f) => (
                    <span key={f} style={{ fontSize: 12.5, fontWeight: 600, color: "#6a605e", display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CadastroFlow() {
  const [step, setStep] = useState<Step>(0);
  const [annual, setAnnual] = useState(false);
  const [plan, setPlan] = useState<Plan>("pro");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [s1, setS1] = useState<Step1Data>({ companyName: "", cnpj: "", phone: "", segment: "" });
  const [s2, setS2] = useState<Step2Data>({ adminName: "", email: "", password: "", confirmPassword: "" });

  const progressPct = ["33%", "66%", "100%"][step];
  const stepLabels = ["Empresa", "Administrador", "Plano"];
  const stepTitles = ["Dados da empresa", "Dados do administrador", "Escolha seu plano"];
  const stepSubtitles = [
    "Conte sobre a empresa que vai usar a plataforma.",
    "Crie o acesso do administrador principal da conta.",
    "Selecione o plano ideal — você pode mudar depois.",
  ];

  function validateStep(): boolean {
    const e: Record<string, string> = {};

    if (step === 0) {
      if (!s1.companyName.trim()) e.companyName = "Nome da empresa obrigatório";
      if (!s1.segment) e.segment = "Selecione o segmento";
    }

    if (step === 1) {
      if (!s2.adminName.trim()) e.adminName = "Nome obrigatório";
      if (!s2.email.trim()) e.email = "E-mail obrigatório";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s2.email)) e.email = "E-mail inválido";
      if (!s2.password) e.password = "Senha obrigatória";
      else if (s2.password.length < 8) e.password = "Mínimo 8 caracteres";
      if (!s2.confirmPassword) e.confirmPassword = "Confirme a senha";
      else if (s2.password !== s2.confirmPassword) e.confirmPassword = "Senhas não coincidem";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handlePrimary() {
    if (step < 2) {
      if (!validateStep()) return;
      setErrors({});
      setStep((s) => (s + 1) as Step);
    } else {
      // TODO: integrar com POST /auth/register e depois POST /auth/login na próxima etapa
      console.log("Cadastro:", { s1, s2, plan, annual });
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: "#fdf9f9", padding: "40px 20px" }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: "#e8f5ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            animation: "ml-pop .4s ease",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4 12 14.01l-3-3" />
          </svg>
        </div>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#16100f",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Conta criada com sucesso!
        </h2>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            fontWeight: 500,
            color: "#6a605e",
            textAlign: "center",
            maxWidth: 380,
            marginBottom: 32,
          }}
        >
          Sua empresa foi cadastrada. Assim que a integração estiver pronta, você receberá as instruções por e-mail.
        </p>
        <Link
          href="/login"
          style={{
            fontSize: 15.5,
            fontWeight: 800,
            color: "#fff",
            background: PRIMARY,
            padding: "14px 36px",
            borderRadius: 11,
            textDecoration: "none",
            boxShadow: "0 10px 24px rgba(204,31,31,0.26)",
          }}
          className="hover:opacity-90 transition-opacity"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fdf9f9" }}>
      {/* Progress bar */}
      <div style={{ height: 4, background: "#f0e6e6" }}>
        <div
          style={{
            height: "100%",
            background: PRIMARY,
            width: progressPct,
            transition: "width .35s ease",
            boxShadow: "0 0 12px rgba(204,31,31,0.35)",
          }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px clamp(20px,5vw,48px)",
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: PRIMARY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(204,31,31,0.28)",
            }}
          >
            <div style={{ width: 13, height: 13, border: "3px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
          </div>
          <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", color: "#1a1414" }}>
            Maxi<span style={{ color: PRIMARY }}>Learn</span>
          </span>
        </Link>

        <p style={{ fontSize: 14, fontWeight: 600, color: "#6a605e" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: PRIMARY, fontWeight: 700, textDecoration: "none" }}>
            Entrar
          </Link>
        </p>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px clamp(20px,5vw,48px) 48px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 480 }}>
          {/* Stepper */}
          <StepperBar step={step} />

          {/* Step labels */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
            {stepLabels.map((label, i) => (
              <span
                key={label}
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: step >= i ? "#16100f" : "#b3a6a6",
                  flex: 1,
                  textAlign: i === 0 ? "left" : i === 1 ? "center" : "right",
                  transition: "color .25s",
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #ece4e4",
              borderRadius: 18,
              padding: "clamp(24px,4vw,34px)",
              boxShadow: "0 10px 30px rgba(60,20,20,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: PRIMARY,
                marginBottom: 8,
              }}
            >
              Etapa {step + 1} de 3
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#16100f",
              }}
            >
              {stepTitles[step]}
            </h2>
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.5,
                fontWeight: 500,
                color: "#6a605e",
                marginTop: 6,
                marginBottom: 26,
              }}
            >
              {stepSubtitles[step]}
            </p>

            {step === 0 && <Step1Form data={s1} setData={setS1} errors={errors} />}
            {step === 1 && <Step2Form data={s2} setData={setS2} errors={errors} />}
            {step === 2 && (
              <Step3Plan plan={plan} setPlan={setPlan} annual={annual} setAnnual={setAnnual} />
            )}

            {/* Navigation */}
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => { setStep((s) => (s - 1) as Step); setErrors({}); }}
                  style={{
                    flexShrink: 0,
                    fontFamily: "inherit",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#16100f",
                    background: "#fff",
                    border: "1.5px solid #e2d9d9",
                    borderRadius: 11,
                    padding: "14px 22px",
                    cursor: "pointer",
                  }}
                  className="hover:bg-[#faf7f7] transition-colors"
                >
                  Voltar
                </button>
              )}
              <button
                type="button"
                onClick={handlePrimary}
                style={{
                  flex: 1,
                  fontFamily: "inherit",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#fff",
                  background: PRIMARY,
                  border: "none",
                  borderRadius: 11,
                  padding: 14,
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(204,31,31,0.26)",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                {step < 2 ? "Continuar" : plan === "ent" ? "Falar com time" : "Assinar agora"}
              </button>
            </div>
          </div>

          {/* Legal */}
          <p
            style={{
              fontSize: 12.5,
              lineHeight: 1.55,
              fontWeight: 500,
              color: "#a89e9c",
              textAlign: "center",
              marginTop: 22,
            }}
          >
            Ao criar sua conta, você concorda com os{" "}
            <a href="#" style={{ color: "#6a605e", fontWeight: 600 }}>
              Termos de Uso
            </a>{" "}
            e a{" "}
            <a href="#" style={{ color: "#6a605e", fontWeight: 600 }}>
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
