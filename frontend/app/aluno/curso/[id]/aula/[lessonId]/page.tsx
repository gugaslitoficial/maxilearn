"use client";

// TODO: integrar com GET /courses/:id/lessons/:lessonId e POST /students/me/lessons/:lessonId/complete
import { useState } from "react";
import Link from "next/link";
import { STUDENT_MODULES } from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";

const MATERIALS = [
  { name: "Tabela de EPIs por atividade.pdf", size: "PDF · 1.2 MB", ext: "PDF", iconBg: PRIMARY },
  { name: "Checklist de inspeção.pdf", size: "PDF · 480 KB", ext: "PDF", iconBg: PRIMARY },
  { name: "Apresentação — EPIs.pptx", size: "PPTX · 3.4 MB", ext: "PPT", iconBg: "#b9842f" },
];

const COMMENTS = [
  { initials: "JS", name: "João Souza", time: "há 2 dias", text: "Excelente explicação sobre a validade do CA dos equipamentos. Tinha essa dúvida!", bg: "#7a4fb9" },
  { initials: "RP", name: "Ricardo Paz", time: "há 1 dia", text: "Ótimo ponto, João! Sempre confiram a data de validade na etiqueta do EPI antes de cada uso.", bg: "#3a6ea5" },
];

type Tab = "mat" | "notes" | "disc";

