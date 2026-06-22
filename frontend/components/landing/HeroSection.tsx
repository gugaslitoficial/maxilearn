import React from "react";

const stats = [
  { value: "+120", label: "empresas ativas" },
  { value: "98%", label: "taxa de conclusão" },
  { value: "24/7", label: "acesso ao conteúdo" },
];

const trustBrands = [
  {
    name: "Nortech",
    icon: (
      <div
        style={{ width: 26, height: 26, borderRadius: "50%", background: "#1a1414" }}
      />
    ),
  },
  {
    name: "VértexCorp",
    icon: (
      <div
        style={{ width: 24, height: 24, background: "#1a1414", transform: "rotate(45deg)" }}
      />
    ),
  },
  {
    name: "Lumina",
    icon: (
      <div style={{ display: "flex", gap: 3 }}>
        <div style={{ width: 7, height: 24, background: "#1a1414", borderRadius: 3 }} />
        <div style={{ width: 7, height: 24, background: "#1a1414", borderRadius: 3, opacity: 0.5 }} />
      </div>
    ),
  },
  {
    name: "GrupoÔmega",
    icon: (
      <div style={{ width: 25, height: 25, border: "3px solid #1a1414", borderRadius: 7 }} />
    ),
  },
];

const progressRows = [
  { pct: 78, barWidth: 80, dur: "1.4s" },
  { pct: 54, barWidth: 110, dur: "1.7s" },
  { pct: 93, barWidth: 64, dur: "2s" },
];

