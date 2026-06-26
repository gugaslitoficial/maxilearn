"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLessonContextPreview } from "@/hooks/use-lesson";
import { useAuth } from "@/hooks/use-auth";
import { PlayerSidebar } from "@/components/player/PlayerSidebar";
import { Toast } from "@/components/ui/Toast";

const PRIMARY = "#CC1F1F";

type Tab = "mat" | "notes" | "disc";

function Skeleton({ w, h, radius = 8 }: { w: string | number; h: number; radius?: number }) {
  return (
    <div style={{ width: w, height: h, borderRadius: radius, background: "linear-gradient(90deg,#2a2424 25%,#322a2a 50%,#2a2424 75%)", backgroundSize: "200% 100%", animation: "ml-shimmer 1.4s infinite" }} />
  );
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const embed = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return embed[1];
    }
  } catch {}
  return null;
}

export default function PreviewPlayerPage() {
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("mat");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { derived, isLoading } = useLessonContextPreview(courseId, lessonId);

  const backToEditHref = user?.role === "ADMIN"
    ? `/cursos/${courseId}/editar`
    : `/professor/cursos/${courseId}/editar`;

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

  function handleMarkComplete() {
    if (localCompleted) return;
    setLocalCompleted(true);
    setToast("Modo de visualização — progresso não foi salvo");
  }

  if (isLoading || !derived) {
    return (
      <div style={{ fontFamily: "Manrope, system-ui, sans-serif", minHeight: "100vh", background: "#121010", color: "#e6dede", display: "flex", flexDirection: "column" }}>
        <style>{`@keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        <div style={{ background: "#1e3a5f", borderBottom: "1px solid #2a4f7a", padding: "10px 28px", height: 44 }} />
        <div style={{ background: "#1a1616", borderBottom: "1px solid #2a2424", padding: "12px 28px" }}>
          <Skeleton w={300} h={20} />
        </div>
        <div style={{ flex: 1, display: "flex" }}>
          <div style={{ flex: 1, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
            <div style={{ width: "100%", maxWidth: 1100, aspectRatio: "16/9", background: "#1a1414", borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  const { course, currentLesson, currentModule, prevLesson, nextLesson, totalLessons, completedCount, progressPercent, modulesWithStatus } = derived;

  return (
    <div style={{ fontFamily: "Manrope, system-ui, sans-serif", minHeight: "100vh", background: "#121010", color: "#e6dede", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .player-sidebar-desktop { display: flex !important; }
        @media (max-width: 1024px) { .player-sidebar-desktop { display: none !important; } .lg-only { display: flex !important; } }
      `}</style>

      {/* Preview banner */}
      <div style={{ background: "#1e3a5f", borderBottom: "1px solid #2a4f7a", padding: "9px clamp(16px,3vw,28px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7dbfff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#b8d9ff" }}>
            Modo de visualização — suas interações não geram progresso real
          </span>
        </div>
        <Link
          href={backToEditHref}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 800, color: "#fff", textDecoration: "none", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 7, padding: "6px 13px", flexShrink: 0 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Voltar para edição
        </Link>
      </div>

      {/* Topbar */}
      <header style={{ background: "#1a1616", borderBottom: "1px solid #2a2424", padding: "12px clamp(16px,3vw,28px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          <Link
            href={`/curso/${courseId}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#cfc8c8", textDecoration: "none", background: "#272121", border: "1px solid #332c2c", padding: "8px 13px", borderRadius: 9, flexShrink: 0 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Sair
          </Link>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#8a807e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {course.title}{currentModule ? ` › ${currentModule.title}` : ""}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentLesson?.title ?? ""}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button
            className="lg-only"
            onClick={() => setDrawerOpen(true)}
            style={{ display: "none", alignItems: "center", gap: 6, fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "#cfc8c8", background: "#272121", border: "1px solid #332c2c", padding: "8px 12px", borderRadius: 9, cursor: "pointer" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
            Conteúdo
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 11, height: 11, border: "2.5px solid #fff", borderRadius: "50%", borderRightColor: "transparent", transform: "rotate(-45deg)" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>Maxi<span style={{ color: PRIMARY }}>Learn</span></span>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, position: "relative" }}>

        {/* MAIN */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Lesson content — type-aware */}
          <div style={{ background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(12px,2vw,28px)" }}>
            {currentLesson?.type === "video" ? (() => {
              const ytId = currentLesson.videoUrl ? extractYouTubeId(currentLesson.videoUrl) : null;
              if (ytId) return (
                <div style={{ width: "100%", maxWidth: 1100, aspectRatio: "16 / 9", borderRadius: 12, overflow: "hidden" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                  />
                </div>
              );
              if (currentLesson.videoUrl) return (
                <div style={{ width: "100%", maxWidth: 1100, aspectRatio: "16 / 9", borderRadius: 12, overflow: "hidden", background: "#000" }}>
                  <video src={currentLesson.videoUrl} controls style={{ width: "100%", height: "100%", display: "block" }} />
                </div>
              );
              return (
                <div style={{ width: "100%", maxWidth: 1100, aspectRatio: "16 / 9", background: "linear-gradient(135deg,#1a1414,#2a2020)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>URL do vídeo não configurada</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>{currentLesson.title}</div>
                  </div>
                </div>
              );
            })() : currentLesson?.type === "quiz" ? (
              <div style={{ width: "100%", maxWidth: 1100, minHeight: 260, background: "#111827", border: "1px solid #1e2a3a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18, padding: 40 }}>
                <div style={{ width: 68, height: 68, borderRadius: 18, background: "#1e2a3a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6b8fd4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6b8fd4", marginBottom: 10 }}>Quiz</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{currentLesson?.quiz?.title ?? currentLesson?.title}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#6a7a9a", marginTop: 8 }}>Este quiz faz parte da avaliação desta aula</div>
                </div>
              </div>
            ) : (
              <div style={{ width: "100%", maxWidth: 1100, background: "#161212", border: "1px solid #2a2424", borderRadius: 12, padding: "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "#8a807e" }}>Materiais</span>
                </div>
                {(!currentLesson?.materials || currentLesson.materials.length === 0) ? (
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", fontStyle: "italic" }}>Nenhum material adicionado a esta aula.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {currentLesson.materials.map((mat, i) => (
                      <a key={mat.id ?? i} href={mat.url || "#"} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#221d1d", border: "1px solid #2a2424", borderRadius: 10, textDecoration: "none" }}>
                        <span style={{ fontSize: 10, fontWeight: 900, color: "#e6dede", background: "#3a3030", padding: "3px 8px", borderRadius: 5, flexShrink: 0 }}>{(mat.type ?? "link").toUpperCase()}</span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e6dede", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mat.title || "Material sem nome"}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a807e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Below player */}
          <div style={{ background: "#1a1616", flex: 1, padding: "24px clamp(16px,3vw,32px) 40px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>

              {/* Title row + nav */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 22 }}>
                <div style={{ minWidth: 0 }}>
                  {currentModule && <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a807e" }}>{course.title} › {currentModule.title}</div>}
                  <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", marginTop: 6 }}>{currentLesson?.title}</h1>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
                  <button
                    onClick={() => prevLesson && router.push(`/curso/${courseId}/aula/${prevLesson.id}`)}
                    disabled={!prevLesson}
                    type="button"
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: prevLesson ? "#cfc8c8" : "#4a4040", background: "#272121", border: "1px solid #332c2c", borderRadius: 10, padding: "11px 16px", cursor: prevLesson ? "pointer" : "not-allowed", opacity: prevLesson ? 1 : 0.5 }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Anterior
                  </button>
                  <button
                    onClick={() => nextLesson && router.push(`/curso/${courseId}/aula/${nextLesson.id}`)}
                    disabled={!nextLesson}
                    type="button"
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: nextLesson ? "#fff" : "#4a4040", background: "#272121", border: "1px solid #332c2c", borderRadius: 10, padding: "11px 16px", cursor: nextLesson ? "pointer" : "not-allowed", opacity: nextLesson ? 1 : 0.5 }}
                  >
                    Próxima
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                  <button
                    onClick={handleMarkComplete}
                    disabled={localCompleted}
                    type="button"
                    style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: "#fff", background: localCompleted ? "#1f8a5b" : PRIMARY, border: "none", borderRadius: 10, padding: "11px 18px", cursor: localCompleted ? "default" : "pointer", boxShadow: localCompleted ? "none" : "0 6px 16px rgba(204,31,31,0.3)", transition: "background .2s" }}
                  >
                    <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </span>
                    {localCompleted ? "Concluída ✓ (sem salvar)" : "Marcar como concluída"}
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

              {tab === "mat" && (
                <div style={{ maxWidth: 680 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", fontStyle: "italic" }}>
                    Materiais de apoio para esta aula serão disponibilizados em breve.
                  </p>
                </div>
              )}

              {tab === "notes" && (
                <div style={{ maxWidth: 680 }}>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escreva suas anotações sobre esta aula..."
                    style={{ width: "100%", minHeight: 180, fontFamily: "inherit", fontSize: 14.5, lineHeight: 1.6, fontWeight: 500, color: "#e6dede", background: "#221d1d", border: "1px solid #322b2b", borderRadius: 13, padding: 16, outline: "none", resize: "vertical" }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#8a807e", marginTop: 8, display: "block" }}>Anotações em modo de visualização não são salvas.</span>
                </div>
              )}

              {tab === "disc" && (
                <div style={{ maxWidth: 680 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", fontStyle: "italic" }}>
                    Fórum de discussão em breve.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR — desktop */}
        {sidebarOpen && (
          <aside className="player-sidebar-desktop" style={{ width: 340, flexShrink: 0, background: "#1a1616", borderLeft: "1px solid #2a2424", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <PlayerSidebar
              courseId={courseId}
              currentLessonId={lessonId}
              modulesWithStatus={modulesWithStatus}
              completedCount={completedCount}
              totalLessons={totalLessons}
              progressPercent={progressPercent}
              onClose={() => setSidebarOpen(false)}
              lessonHref={(cId, lId) => `/curso/${cId}/aula/${lId}`}
              previewMode
            />
          </aside>
        )}

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

        {drawerOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50 }} onClick={() => setDrawerOpen(false)}>
            <aside style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 320, background: "#1a1616", borderLeft: "1px solid #2a2424", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
              <PlayerSidebar
                courseId={courseId}
                currentLessonId={lessonId}
                modulesWithStatus={modulesWithStatus}
                completedCount={completedCount}
                totalLessons={totalLessons}
                progressPercent={progressPercent}
                onClose={() => setDrawerOpen(false)}
                lessonHref={(cId, lId) => `/curso/${cId}/aula/${lId}`}
                previewMode
              />
            </aside>
          </div>
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
