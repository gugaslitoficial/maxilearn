"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// TODO: integrar com POST /professor/courses/:id/lessons/:lessonId/upload

const PRIMARY = "#CC1F1F";

type UploadState = "idle" | "uploading" | "done";
type TabType = "upload" | "url";

interface Material { id: string; name: string; size: string; ext: string; color: string }

const RT_TOOLS = [
  { label: "B", title: "Negrito", style: { fontWeight: 800 } },
  { label: "I", title: "Itálico", style: { fontStyle: "italic" } },
  { label: "U", title: "Sublinhado", style: { textDecoration: "underline" } },
  { label: "🔗", title: "Link" },
  { label: "≡", title: "Lista" },
  { label: "¶", title: "Parágrafo" },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      type="button"
      style={{ position: "relative", width: 44, height: 26, borderRadius: 100, border: "none", cursor: "pointer", flexShrink: 0, transition: "background .2s", background: on ? PRIMARY : "#d8cccc" }}
    >
      <div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.2)", transition: "left .2s" }} />
    </button>
  );
}

const inputS = {
  width: "100%",
  fontFamily: "inherit",
  fontSize: 14.5,
  fontWeight: 500,
  color: "#16100f",
  background: "#faf7f7",
  border: "1px solid #eadfdf",
  borderRadius: 11,
  padding: "12px 14px",
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelS = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#3a3030",
  marginBottom: 7,
} as const;