export default function PlayerAulaPage() {
  const [tab, setTab] = useState<Tab>("mat");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("Lembrar: EPI para trabalho em altura = cinto tipo paraquedista. Validar CA antes de usar.");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tabStyle = (t: Tab): React.CSSProperties => ({
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: tab === t ? 800 : 700,
    padding: "11px 18px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderBottom: tab === t ? `2.5px solid ${PRIMARY}` : "2.5px solid transparent",
    color: tab === t ? "#fff" : "#8a807e",
    transition: "all .15s",
  });

  return (
    <div style={{ fontFamily: "Manrope, system-ui, sans-serif", minHeight: "100vh", background: "#121010", color: "#e6dede", display: "flex", flexDirection: "column" }}>

      {/* Topbar */}
      <header style={{ background: "#1a1616", borderBottom: "1px solid #2a2424", padding: "12px clamp(16px,3vw,28px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          <Link
            href="/aluno/curso/1"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#cfc8c8", textDecoration: "none", background: "#272121", border: "1px solid #332c2c", padding: "8px 13px", borderRadius: 9, flexShrink: 0 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Sair
          </Link>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#8a807e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Segurança no Trabalho › Módulo 2 › Aula 8
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              EPIs por tipo de atividade
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Mobile drawer trigger */}
          <button
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
            style={{ display: "none", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#cfc8c8", background: "#272121", border: "1px solid #332c2c", padding: "8px 12px", borderRadius: 9, cursor: "pointer" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
            Conteúdo
          </button>
          <Link href="/aluno/dashboard" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 11, height: 11, border: "2.5px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>Maxi<span style={{ color: PRIMARY }}>Learn</span></span>
          </Link>
        </div>
      </header>
      <style>{`.lg\\:hidden { display: none !important; } @media (max-width: 1024px) { .lg\\:hidden { display: flex !important; } }`}</style>

      {/* Workspace */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>

        {/* MAIN */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* VIDEO */}
          <div style={{ background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(12px,2vw,28px)" }}>
            <div
              style={{
                width: "100%",
                maxWidth: 1100,
                aspectRatio: "16 / 9",
                background: "linear-gradient(135deg,#1a1414,#2a2020)",
                borderRadius: 12,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(204,31,31,0.16), transparent 65%)" }} />
              <button style={{ position: "relative", width: 78, height: 78, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.95)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#16100f" style={{ marginLeft: 4 }}><path d="M8 5v14l11-7z"/></svg>
              </button>
              {/* Controls bar */}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 18px 14px", background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
                <div style={{ height: 5, background: "rgba(255,255,255,0.25)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ height: "100%", width: "34%", background: PRIMARY, borderRadius: 3 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#e6dede" }}>6:24 / 18:40</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#e6dede", background: "rgba(255,255,255,0.14)", padding: "3px 8px", borderRadius: 6 }}>1x</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Below player */}
          <div style={{ background: "#1a1616", flex: 1, padding: "24px clamp(16px,3vw,32px) 40px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>

              {/* Title row + nav */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 22 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e" }}>Segurança no Trabalho › Módulo 2 — EPIs e Prevenção</div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", marginTop: 6 }}>Aula 8 — EPIs por tipo de atividade</h1>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#cfc8c8", background: "#272121", border: "1px solid #332c2c", borderRadius: 10, padding: "11px 16px", cursor: "pointer" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Anterior
                  </button>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#fff", background: "#272121", border: "1px solid #332c2c", borderRadius: 10, padding: "11px 16px", cursor: "pointer" }}>
                    Próxima
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                  <button
                    onClick={() => setCompleted(!completed)}
                    type="button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 9,
                      fontFamily: "inherit",
                      fontSize: 13.5,
                      fontWeight: 800,
                      color: "#fff",
                      background: completed ? "#1f8a5b" : PRIMARY,
                      border: "none",
                      borderRadius: 10,
                      padding: "11px 18px",
                      cursor: "pointer",
                      boxShadow: completed ? "none" : "0 6px 16px rgba(204,31,31,0.3)",
                      transition: "background .2s",
                    }}
                  >
                    <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </span>
                    {completed ? "Aula concluída ✓" : "Marcar como concluída"}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #2a2424", marginBottom: 22 }}>
                {(["mat", "notes", "disc"] as Tab[]).map((t) => (
                  <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
                    {t === "mat" ? "Materiais" : t === "notes" ? "Anotações" : "Discussão"}
                  </button>
                ))}
              </div>

              {/* Tab: Materials */}
              {tab === "mat" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 11, maxWidth: 680 }}>
                  {MATERIALS.map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "#221d1d", border: "1px solid #322b2b", borderRadius: 12, padding: "15px 17px" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: m.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800 }}>{m.ext}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{m.name}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#8a807e", marginTop: 2 }}>{m.size}</div>
                      </div>
                      <button style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#fff", background: "#322b2b", border: "1px solid #3d3535", borderRadius: 9, padding: "9px 14px", cursor: "pointer", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                        Baixar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Notes */}
              {tab === "notes" && (
                <div style={{ maxWidth: 680 }}>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escreva suas anotações sobre esta aula..."
                    style={{ width: "100%", minHeight: 180, fontFamily: "inherit", fontSize: 14.5, lineHeight: 1.6, fontWeight: 500, color: "#e6dede", background: "#221d1d", border: "1px solid #322b2b", borderRadius: 13, padding: 16, outline: "none", resize: "vertical" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#8a807e" }}>Salvo automaticamente · suas anotações são privadas</span>
                    <button style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 9, padding: "9px 18px", cursor: "pointer" }}>Salvar nota</button>
                  </div>
                </div>
              )}

              {/* Tab: Discussion */}
              {tab === "disc" && (
                <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#1f8a5b,#43b787)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>AL</div>
                    <div style={{ flex: 1 }}>
                      <textarea
                        placeholder="Tire uma dúvida ou compartilhe um comentário..."
                        style={{ width: "100%", minHeight: 70, fontFamily: "inherit", fontSize: 14, lineHeight: 1.5, fontWeight: 500, color: "#e6dede", background: "#221d1d", border: "1px solid #322b2b", borderRadius: 12, padding: 13, outline: "none", resize: "vertical" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 9 }}>
                        <button style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 9, padding: "9px 18px", cursor: "pointer" }}>Comentar</button>
                      </div>
                    </div>
                  </div>
                  {COMMENTS.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>{c.initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>{c.name}</span>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#8a807e" }}>{c.time}</span>
                        </div>
                        <p style={{ fontSize: 13.5, lineHeight: 1.55, fontWeight: 500, color: "#c9bfbd", marginTop: 4 }}>{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR — desktop */}
        {sidebarOpen && (
          <aside
            className="player-sidebar-desktop"
            style={{ width: 340, flexShrink: 0, background: "#1a1616", borderLeft: "1px solid #2a2424", display: "flex", flexDirection: "column", overflowY: "auto" }}
          >
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        )}

        {/* Collapsed handle — desktop */}
        {!sidebarOpen && (
          <button
            className="player-sidebar-desktop"
            onClick={() => setSidebarOpen(true)}
            type="button"
            style={{ width: 48, flexShrink: 0, background: "#1a1616", border: "none", borderLeft: "1px solid #2a2424", color: "#cfc8c8", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 20 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span style={{ writingMode: "vertical-rl", fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", color: "#8a807e", textTransform: "uppercase" }}>Conteúdo do curso</span>
          </button>
        )}

        {/* Mobile drawer overlay */}
        {drawerOpen && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50 }}
            onClick={() => setDrawerOpen(false)}
          >
            <aside
              style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 320, background: "#1a1616", borderLeft: "1px solid #2a2424", overflowY: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent onClose={() => setDrawerOpen(false)} />
            </aside>
          </div>
        )}
      </div>

      <style>{`
        .player-sidebar-desktop { display: flex !important; }
        @media (max-width: 1024px) {
          .player-sidebar-desktop { display: none !important; }
          .lg\\:hidden { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function SidebarContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid #2a2424", position: "sticky", top: 0, background: "#1a1616", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Conteúdo do curso</span>
          <button
            onClick={onClose}
            title="Recolher"
            style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#272121", color: "#cfc8c8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#8a807e" }}>7 de 12 aulas</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#1f8a5b" }}>78%</span>
        </div>
        <div style={{ height: 6, background: "#2a2424", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: "78%", background: "#1f8a5b", borderRadius: 4 }} />
        </div>
      </div>

      <div style={{ padding: "8px 0" }}>
        {STUDENT_MODULES.map((m) => (
          <div key={m.id}>
            <div style={{ padding: "14px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{m.title}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#8a807e" }}>{m.lessons.filter((l) => l.status === "done").length}/{m.lessons.length}</span>
            </div>
            {m.lessons.map((l) => (
              <div
                key={l.id}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 20px", background: l.status === "current" ? "#241a1a" : "transparent" }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: l.status === "done" ? "#1f8a5b" : l.status === "current" ? "#CC1F1F" : "#2a2424",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {l.status === "done" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                  {l.status === "current" && <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>}
                  {l.status === "locked" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#776e6c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: l.status === "current" ? 800 : 600, color: l.status === "locked" ? "#776e6c" : l.status === "current" ? "#fff" : "#c9bfbd", lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {l.title}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#776e6c", marginTop: 1 }}>{l.duration}</div>
                </div>
                {l.status === "current" && (
                  <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", color: "#CC1F1F", background: "rgba(204,31,31,0.16)", padding: "3px 8px", borderRadius: 100 }}>Agora</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
