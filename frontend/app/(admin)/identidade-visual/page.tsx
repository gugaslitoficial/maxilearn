"use client";

import { useState } from "react";
import type React from "react";
import { Upload, RotateCcw, Save } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

const DEFAULT_PRIMARY = "#CC1F1F";
const DEFAULT_SECONDARY = "#2A6FDB";
const DEFAULT_NAME = "MaxiLearn";

const PRESETS = [
  { color: "#CC1F1F", label: "Vermelho (padrão)" },
  { color: "#2A6FDB", label: "Azul" },
  { color: "#1F8A5B", label: "Verde" },
  { color: "#7A4FB9", label: "Roxo" },
  { color: "#D9821F", label: "Laranja" },
];

const SECONDARY_PRESETS = [
  { color: "#2A6FDB", label: "Azul (padrão)" },
  { color: "#1F8A5B", label: "Verde" },
  { color: "#7A4FB9", label: "Roxo" },
  { color: "#D9821F", label: "Laranja" },
  { color: "#6a605e", label: "Cinza" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#6a605e", marginBottom: 8 }}>
      {children}
    </label>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: "#b3a6a6", marginTop: 8, marginBottom: 4 }}>
      {label}
    </div>
  );
}

function ColorSwatch({ color, selected, onClick, label }: { color: string; selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        background: color,
        border: selected ? "3px solid #16100f" : "2.5px solid rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "transform .1s",
        transform: selected ? "scale(1.1)" : "scale(1)",
        flexShrink: 0,
      }}
    />
  );
}

/* ---------- Live Preview Components ---------- */
function LoginPreview({ primary, name }: { primary: string; name: string }) {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #ece4e4",
        background: "#f8f6f6",
        display: "flex",
        height: 160,
      }}
    >
      {/* Left panel */}
      <div
        style={{
          width: "40%",
          background: primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 10,
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ width: 18, height: 18, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.8)", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
        <div style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.2, textAlign: "center", marginTop: 3 }}>
          {name}
        </div>
      </div>
      {/* Right form */}
      <div style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 7, justifyContent: "center" }}>
        <div style={{ fontSize: 9.5, fontWeight: 800, color: "#16100f" }}>Bem-vindo</div>
        <div style={{ height: 10, background: "#f0ebe9", borderRadius: 3 }} />
        <div style={{ height: 10, background: "#f0ebe9", borderRadius: 3 }} />
        <div style={{ height: 10, background: primary, borderRadius: 3, width: "70%" }} />
        <div style={{ fontSize: 8, color: "#a89e9c", fontWeight: 500 }}>Esqueceu a senha?</div>
      </div>
    </div>
  );
}

function DashboardPreview({ primary, name }: { primary: string; name: string }) {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #ece4e4",
        display: "flex",
        height: 160,
        background: "#f6f4f3",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 44,
          background: "#fff",
          borderRight: "1px solid #ece4e4",
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <div style={{ fontSize: 7, fontWeight: 800, color: primary, letterSpacing: "-0.01em", lineHeight: 1.1, marginBottom: 4 }}>
          {name.slice(0, 5)}
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 10,
              borderRadius: 3,
              background: i === 0 ? primary : "#f0ebe9",
              opacity: i === 0 ? 1 : 0.6,
            }}
          />
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ fontSize: 8.5, fontWeight: 800, color: "#16100f" }}>Dashboard</div>
        <div className="grid grid-cols-2 gap-[5px]">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 34,
                background: "#fff",
                borderRadius: 5,
                border: "1px solid #ece4e4",
                padding: "5px 6px",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 3, background: i === 0 ? primary : "#f0ebe9", marginBottom: 3 }} />
              <div style={{ height: 5, background: "#f0ebe9", borderRadius: 2 }} />
            </div>
          ))}
        </div>
        <div style={{ height: 40, background: "#fff", borderRadius: 5, border: "1px solid #ece4e4", padding: "6px 7px" }}>
          <div style={{ height: 5, background: "#f0ebe9", borderRadius: 2, marginBottom: 5, width: "50%" }} />
          <svg viewBox="0 0 80 20" width="100%" height="16" preserveAspectRatio="none">
            <polyline points="0,16 10,12 20,14 30,8 40,10 50,5 60,8 70,3 80,6" fill="none" stroke={primary} strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
/* --------------------------------------------- */

