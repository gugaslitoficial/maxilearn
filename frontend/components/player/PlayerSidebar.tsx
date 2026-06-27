"use client";

import Link from "next/link";
import type { ModuleWithStatus } from "@/hooks/use-course-detail";

const PRIMARY = "var(--color-primary)";

export interface PlayerSidebarProps {
  courseId: string;
  currentLessonId: string;
  modulesWithStatus: ModuleWithStatus[];
  completedCount: number;
  totalLessons: number;
  progressPercent: number;
  onClose: () => void;
  lessonHref: (courseId: string, lessonId: string) => string;
  previewMode?: boolean;
}

export function PlayerSidebar({
  courseId,
  currentLessonId,
  modulesWithStatus,
  completedCount,
  totalLessons,
  progressPercent,
  onClose,
  lessonHref,
  previewMode = false,
}: PlayerSidebarProps) {
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
        {previewMode ? (
          <div style={{ fontSize: 12, fontWeight: 600, color: "#7dbfff" }}>{totalLessons} aulas · modo de visualização</div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#8a807e" }}>{completedCount} de {totalLessons} aulas</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1f8a5b" }}>{progressPercent}%</span>
            </div>
            <div style={{ height: 6, background: "#2a2424", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPercent}%`, background: "#1f8a5b", borderRadius: 4 }} />
            </div>
          </>
        )}
      </div>

      <div style={{ padding: "8px 0" }}>
        {modulesWithStatus.map((m) => (
          <div key={m.id}>
            <div style={{ padding: "14px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{m.title}</span>
              {!previewMode && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "#8a807e" }}>{m.moduleCompletedCount}/{m.lessons.length}</span>
              )}
            </div>
            {m.lessons.map((l) => {
              const isCurrent = l.id === currentLessonId;
              const isDone = l.status === "done";
              const showCheck = isDone;
              const showPlay = !isDone && (isCurrent || previewMode);
              const showLock = !isDone && !isCurrent && !previewMode;
              const circleBg = isDone ? "#1f8a5b" : isCurrent ? PRIMARY : "#2a2424";
              const textColor = isCurrent ? "#fff" : (l.status === "locked" && !previewMode) ? "#776e6c" : "#c9bfbd";
              return (
                <Link
                  key={l.id}
                  href={lessonHref(courseId, l.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 20px", background: isCurrent ? "#241a1a" : "transparent", textDecoration: "none" }}
                >
                  <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: circleBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {showCheck && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    )}
                    {showPlay && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                    )}
                    {showLock && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#776e6c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    )}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isCurrent ? 800 : 600, color: textColor, lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {l.title}
                    </div>
                    {l.durationMinutes && (
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#776e6c", marginTop: 1 }}>{l.durationMinutes} min</div>
                    )}
                  </div>
                  {isCurrent && (
                    <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", color: PRIMARY, background: "rgba(204,31,31,0.16)", padding: "3px 8px", borderRadius: 100 }}>
                      Agora
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
