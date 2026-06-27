"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCourseEditor, useCreateLesson, useUpdateLesson } from "@/hooks/use-course-editor";
import { Toast } from "@/components/ui/Toast";

const PRIMARY = "var(--color-primary)";

type TabType = "url" | "upload";

interface Material { id: string; name: string; size: string; ext: string; color: string }

const RT_TOOLS = [
  { label: "B", title: "Negrito", style: { fontWeight: 800 } },
  { label: "I", title: "Itálico", style: { fontStyle: "italic" } },
  { label: "U", title: "Sublinhado", style: { textDecoration: "underline" } },
  { label: "🔗", title: "Link" },
  { label: "≡", title: "Lista" },
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

function Sk({ h, w, r = 8 }: { h: number; w?: number | string; r?: number }) {
  return (
    <div className="animate-pulse" style={{ width: w ?? "100%", height: h, borderRadius: r, background: "#f1ece9" }} />
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

export default function AulaEditorPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const moduleId = searchParams.get("moduleId") ?? "";
  const isNew = lessonId === "new";

  const { data: editorData, isLoading } = useCourseEditor(courseId);
  const createMut = useCreateLesson(courseId, moduleId);
  const updateMut = useUpdateLesson(courseId, moduleId);

  const [tab, setTab] = useState<TabType>("url");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [freePreview, setFreePreview] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(isNew ? null : lessonId);

  const matRef = useRef<HTMLInputElement>(null);

  // Pre-fill from editor data when editing existing lesson
  useEffect(() => {
    if (isNew || !editorData) return;
    for (const mod of editorData.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        setLessonTitle(lesson.title ?? "");
        setLessonDesc(lesson.description ?? "");
        setVideoUrl(lesson.videoUrl ?? "");
        setFreePreview(lesson.isFree ?? false);
        setDurationMinutes(lesson.durationMinutes != null ? String(lesson.durationMinutes) : "");
        break;
      }
    }
  }, [editorData, lessonId, isNew]);

  const courseName = editorData?.course?.title ?? "Curso";
  const moduleData = editorData?.modules.find((m) => m.id === moduleId);
  const moduleName = moduleData?.title ?? "Módulo";

  function addMaterial(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const size = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const ext = (file.name.split(".").pop() ?? "").toUpperCase().slice(0, 4);
    setMaterials((prev) => [...prev, { id: String(Date.now()), name: file.name, size, ext, color: "#8a807e" }]);
  }

  async function handleSave(publish = false) {
    setIsSaving(true);
    try {
      const payload = {
        title: lessonTitle || "Aula sem título",
        description: lessonDesc || undefined,
        videoUrl: videoUrl || undefined,
        isFreePreview: freePreview,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        type: "video",
      };

      if (isNew && !savedId) {
        const res = await createMut.mutateAsync(payload);
        setSavedId((res as { id: string }).id);
      } else {
        const targetId = savedId ?? lessonId;
        await updateMut.mutateAsync({ id: targetId, ...payload });
      }

      setToast(publish ? "Aula publicada!" : "Rascunho salvo.");
      if (publish) router.back();
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = anyErr?.response?.data?.message;
      setToast(Array.isArray(msg) ? msg[0] : typeof msg === "string" ? msg : "Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f4f3", display: "flex", flexDirection: "column" }}>

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
          <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, minWidth: 0, flexWrap: "wrap" }}>
            <Link href="/professor/cursos" style={{ color: "#8a807e", textDecoration: "none", whiteSpace: "nowrap" }}>Cursos</Link>
            <span style={{ color: "#cabbbb" }}>/</span>
            <Link href={`/professor/cursos/${courseId}/editar`} style={{ color: "#8a807e", textDecoration: "none", whiteSpace: "nowrap" }}>{isLoading ? "…" : courseName}</Link>
            <span style={{ color: "#cabbbb" }}>/</span>
            <span style={{ color: "#16100f", fontWeight: 800, whiteSpace: "nowrap" }}>{isNew ? "Nova aula" : (lessonTitle || "Aula")}</span>
          </nav>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 10, padding: "9px 16px", cursor: "pointer" }}
          >
            {isSaving ? "Salvando…" : "Salvar rascunho"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", boxShadow: "0 6px 16px rgba(204,31,31,0.26)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            Publicar aula
          </button>
        </div>
      </header>

      {/* Body */}
      {isLoading && !isNew ? (
        <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, maxWidth: 1280, width: "100%", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Sk h={280} r={16} />
            <Sk h={160} r={16} />
            <Sk h={120} r={16} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Sk h={200} r={16} />
            <Sk h={100} r={16} />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start", maxWidth: 1280, width: "100%", margin: "0 auto" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

            {/* Video source */}
            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f6f1f1", border: "1px solid #ece4e4", borderRadius: 10, padding: 4, width: "max-content", marginBottom: 20 }}>
                {([["url", "URL (YouTube/Vimeo)"], ["upload", "Upload de vídeo"]] as const).map(([t, label]) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, padding: "8px 15px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === t ? "#fff" : "transparent", color: tab === t ? "#16100f" : "#8a807e", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "url" && (
                <div>
                  <label style={labelS}>Link do vídeo</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      style={{ ...inputS, flex: 1 }}
                    />
                  </div>
                  {!videoUrl && (
                    <div style={{ marginTop: 14, borderRadius: 14, overflow: "hidden", aspectRatio: "16/9", background: "#f6f1f1", border: "1px solid #ece4e4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ textAlign: "center", color: "#a89e9c" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cabbbb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m10 8 5 3-5 3z"/></svg>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>Preview do vídeo aparece aqui</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "upload" && (
                <div style={{ border: "1.5px dashed #e2d2d2", borderRadius: 14, padding: "44px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: "#faf7f7" }}>
                  <div style={{ width: 62, height: 62, borderRadius: 16, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(204,31,31,0.24)", marginBottom: 18 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#16100f" }}>Upload ainda não suportado</div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "#8a807e", marginTop: 5, maxWidth: 280 }}>Use a aba URL para vincular um vídeo do YouTube ou Vimeo.</div>
                </div>
              )}
            </div>

            {/* Lesson details */}
            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelS}>Título da aula</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Ex.: Introdução ao módulo"
                  style={inputS}
                />
              </div>
              <div>
                <label style={labelS}>Descrição da aula</label>
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
                    placeholder="Descreva o que o aluno vai aprender nesta aula..."
                    style={{ width: "100%", fontFamily: "inherit", fontSize: 14.5, fontWeight: 500, lineHeight: 1.55, color: "#16100f", background: "#fff", border: "none", padding: "14px 15px", outline: "none", resize: "none", boxSizing: "border-box" as const }}
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
              {materials.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 20px", border: "1.5px dashed #e2d2d2", borderRadius: 12, color: "#a89e9c", fontSize: 13.5, fontWeight: 600 }}>
                  Nenhum material adicionado ainda.
                </div>
              ) : (
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
                      <button onClick={() => setMaterials((prev) => prev.filter((x) => x.id !== m.id))} style={{ width: 30, height: 30, border: "none", background: "transparent", cursor: "pointer", color: "#c98a8a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT */}
          <div style={{ position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 18 }}>

            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#16100f" }}>Configurações da aula</h3>

              <div>
                <label style={labelS}>Duração (minutos)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#faf7f7", border: "1px solid #eadfdf", borderRadius: 11, padding: "11px 13px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a89e9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="0"
                    min="0"
                    style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f" }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#8a807e", flexShrink: 0 }}>min</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>Aula gratuita (preview)</div>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>{freePreview ? "Visível para todos" : "Apenas matriculados"}</div>
                </div>
                <Toggle on={freePreview} onToggle={() => setFreePreview((v) => !v)} />
              </div>

              {moduleData && (
                <div>
                  <label style={labelS}>Módulo</label>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#3a3030", background: "#faf7f7", border: "1px solid #eadfdf", borderRadius: 10, padding: "11px 13px" }}>
                    {moduleName}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: 14, cursor: "pointer", boxShadow: "0 8px 20px rgba(204,31,31,0.26)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                {isSaving ? "Salvando…" : "Publicar aula"}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                style={{ width: "100%", fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: 13, cursor: "pointer" }}
              >
                Salvar rascunho
              </button>
            </div>

          </div>
        </div>
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
