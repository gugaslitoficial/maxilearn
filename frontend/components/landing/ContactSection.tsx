"use client";

import { useState } from "react";

interface FormState {
  nome: string;
  empresa: string;
  email: string;
  mensagem: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  mensagem?: string;
}

export function ContactSection() {
  const [form, setForm] = useState<FormState>({
    nome: "",
    empresa: "",
    email: "",
    mensagem: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.nome.trim()) e.nome = "Nome é obrigatório";
    if (!form.email.trim()) {
      e.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "E-mail inválido";
    }
    if (!form.mensagem.trim()) e.mensagem = "Mensagem é obrigatória";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSent(true);
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    fontFamily: "inherit",
    fontSize: 14.5,
    fontWeight: 500,
    color: "#16100f",
    background: "#faf7f7",
    border: "1px solid #eadfdf",
    borderRadius: 10,
    padding: "13px 16px",
    outline: "none",
  };

  return (
    <section
      id="contato"
      className="py-14 px-5 md:px-10 lg:px-16 relative overflow-hidden scroll-mt-16"
      style={{ background: "#CC1F1F" }}
    >
      {/* Decorative glows */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -120,
          left: -80,
          width: 360,
          height: 360,
          background:
            "radial-gradient(circle, rgba(0,0,0,0.10), transparent 70%)",
          borderRadius: "50%",
        }}
      />

      <div className="relative max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Left */}
        <div>
          <h2
            className="text-[32px] sm:text-[38px] md:text-[42px] leading-[1.1] font-extrabold tracking-[-0.03em] text-white text-balance"
          >
            Pronto para capacitar sua equipe?
          </h2>
          <p
            className="text-[16px] md:text-[18px] leading-[1.55] font-medium mt-5 max-w-[440px] text-pretty"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Fale com nosso time e receba uma demonstração gratuita.
          </p>

          <div className="flex flex-wrap gap-3.5 mt-8">
            <a
              href="#"
              className="inline-flex items-center gap-2.5 no-underline hover:opacity-90 transition-opacity"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#CC1F1F",
                background: "#fff",
                padding: "15px 26px",
                borderRadius: 12,
                boxShadow: "0 12px 26px rgba(0,0,0,0.16)",
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#CC1F1F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Agendar demonstração
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2.5 no-underline hover:opacity-90 transition-opacity"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.35)",
                padding: "15px 26px",
                borderRadius: 12,
              }}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="#fff"
              >
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.42 1.31-1.95 1.36-.5.05-1.13.07-1.83-.11-.42-.13-.96-.31-1.66-.61-2.92-1.26-4.83-4.2-4.97-4.4-.14-.2-1.19-1.58-1.19-3.02 0-1.43.75-2.14 1.02-2.43.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.14.12.31.02.51-.1.2-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.13.57.16.27.72 1.18 1.54 1.92 1.06.95 1.96 1.24 2.24 1.38.27.14.43.12.59-.07.16-.2.68-.79.86-1.07.18-.27.36-.22.61-.13.24.09 1.55.73 1.81.86.27.13.45.2.51.31.07.11.07.63-.17 1.31Z" />
              </svg>
              WhatsApp
            </a>
          </div>

          <div className="flex flex-wrap gap-6 mt-8">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
              <span
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                contato@maxilearn.com.br
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92Z" />
              </svg>
              <span
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                0800 123 4567
              </span>
            </div>
          </div>
        </div>

        {/* Right — Form card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "36px 32px",
            boxShadow: "0 28px 60px rgba(0,0,0,0.22)",
          }}
        >
          {sent ? (
            <div className="text-center py-10">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#fcf5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#CC1F1F"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p
                style={{ fontSize: 18, fontWeight: 800, color: "#16100f", marginBottom: 8 }}
              >
                Mensagem enviada!
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#6a605e" }}>
                Responderemos em até 1 dia útil.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* Form header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 24,
                  paddingBottom: 20,
                  borderBottom: "1px solid #f4eded",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: "#fcf5f5",
                    border: "1px solid #f4e9e9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#CC1F1F"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{ fontSize: 16, fontWeight: 800, color: "#16100f", marginBottom: 2 }}
                  >
                    Envie sua mensagem
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>
                    Respondemos em até 1 dia útil
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#3a3030",
                      marginBottom: 7,
                    }}
                  >
                    Nome
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={form.nome}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nome: e.target.value }))
                    }
                    style={{
                      ...inputBase,
                      borderColor: errors.nome ? "#CC1F1F" : "#eadfdf",
                    }}
                    className="focus:border-[#CC1F1F] focus:bg-white transition-colors"
                  />
                  {errors.nome && (
                    <p style={{ fontSize: 12, color: "#CC1F1F", marginTop: 4, fontWeight: 600 }}>
                      {errors.nome}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#3a3030",
                      marginBottom: 7,
                    }}
                  >
                    Empresa
                  </label>
                  <input
                    type="text"
                    placeholder="Sua empresa"
                    value={form.empresa}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, empresa: e.target.value }))
                    }
                    style={inputBase}
                    className="focus:border-[#CC1F1F] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#3a3030",
                    marginBottom: 7,
                  }}
                >
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="voce@empresa.com.br"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  style={{
                    ...inputBase,
                    borderColor: errors.email ? "#CC1F1F" : "#eadfdf",
                  }}
                  className="focus:border-[#CC1F1F] focus:bg-white transition-colors"
                />
                {errors.email && (
                  <p style={{ fontSize: 12, color: "#CC1F1F", marginTop: 4, fontWeight: 600 }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#3a3030",
                    marginBottom: 7,
                  }}
                >
                  Mensagem
                </label>
                <textarea
                  placeholder="Conte um pouco sobre sua necessidade..."
                  rows={4}
                  value={form.mensagem}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, mensagem: e.target.value }))
                  }
                  style={{
                    ...inputBase,
                    resize: "none",
                    borderColor: errors.mensagem ? "#CC1F1F" : "#eadfdf",
                  }}
                  className="focus:border-[#CC1F1F] focus:bg-white transition-colors"
                />
                {errors.mensagem && (
                  <p style={{ fontSize: 12, color: "#CC1F1F", marginTop: 4, fontWeight: 600 }}>
                    {errors.mensagem}
                  </p>
                )}
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  marginTop: 22,
                  fontFamily: "inherit",
                  fontSize: 15.5,
                  fontWeight: 800,
                  color: "#fff",
                  background: "#CC1F1F",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 24px",
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(204,31,31,0.28)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                className="hover:bg-[#b31a1a] transition-colors"
              >
                Enviar mensagem
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-11 20-4-9-9-4 24-7Z" />
                  <path d="m22 2-7 11" />
                </svg>
              </button>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#a89e9c",
                  textAlign: "center",
                  marginTop: 14,
                }}
              >
                Seus dados estão seguros e não serão compartilhados.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
