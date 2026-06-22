const footerColumns = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "#funcionalidades" },
      { label: "Planos e preços", href: "#planos" },
      { label: "White-label", href: "#" },
      { label: "Integrações", href: "#" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre nós", href: "#" },
      { label: "Clientes", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Carreiras", href: "#" },
    ],
  },
  {
    title: "Suporte",
    links: [
      { label: "Central de ajuda", href: "#" },
      { label: "Fale conosco", href: "#contato" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "#" },
      { label: "Privacidade", href: "#" },
      { label: "LGPD", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="px-5 md:px-10 lg:px-16 pt-12 md:pt-[52px] pb-7"
      style={{ background: "#1A1A1A" }}
    >
      <div className="max-w-[1140px] mx-auto">
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-8 md:gap-10">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <a
              href="#"
              className="inline-flex items-center gap-[11px] no-underline mb-4"
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "#CC1F1F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    border: "3px solid #fff",
                    borderRadius: "50%",
                    borderRightColor: "transparent",
                    transform: "rotate(-45deg)",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                }}
              >
                Maxi<span style={{ color: "#CC1F1F" }}>Learn</span>
              </span>
            </a>
            <p
              className="max-w-full sm:max-w-[300px]"
              style={{
                fontSize: 13.5,
                lineHeight: 1.6,
                fontWeight: 500,
                color: "#9a9090",
                marginBottom: 20,
              }}
            >
              Plataforma white-label de cursos corporativos. Uma solução Maxi 1
              Lubrificantes.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {/* LinkedIn */}
              <a
                href="#"
                className="hover:bg-[#CC1F1F] transition-colors"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "#272727",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="LinkedIn"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#cfc8c8">
                  <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM9 17H6.5v-7H9v7Zm-1.25-8.1a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8ZM18 17h-2.5v-3.7c0-.9-.3-1.5-1.1-1.5-.6 0-1 .4-1.1.8-.05.15-.06.36-.06.57V17H9.8s.03-6.3 0-7h2.5v1c.33-.5.92-1.2 2.25-1.2 1.64 0 2.95 1.07 2.95 3.38V17Z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                className="hover:bg-[#CC1F1F] transition-colors"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "#272727",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Instagram"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#cfc8c8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="#cfc8c8" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map(({ title, links }) => (
            <div key={title}>
              <h4
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#fff",
                  marginBottom: 16,
                }}
              >
                {title}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {links.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="hover:text-white transition-colors"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#9a9090",
                      textDecoration: "none",
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex items-center justify-between gap-4 flex-wrap mt-10 pt-5"
          style={{ borderTop: "1px solid #2e2e2e" }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: "#7a7070" }}>
            © 2026 MaxiLearn — Maxi 1 Lubrificantes. Todos os direitos
            reservados.
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "Política de privacidade", href: "#" },
              { label: "Termos", href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="hover:text-white transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#9a9090",
                  textDecoration: "none",
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
