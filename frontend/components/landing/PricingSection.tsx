"use client";

import { useState } from "react";

const CheckIcon = ({ color = "#CC1F1F" }: { color?: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, marginTop: 1 }}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const XIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#c9bcbc"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, marginTop: 1 }}
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

function StarterCard({ price, billingNote }: { price: string; billingNote: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e0e0",
        borderRadius: 20,
        padding: 32,
        boxShadow: "0 2px 10px rgba(60,20,20,0.04)",
        height: "100%",
      }}
    >
      <h3
        style={{
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#8a807e",
        }}
      >
        Starter
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.5,
          fontWeight: 500,
          color: "#6a605e",
          marginTop: 8,
          minHeight: 42,
        }}
      >
        Para times pequenos começando a estruturar treinamentos.
      </p>
      <div
        style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "20px 0 4px" }}
      >
        <span
          style={{
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#16100f",
            whiteSpace: "nowrap",
          }}
        >
          {price}
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#8a807e" }}>/mês</span>
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: "#a89e9c", marginBottom: 24 }}>
        {billingNote}
      </p>
      <a
        href="#contato"
        style={{
          display: "block",
          textAlign: "center",
          fontSize: 15,
          fontWeight: 700,
          color: "#16100f",
          textDecoration: "none",
          background: "#fff",
          border: "1.5px solid #e2d9d9",
          padding: 13,
          borderRadius: 11,
          marginBottom: 28,
        }}
        className="hover:bg-gray-50 transition-colors"
      >
        Começar agora
      </a>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {[
          { text: "Até 20 usuários", check: true },
          { text: "Até 5 cursos", check: true },
          { text: "Relatórios de progresso", check: true },
          { text: "Sem personalização de marca", check: false },
        ].map(({ text, check }) => (
          <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            {check ? <CheckIcon /> : <XIcon />}
            <span
              style={{ fontSize: 14.5, fontWeight: 500, color: check ? "#3a3030" : "#a89e9c" }}
              dangerouslySetInnerHTML={{
                __html: text
                  .replace("20 usuários", "<strong style='font-weight:800'>20 usuários</strong>")
                  .replace("5 cursos", "<strong style='font-weight:800'>5 cursos</strong>"),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProCard({
  price,
  billingNote,
  elevated = true,
}: {
  price: string;
  billingNote: string;
  elevated?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        border: "2px solid #CC1F1F",
        borderRadius: 20,
        padding: 32,
        boxShadow: "0 24px 50px rgba(204,31,31,0.16)",
        height: "100%",
        transform: elevated ? "translateY(-8px)" : "none",
      }}
    >
      {elevated ? (
        <div
          style={{
            position: "absolute",
            top: -13,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#CC1F1F",
            color: "#fff",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            padding: "6px 16px",
            borderRadius: 100,
            boxShadow: "0 6px 16px rgba(204,31,31,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          Mais popular
        </div>
      ) : (
        <div
          style={{
            display: "inline-block",
            background: "#CC1F1F",
            color: "#fff",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            padding: "6px 16px",
            borderRadius: 100,
            marginBottom: 14,
          }}
        >
          Mais popular
        </div>
      )}
      <h3
        style={{
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#CC1F1F",
        }}
      >
        Profissional
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.5,
          fontWeight: 500,
          color: "#6a605e",
          marginTop: 8,
          minHeight: 42,
        }}
      >
        Para empresas que querem escalar treinamentos com a própria marca.
      </p>
      <div
        style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "20px 0 4px" }}
      >
        <span
          style={{
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#16100f",
            whiteSpace: "nowrap",
          }}
        >
          {price}
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#8a807e" }}>/mês</span>
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: "#a89e9c", marginBottom: 24 }}>
        {billingNote}
      </p>
      <a
        href="#contato"
        style={{
          display: "block",
          textAlign: "center",
          fontSize: 15,
          fontWeight: 700,
          color: "#fff",
          textDecoration: "none",
          background: "#CC1F1F",
          padding: 13,
          borderRadius: 11,
          marginBottom: 28,
          boxShadow: "0 10px 24px rgba(204,31,31,0.28)",
        }}
        className="hover:opacity-90 transition-opacity"
      >
        Solicitar demonstração
      </a>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {[
          "Até <strong style='font-weight:800'>100 usuários</strong>",
          "<strong style='font-weight:800'>Cursos ilimitados</strong>",
          "Personalização básica de marca",
          "Quizzes, avaliações e certificados",
        ].map((text) => (
          <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <CheckIcon />
            <span
              style={{ fontSize: 14.5, fontWeight: 500, color: "#3a3030" }}
              dangerouslySetInnerHTML={{ __html: text }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function EnterpriseCard() {
  return (
    <div
      style={{
        background: "#16100f",
        border: "1px solid #16100f",
        borderRadius: 20,
        padding: 32,
        boxShadow: "0 2px 10px rgba(60,20,20,0.08)",
        height: "100%",
      }}
    >
      <h3
        style={{
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#e8a5a5",
        }}
      >
        Enterprise
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.5,
          fontWeight: 500,
          color: "#b8aeac",
          marginTop: 8,
          minHeight: 42,
        }}
      >
        Para grandes operações que exigem white-label total e suporte dedicado.
      </p>
      <div
        style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "20px 0 4px" }}
      >
        <span
          style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff" }}
        >
          Sob consulta
        </span>
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e", marginBottom: 24 }}>
        Plano sob medida para sua operação
      </p>
      <a
        href="#contato"
        style={{
          display: "block",
          textAlign: "center",
          fontSize: 15,
          fontWeight: 700,
          color: "#16100f",
          textDecoration: "none",
          background: "#fff",
          padding: 13,
          borderRadius: 11,
          marginBottom: 28,
        }}
        className="hover:bg-gray-100 transition-colors"
      >
        Falar com vendas
      </a>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {[
          "<strong style='font-weight:800;color:#fff'>Usuários ilimitados</strong>",
          "<strong style='font-weight:800;color:#fff'>White-label total</strong>",
          "Suporte dedicado e SLA",
          "Integrações e SSO",
        ].map((text) => (
          <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <CheckIcon color="#e8a5a5" />
            <span
              style={{ fontSize: 14.5, fontWeight: 500, color: "#e6dede" }}
              dangerouslySetInnerHTML={{ __html: text }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const starterPrice = annual ? "R$ 239" : "R$ 299";
  const proPrice = annual ? "R$ 639" : "R$ 799";
  const billingNote = annual
    ? "por mês, cobrado anualmente"
    : "cobrança mensal, cancele quando quiser";

  const toggleBase: React.CSSProperties = {
    padding: "9px 22px",
    border: "none",
    borderRadius: 100,
    fontFamily: "inherit",
    fontSize: 14.5,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all .18s",
    background: "transparent",
    color: "#8a807e",
  };
  const toggleActive: React.CSSProperties = {
    ...toggleBase,
    background: "#CC1F1F",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(204,31,31,0.26)",
  };

  return (
    <section
      id="planos"
      className="flex-1 py-10 md:py-14 px-5 md:px-10 lg:px-16 scroll-mt-16"
      style={{ background: "#F8F8F8" }}
    >
      <div className="max-w-[1180px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-7">
          <h2
            className="text-[28px] sm:text-[32px] md:text-[38px] leading-[1.12] font-extrabold tracking-[-0.03em] text-[#16100f] text-balance"
          >
            Escolha o plano ideal para sua{" "}
            <span style={{ color: "#CC1F1F" }}>empresa</span>
          </h2>
          <p className="text-[15px] md:text-[16px] leading-[1.55] font-medium text-[#5a5050] mt-4">
            Comece grátis e evolua conforme sua equipe cresce. Sem surpresas na
            fatura.
          </p>
        </div>

        {/* Toggle + badge: stacked on mobile, inline on sm+ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3.5 mb-8">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#fff",
              border: "1px solid #e8e0e0",
              borderRadius: 100,
              padding: 5,
              boxShadow: "0 2px 8px rgba(60,20,20,0.05)",
            }}
          >
            <button
              onClick={() => setAnnual(false)}
              style={annual ? toggleBase : toggleActive}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              style={annual ? toggleActive : toggleBase}
            >
              Anual
            </button>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#fceeee",
              border: "1px solid #f6d6d6",
              color: "#CC1F1F",
              fontSize: 12.5,
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: 100,
            }}
          >
            2 meses grátis
          </span>
        </div>

        {/* Mobile: horizontal snap carousel */}
        <div
          className="md:hidden -mx-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4"
          style={{ paddingLeft: 20, scrollPaddingLeft: 20 }}
        >
          <div className="flex gap-4" style={{ paddingRight: 20 }}>
            <div className="snap-start shrink-0 w-[82vw]">
              <StarterCard price={starterPrice} billingNote={billingNote} />
            </div>
            <div className="snap-start shrink-0 w-[82vw]">
              <ProCard price={proPrice} billingNote={billingNote} elevated={false} />
            </div>
            <div className="snap-start shrink-0 w-[82vw]">
              <EnterpriseCard />
            </div>
          </div>
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 items-start">
          <StarterCard price={starterPrice} billingNote={billingNote} />
          <ProCard price={proPrice} billingNote={billingNote} elevated={true} />
          <EnterpriseCard />
        </div>

        {/* Footer note */}
        <div className="text-center mt-6 flex items-center justify-center gap-2 flex-wrap">
          <span style={{ fontSize: 15.5, fontWeight: 600, color: "#5a5050" }}>
            Não tem certeza?
          </span>
          <a
            href="#contato"
            className="inline-flex items-center gap-1.5 no-underline"
            style={{ fontSize: 15.5, fontWeight: 800, color: "#CC1F1F" }}
          >
            Fale com nosso time{" "}
            <span style={{ fontSize: 17, lineHeight: 1 }}>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