export default function IdentidadeVisualPage() {
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY);
  const [platformName, setPlatformName] = useState(DEFAULT_NAME);
  const [toast, setToast] = useState<string | null>(null);

  function handleReset() {
    setPrimaryColor(DEFAULT_PRIMARY);
    setSecondaryColor(DEFAULT_SECONDARY);
    setPlatformName(DEFAULT_NAME);
    setToast("Padrão restaurado.");
  }

  function handleSave() {
    setToast("Identidade visual salva e aplicada!");
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
            Identidade Visual
          </h1>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>
            Personalize a aparência da sua plataforma.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleReset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 16px",
              borderRadius: 10,
              border: "1.5px solid #ece4e4",
              background: "#fff",
              fontSize: 13.5,
              fontWeight: 700,
              color: "#6a605e",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
            Restaurar padrão
          </button>
          <button
            onClick={handleSave}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: primaryColor,
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              boxShadow: `0 6px 16px ${primaryColor}44`,
              transition: "background .2s, box-shadow .2s",
            }}
          >
            <Save size={15} />
            Salvar e aplicar
          </button>
        </div>
      </header>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        style={{
          flex: 1,
          padding: "clamp(20px,3vw,32px)",
          alignItems: "start",
        }}
      >
        {/* LEFT — Form */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #ece4e4",
            borderRadius: 16,
            padding: 26,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Logo upload */}
          <div>
            <SectionDivider label="Logotipo" />
            <div
              style={{
                border: "2px dashed #d8c8c8",
                borderRadius: 12,
                padding: "28px 20px",
                textAlign: "center",
                cursor: "pointer",
                background: "#fdfbfb",
                marginTop: 10,
              }}
            >
              <Upload size={24} color="#a89e9c" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: "#6a605e" }}>Clique para enviar o logotipo</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#a89e9c", marginTop: 3 }}>
                SVG, PNG ou JPG — mínimo 200×200 px
              </div>
            </div>
          </div>

          {/* Platform name */}
          <div>
            <SectionDivider label="Nome da plataforma" />
            <div style={{ marginTop: 10 }}>
              <FieldLabel>Exibido no cabeçalho e e-mails</FieldLabel>
              <input
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                style={inputStyle}
                maxLength={30}
              />
            </div>
          </div>

          {/* Primary color */}
          <div>
            <SectionDivider label="Cor primária" />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: primaryColor,
                    border: "2px solid #ece4e4",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {PRESETS.map((p) => (
                  <ColorSwatch
                    key={p.color}
                    color={p.color}
                    label={p.label}
                    selected={primaryColor.toLowerCase() === p.color.toLowerCase()}
                    onClick={() => setPrimaryColor(p.color)}
                  />
                ))}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#6a605e",
                  background: "#f6f1f1",
                  border: "1px solid #ece4e4",
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontFamily: "monospace",
                }}
              >
                {primaryColor.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Secondary color */}
          <div>
            <SectionDivider label="Cor secundária" />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: secondaryColor,
                    border: "2px solid #ece4e4",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {SECONDARY_PRESETS.map((p) => (
                  <ColorSwatch
                    key={p.color}
                    color={p.color}
                    label={p.label}
                    selected={secondaryColor.toLowerCase() === p.color.toLowerCase()}
                    onClick={() => setSecondaryColor(p.color)}
                  />
                ))}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#6a605e",
                  background: "#f6f1f1",
                  border: "1px solid #ece4e4",
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontFamily: "monospace",
                }}
              >
                {secondaryColor.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Background image */}
          <div>
            <SectionDivider label="Imagem de fundo (login)" />
            <div
              style={{
                border: "2px dashed #d8c8c8",
                borderRadius: 12,
                padding: "20px 16px",
                textAlign: "center",
                cursor: "pointer",
                background: "#fdfbfb",
                marginTop: 10,
              }}
            >
              <Upload size={20} color="#a89e9c" style={{ margin: "0 auto 6px" }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#6a605e" }}>Enviar imagem de fundo</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#a89e9c", marginTop: 2 }}>JPG, PNG — até 5 MB</div>
            </div>
          </div>

          {/* Favicon */}
          <div>
            <SectionDivider label="Favicon" />
            <div
              style={{
                border: "2px dashed #d8c8c8",
                borderRadius: 12,
                padding: "16px",
                textAlign: "center",
                cursor: "pointer",
                background: "#fdfbfb",
                marginTop: 10,
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#6a605e" }}>Enviar favicon</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#a89e9c", marginTop: 2 }}>ICO ou PNG 32×32 px</div>
            </div>
          </div>
        </div>

        {/* RIGHT — Live Preview */}
        <div
          style={{
            position: "sticky",
            top: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #ece4e4",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: "#8a807e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
              Preview — Tela de Login
            </div>
            <LoginPreview primary={primaryColor} name={platformName || "Plataforma"} />
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#a89e9c", marginTop: 10, textAlign: "center" }}>
              Atualiza em tempo real conforme você edita
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ece4e4",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: "#8a807e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
              Preview — Dashboard
            </div>
            <DashboardPreview primary={primaryColor} name={platformName || "Plataforma"} />
          </div>

          {/* Color summary */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #ece4e4",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: "#8a807e", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
              Resumo de cores
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { label: "Primária", color: primaryColor },
                { label: "Secundária", color: secondaryColor },
              ].map(({ label, color }) => (
                <div key={label} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#fdfbfb", border: "1px solid #ece4e4", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: color, flexShrink: 0, border: "1px solid rgba(0,0,0,0.08)" }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#8a807e" }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#16100f", fontFamily: "monospace" }}>{color.toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