function DashboardMockup() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f0e8e8",
        borderRadius: 20,
        boxShadow: "0 30px 70px rgba(60,20,20,0.13)",
        overflow: "hidden",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "15px 18px",
          borderBottom: "1px solid #f4eded",
          background: "#fffdfd",
        }}
      >
        {(["#f0c5c5", "#f3dcc0", "#cfe7d2"] as const).map((bg) => (
          <span
            key={bg}
            style={{ width: 11, height: 11, borderRadius: "50%", background: bg, display: "inline-block" }}
          />
        ))}
        <div
          style={{ marginLeft: 14, height: 22, flex: 1, maxWidth: 220, background: "#f6f1f1", borderRadius: 6 }}
        />
      </div>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 64,
            background: "#faf4f4",
            padding: "18px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
            borderRight: "1px solid #f4eded",
          }}
        >
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#CC1F1F" }} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ width: 24, height: 24, borderRadius: 7, background: "#ecdede" }} />
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 22 }}>
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}
          >
            <div>
              <div style={{ width: 130, height: 13, background: "#1a1414", borderRadius: 5, marginBottom: 8 }} />
              <div style={{ width: 90, height: 9, background: "#ddd0d0", borderRadius: 5 }} />
            </div>
            <div style={{ width: 74, height: 30, background: "#CC1F1F", borderRadius: 8 }} />
          </div>

          {/* Stat cards */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}
          >
            {(
              [
                ["847", "#CC1F1F", 0.9],
                ["32", "#1a1414", 1],
                ["91%", "#e8a5a5", 1],
              ] as [string, string, number][]
            ).map(([val, bg, op]) => (
              <div
                key={val}
                style={{ background: "#fcf5f5", border: "1px solid #f4e9e9", borderRadius: 11, padding: 13 }}
              >
                <div
                  style={{ width: 24, height: 24, borderRadius: 7, background: bg, marginBottom: 12, opacity: op }}
                />
                <div style={{ fontSize: 18, fontWeight: 800, color: "#16100f" }}>{val}</div>
                <div style={{ width: 48, height: 7, background: "#ddd0d0", borderRadius: 4, marginTop: 6 }} />
              </div>
            ))}
          </div>

          {/* Progress rows */}
          <div
            style={{ background: "#fff", border: "1px solid #f4eded", borderRadius: 12, padding: 16 }}
          >
            <div style={{ width: 100, height: 10, background: "#cabbbb", borderRadius: 5, marginBottom: 16 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {progressRows.map(({ pct, barWidth, dur }) => (
                <div key={pct} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{ width: 30, height: 30, borderRadius: 8, background: "#f1e4e4", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ width: barWidth, height: 8, background: "#d8cccc", borderRadius: 4, marginBottom: 8 }}
                    />
                    <div style={{ height: 7, background: "#f1e4e4", borderRadius: 4, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: "#CC1F1F",
                          borderRadius: 4,
                          animation: `ml-grow ${dur} ease`,
                        }}
                      />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#CC1F1F" }}>{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <div
      style={{
        background: "linear-gradient(180deg,#ffffff 0%,#fdf6f6 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ─── MOBILE HERO (< 640px) ─── */}
      <div className="sm:hidden relative overflow-hidden" style={{ minHeight: 480 }}>
        {/* Dashboard as faded background */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingTop: 16 }}
        >
          <div style={{ opacity: 0.07, width: "90%", flexShrink: 0 }}>
            <DashboardMockup />
          </div>
        </div>

        {/* Text content */}
        <div className="relative z-10 px-5 pt-10 pb-6">
          <h1
            className="text-[36px] leading-[1.06] font-extrabold tracking-[-0.03em] text-[#16100f] mb-5 text-balance"
          >
            Treine sua equipe com{" "}
            <span style={{ color: "#CC1F1F" }}>eficiência</span> e controle
          </h1>
          <p className="text-[16px] leading-[1.6] font-medium text-[#5a5050] mb-7 text-pretty">
            Plataforma de cursos corporativos com gestão completa de usuários,
            conteúdo e progresso.
          </p>

          {/* Mobile CTAs — stacked full-width */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            <a
              href="#contato"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                background: "#CC1F1F",
                padding: "15px 24px",
                borderRadius: 12,
                boxShadow: "0 10px 26px rgba(204,31,31,0.30)",
                textDecoration: "none",
              }}
            >
              Solicitar demonstração{" "}
              <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
            </a>
            <a
              href="#planos"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
                color: "#16100f",
                background: "#fff",
                border: "1.5px solid #e6dede",
                padding: "15px 24px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Ver planos
            </a>
          </div>

          {/* Mobile stats — 3 items side by side */}
          <div style={{ display: "flex", width: "100%" }}>
            {stats.map(({ value, label }) => (
              <div
                key={value}
                style={{ flex: 1, textAlign: "center", padding: "0 4px" }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#16100f",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#8a807e",
                    lineHeight: 1.3,
                    marginTop: 3,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SM+ HERO (640px+) ─── */}
      <div className="hidden sm:flex flex-col lg:grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center max-w-[1320px] w-full mx-auto px-10 lg:px-16 pt-10 md:pt-12">
        {/* Left text */}
        <div className="max-w-[560px] w-full">
          <h1
            className="text-[44px] lg:text-[56px] leading-[1.06] font-extrabold tracking-[-0.03em] text-[#16100f] mb-6 text-balance"
          >
            Treine sua equipe com{" "}
            <span style={{ color: "#CC1F1F" }}>eficiência</span> e controle
          </h1>
          <p className="text-[19px] leading-[1.6] font-medium text-[#5a5050] mb-9 max-w-[480px] text-pretty">
            Plataforma de cursos corporativos com gestão completa de usuários,
            conteúdo e progresso.
          </p>

          {/* Desktop CTAs */}
          <div className="flex items-center gap-3 flex-wrap mb-10 md:mb-12">
            <a
              href="#contato"
              className="inline-flex items-center gap-2 no-underline hover:opacity-90 transition-opacity"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                background: "#CC1F1F",
                padding: "16px 30px",
                borderRadius: 12,
                boxShadow: "0 10px 26px rgba(204,31,31,0.30)",
              }}
            >
              Solicitar demonstração{" "}
              <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
            </a>
            <a
              href="#planos"
              className="inline-flex items-center no-underline hover:bg-gray-50 transition-colors"
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#16100f",
                background: "#fff",
                border: "1.5px solid #e6dede",
                padding: "16px 30px",
                borderRadius: 12,
              }}
            >
              Ver planos
            </a>
          </div>

          {/* Desktop stats with separators */}
          <div className="flex gap-11">
            {stats.map(({ value, label }, i) => (
              <React.Fragment key={value}>
                {i > 0 && <div style={{ width: 1, background: "#ece4e4" }} />}
                <div>
                  <div
                    style={{ fontSize: 28, fontWeight: 800, color: "#16100f", letterSpacing: "-0.02em" }}
                  >
                    {value}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#8a807e" }}>{label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right: dashboard + decorations */}
        <div className="relative w-full pb-8">
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 280,
              height: 280,
              background: "radial-gradient(circle, rgba(204,31,31,0.10), transparent 70%)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <DashboardMockup />
          </div>

          {/* Floating badge */}
          <div
            className="animate-float"
            style={{
              position: "absolute",
              bottom: -8,
              left: -26,
              zIndex: 2,
              background: "#fff",
              border: "1px solid #f0e8e8",
              borderRadius: 14,
              padding: "13px 17px",
              boxShadow: "0 14px 34px rgba(60,20,20,0.14)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#fceeee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 11,
                  border: "2.5px solid #CC1F1F",
                  borderTop: "none",
                  borderRight: "none",
                  transform: "rotate(-45deg) translate(1px,-2px)",
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#16100f" }}>Certificado emitido</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8a807e" }}>há 2 minutos</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TRUST BAR ─── */}

      {/* Mobile: infinite auto-scroll marquee */}
      <div className="sm:hidden pt-10 pb-8">
        <p
          style={{
            textAlign: "center",
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a89e9c",
            marginBottom: 24,
            padding: "0 20px",
          }}
        >
          Empresas que confiam na MaxiLearn
        </p>
        <div className="overflow-hidden" style={{ opacity: 0.65 }}>
          <div className="animate-marquee">
            {[...trustBrands, ...trustBrands].map(({ name, icon }, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 52, flexShrink: 0 }}
              >
                {icon}
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#1a1414",
                    letterSpacing: "-0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: static centered row */}
      <div className="hidden sm:block max-w-[1320px] w-full mx-auto px-10 lg:px-16 pt-12 md:pt-16 pb-10">
        <p
          style={{
            textAlign: "center",
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a89e9c",
            marginBottom: 28,
          }}
        >
          Empresas que confiam na MaxiLearn
        </p>
        <div
          className="flex items-center justify-center flex-wrap gap-8 md:gap-16"
          style={{ opacity: 0.62 }}
        >
          {trustBrands.map(({ name, icon }) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {icon}
              <span
                style={{ fontSize: 19, fontWeight: 800, color: "#1a1414", letterSpacing: "-0.02em" }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