export default function UploadAulaPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const matRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<TabType>("upload");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadPct, setUploadPct] = useState(0);
  const [fileName, setFileName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [lessonTitle, setLessonTitle] = useState("Boas-vindas e objetivos do curso");
  const [lessonDesc, setLessonDesc] = useState("");
  const [freePreview, setFreePreview] = useState(false);
  const [duration, setDuration] = useState("14:32");
  const [materials, setMaterials] = useState<Material[]>([
    { id: "1", name: "Apostila — Segurança no Trabalho.pdf", size: "4.2 MB", ext: "PDF", color: PRIMARY },
    { id: "2", name: "Slides — Aula 01.pptx", size: "8.7 MB", ext: "PPT", color: "#d9821f" },
  ]);

  function simulateUpload(name: string) {
    setFileName(name);
    setUploadState("uploading");
    setUploadPct(0);
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 14 + 6;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setTimeout(() => setUploadState("done"), 300);
      }
      setUploadPct(Math.min(pct, 100));
    }, 180);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    simulateUpload(file.name);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    simulateUpload(file.name);
  }

  function addMaterial(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const size = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const ext = (file.name.split(".").pop() ?? "").toUpperCase().slice(0, 4);
    setMaterials((prev) => [...prev, { id: String(Date.now()), name: file.name, size, ext, color: "#8a807e" }]);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f4f3", display: "flex", flexDirection: "column", fontFamily: "'Manrope', system-ui, sans-serif" }}>

      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "14px clamp(16px,3vw,32px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <button
            onClick={() => router.back()}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#6a605e", background: "#f6f1f1", border: "1px solid #ece4e4", padding: "9px 14px", borderRadius: 10, cursor: "pointer", flexShrink: 0 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6a605e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Voltar
          </button>
          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, minWidth: 0, flexWrap: "wrap" }}>
            <Link href="/professor/cursos" style={{ color: "#8a807e", textDecoration: "none", whiteSpace: "nowrap" }}>Meus cursos</Link>
            <span style={{ color: "#cabbbb" }}>/</span>
            <Link href="/professor/cursos" style={{ color: "#8a807e", textDecoration: "none", whiteSpace: "nowrap" }}>Segurança no Trabalho</Link>
            <span style={{ color: "#cabbbb" }}>/</span>
            <span style={{ color: "#16100f", fontWeight: 800, whiteSpace: "nowrap" }}>Aula 1</span>
          </nav>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#b9842f", background: "#fdf3e2", border: "1px solid #f3e1bf", padding: "5px 11px", borderRadius: 100, flexShrink: 0 }}>
          Rascunho
        </span>
      </header>

      {/* Body */}
      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start", maxWidth: 1280, width: "100%", margin: "0 auto" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

          {/* Video source card */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
            {/* Tabs */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f6f1f1", border: "1px solid #ece4e4", borderRadius: 10, padding: 4, width: "max-content", marginBottom: 20 }}>
              {([["upload", "Upload de vídeo"], ["url", "URL (YouTube/Vimeo)"]] as const).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, padding: "8px 15px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === t ? "#fff" : "transparent", color: tab === t ? "#16100f" : "#8a807e", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all .15s" }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Upload tab */}
            {tab === "upload" && (
              <>
                {uploadState === "idle" && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    style={{ border: "1.5px dashed #e2d2d2", borderRadius: 14, padding: "44px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: "#faf7f7" }}
                  >
                    <div style={{ width: 62, height: 62, borderRadius: 16, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(204,31,31,0.24)", marginBottom: 18 }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#16100f" }}>Arraste seu vídeo aqui</div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "#8a807e", marginTop: 5, maxWidth: 320 }}>MP4, MOV ou WebM · até 2 GB · resolução recomendada 1080p</div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      style={{ marginTop: 20, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: "13px 24px", cursor: "pointer", boxShadow: "0 8px 20px rgba(204,31,31,0.24)" }}
                    >
                      Selecionar arquivo
                    </button>
                    <input ref={fileRef} type="file" accept="video/*" hidden onChange={handleFileChange} />
                  </div>
                )}

                {uploadState === "uploading" && (
                  <div style={{ border: "1px solid #ece4e4", borderRadius: 14, padding: 22, background: "#fcfafa" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 11, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: PRIMARY }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fileName}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e" }}>Enviando… {Math.round(uploadPct)}%</div>
                      </div>
                      <button
                        onClick={() => { setUploadState("idle"); setUploadPct(0); setFileName(""); }}
                        style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", color: "#a89e9c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <div style={{ height: 8, background: "#f1e4e4", borderRadius: 5, overflow: "hidden", marginTop: 16 }}>
                      <div style={{ height: "100%", width: `${uploadPct}%`, background: PRIMARY, borderRadius: 5, transition: "width .3s ease" }} />
                    </div>
                  </div>
                )}

                {uploadState === "done" && (
                  <div>
                    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "16/9", background: "linear-gradient(135deg,#2a1414,#16100f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ position: "absolute", inset: 0, background: "url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=70') center/cover", opacity: 0.42 }} />
                      <div style={{ position: "relative", width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", cursor: "pointer" }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill={PRIMARY}><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      <span style={{ position: "absolute", bottom: 12, right: 12, fontSize: 12, fontWeight: 700, color: "#fff", background: "rgba(0,0,0,0.6)", padding: "4px 9px", borderRadius: 6 }}>14:32</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14, background: "#f0faf4", border: "1px solid #cbe8d8", borderRadius: 11, padding: "12px 15px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <span style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: "#1f8a5b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        </span>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#16100f", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName || "aula-01-seguranca.mp4"} · enviado</span>
                      </div>
                      <button
                        onClick={() => { setUploadState("idle"); setFileName(""); setUploadPct(0); }}
                        style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #d6e8dd", borderRadius: 9, padding: "8px 14px", cursor: "pointer", flexShrink: 0 }}
                      >
                        Substituir
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* URL tab */}
            {tab === "url" && (
              <div>
                <label style={labelS}>Link do vídeo</label>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={{ ...inputS, flex: 1 }} />
                  <button style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: "0 22px", cursor: "pointer", flexShrink: 0 }}>
                    Incorporar
                  </button>
                </div>
                <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "16/9", background: "#f6f1f1", border: "1px solid #ece4e4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center", color: "#a89e9c" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cabbbb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m10 8 5 3-5 3z"/></svg>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>O preview do embed aparece aqui</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lesson details */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelS}>Título da aula</label>
              <input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} style={inputS} />
            </div>
            <div>
              <label style={labelS}>Descrição da aula</label>
              {/* Rich text toolbar */}
              <div style={{ border: "1px solid #eadfdf", borderRadius: 11, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "7px 8px", background: "#faf7f7", borderBottom: "1px solid #eadfdf", flexWrap: "wrap" }}>
                  {RT_TOOLS.map((t) => (
                    <button
                      key={t.title}
                      type="button"
                      title={t.title}
                      style={{ ...t.style, width: 30, height: 30, border: "none", borderRadius: 7, background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", color: "#6a605e" }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                  rows={4}
                  placeholder="Escreva uma descrição para a aula..."
                  style={{ width: "100%", fontFamily: "inherit", fontSize: 14.5, fontWeight: 500, lineHeight: 1.55, color: "#16100f", background: "#fff", border: "none", padding: "14px 15px", outline: "none", resize: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>

          {/* Materials */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>Materiais complementares</h3>
                <p style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>PDF, PPT, DOC · até 50 MB cada</p>
              </div>
              <button
                onClick={() => matRef.current?.click()}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: PRIMARY, background: "#fceeee", border: "1px solid #f6d6d6", borderRadius: 10, padding: "9px 14px", cursor: "pointer", flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Enviar arquivo
              </button>
              <input ref={matRef} type="file" hidden onChange={addMaterial} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {materials.map((m) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid #f0e8e8", borderRadius: 11 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: m.color, letterSpacing: "0.02em", border: `1px solid ${m.color}22` }}>
                    {m.ext}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#16100f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#a89e9c" }}>{m.size}</div>
                  </div>
                  <button
                    onClick={() => setMaterials((prev) => prev.filter((x) => x.id !== m.id))}
                    style={{ width: 30, height: 30, border: "none", background: "transparent", cursor: "pointer", color: "#c98a8a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT — sticky sidebar */}
        <div style={{ position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Lesson settings */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>Configurações da aula</h3>

            {/* Duration */}
            <div>
              <label style={labelS}>Duração estimada</label>
              <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#faf7f7", border: "1px solid #eadfdf", borderRadius: 11, padding: "11px 13px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a89e9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f" }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1f8a5b", background: "#e8f5ee", padding: "3px 8px", borderRadius: 100, flexShrink: 0 }}>Auto</span>
              </div>
            </div>

            {/* Free preview toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>Aula gratuita (preview)</div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>{freePreview ? "Visível para todos" : "Apenas matriculados"}</div>
              </div>
              <Toggle on={freePreview} onToggle={() => setFreePreview((v) => !v)} />
            </div>

            {/* Order select */}
            <div>
              <label style={labelS}>Ordem da aula no módulo</label>
              <select style={{ ...inputS, appearance: "none", cursor: "pointer" }}>
                <option>1 — Boas-vindas e objetivos</option>
                <option>2 — O que são as NRs</option>
                <option>3 — Quiz: conceitos iniciais</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => router.push("/professor/cursos")}
              style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: 14, cursor: "pointer", boxShadow: "0 8px 20px rgba(204,31,31,0.26)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              Publicar aula
            </button>
            <button
              style={{ width: "100%", fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: 13, cursor: "pointer" }}
            >
              Salvar rascunho
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
