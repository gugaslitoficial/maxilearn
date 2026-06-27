"use client";

import { useState, useId, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CourseEditorData } from "@/hooks/use-course-editor";
import { useProfessors } from "@/hooks/use-users";

const PRIMARY = "#CC1F1F";

type CourseLevel = "basico" | "inter" | "avanc";
type Visibility = "publico" | "restrito";

interface MaterialItem {
  id: string;
  title: string;
  url: string;
  type: "pdf" | "ppt" | "doc" | "link";
}

interface LocalOption {
  localId: string;
  text: string;
  isCorrect: boolean;
}

interface LocalQuestion {
  localId: string;
  statement: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  displayCount?: number;
  options: LocalOption[];
}

interface QuizDraft {
  quizId?: string;
  title: string;
  maxAttempts: number | null;
  shuffleQuestions: boolean;
  showAnswersAfter: boolean;
  questions: LocalQuestion[];
}

interface LessonItem {
  id: string;
  title: string;
  type: "video" | "quiz" | "file";
  videoUrl?: string;
  durationMinutes?: number;
  materials?: MaterialItem[];
  quizId?: string;
  quizTitle?: string;
}

interface ModuleItem {
  id: string;
  title: string;
  lessons: LessonItem[];
}

interface CourseWizardProps {
  initialCourseId?: string;
  initialData?: CourseEditorData;
  backHref?: string;
  showTeacherPicker?: boolean;
}

const STEPS = [
  { num: "1", label: "Informações" },
  { num: "2", label: "Conteúdo" },
  { num: "3", label: "Configurações" },
  { num: "4", label: "Revisão" },
];

const CATEGORIES = ["Segurança", "Técnico", "Compliance", "Comportamental", "Liderança", "Outro"];

const LEVEL_UI_TO_API: Record<CourseLevel, string> = {
  basico: "BASIC",
  inter: "INTERMEDIATE",
  avanc: "ADVANCED",
};

const LEVEL_API_TO_UI: Record<string, CourseLevel> = {
  BASIC: "basico",
  INTERMEDIATE: "inter",
  ADVANCED: "avanc",
};

function toYouTubeEmbed(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
}

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
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
  padding: "13px 15px",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color .15s, background .15s",
};

const labelS = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#3a3030",
  marginBottom: 7,
} as const;

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

function LessonIcon({ type }: { type: string }) {
  if (type === "quiz") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
  if (type === "file") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>
    </svg>
  );
}

function SaveStatusIcon({ status }: { status?: "saving" | "saved" | "error" }) {
  if (!status) return null;
  if (status === "saving") return (
    <div style={{ width: 16, height: 16, border: "2px solid #d8cccc", borderTopColor: PRIMARY, borderRadius: "50%", animation: "spin .6s linear infinite", flexShrink: 0 }} />
  );
  if (status === "saved") return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PRIMARY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 28px 22px", maxWidth: 380, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.18)" }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Trash2 size={20} color={PRIMARY} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#16100f", textAlign: "center", margin: "0 0 8px" }}>Confirmar exclusão</p>
        <p style={{ fontSize: 13.5, fontWeight: 500, color: "#8a807e", textAlign: "center", margin: "0 0 22px", lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} type="button" style={{ flex: 1, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#3a3030", background: "#f6f1f1", border: "none", borderRadius: 10, padding: "12px", cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={onConfirm} type="button" style={{ flex: 1, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#fff", background: PRIMARY, border: "none", borderRadius: 10, padding: "12px", cursor: "pointer" }}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoPanel({
  lesson,
  onUpdate,
}: {
  lesson: LessonItem;
  onUpdate: (updates: Partial<LessonItem>) => void;
}) {
  const videoId = lesson.videoUrl ? getYouTubeVideoId(lesson.videoUrl) : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={labelS}>URL do vídeo (YouTube)</label>
        <input
          value={lesson.videoUrl ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            const embed = raw ? toYouTubeEmbed(raw) : "";
            onUpdate({ videoUrl: embed || raw });
          }}
          placeholder="https://www.youtube.com/watch?v=..."
          style={{ ...inputS, fontSize: 13.5 }}
        />
        {thumbnailUrl && (
          <div style={{ marginTop: 10, borderRadius: 10, overflow: "hidden", maxWidth: 280, border: "1px solid #eadfdf" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnailUrl} alt="Thumbnail do vídeo" style={{ width: "100%", display: "block" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function MaterialsPanel({
  lesson,
  onUpdate,
}: {
  lesson: LessonItem;
  onUpdate: (updates: Partial<LessonItem>) => void;
}) {
  const materials = lesson.materials ?? [];

  function addMaterial() {
    const newMat: MaterialItem = { id: `mat_${Date.now()}`, title: "", url: "", type: "link" };
    onUpdate({ materials: [...materials, newMat] });
  }

  function removeMaterial(id: string) {
    onUpdate({ materials: materials.filter((m) => m.id !== id) });
  }

  function updateMaterial(id: string, patch: Partial<MaterialItem>) {
    onUpdate({ materials: materials.map((m) => m.id === id ? { ...m, ...patch } : m) });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {materials.length === 0 && (
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#a89e9c", textAlign: "center", padding: "10px 0" }}>
          Nenhum material adicionado.
        </p>
      )}
      {materials.map((m) => (
        <div key={m.id} style={{ background: "#faf7f7", border: "1px solid #eadfdf", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={m.title}
              onChange={(e) => updateMaterial(m.id, { title: e.target.value })}
              placeholder="Nome do material"
              style={{ flex: 1, border: "1px solid #eadfdf", borderRadius: 8, padding: "8px 10px", fontSize: 13.5, fontFamily: "inherit", fontWeight: 600, color: "#16100f", background: "#fff", outline: "none" }}
            />
            <select
              value={m.type}
              onChange={(e) => updateMaterial(m.id, { type: e.target.value as MaterialItem["type"] })}
              style={{ border: "1px solid #eadfdf", borderRadius: 8, padding: "8px 10px", fontSize: 12.5, fontFamily: "inherit", fontWeight: 700, color: "#3a3030", background: "#fff", outline: "none", cursor: "pointer" }}
            >
              <option value="link">Link</option>
              <option value="pdf">PDF</option>
              <option value="ppt">PPT</option>
              <option value="doc">DOC</option>
            </select>
            <button onClick={() => removeMaterial(m.id)} type="button" style={{ width: 30, height: 30, border: "none", background: "transparent", cursor: "pointer", color: "#c98a8a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <input
            value={m.url}
            onChange={(e) => updateMaterial(m.id, { url: e.target.value })}
            placeholder="URL do material (https://...)"
            style={{ border: "1px solid #eadfdf", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", fontWeight: 500, color: "#3a3030", background: "#fff", outline: "none", width: "100%", boxSizing: "border-box" as const }}
          />
        </div>
      ))}
      <button onClick={addMaterial} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: PRIMARY, background: "#fff", border: "1.5px dashed #e2d2d2", borderRadius: 9, padding: "9px 13px", cursor: "pointer", alignSelf: "flex-start" }}>
        <Plus size={13} /> Adicionar material
      </button>
    </div>
  );
}

function QuizPanel({
  lesson,
  savedCourseId,
  lessonApiId,
  draft,
  onDraftChange,
  onSaved,
}: {
  lesson: LessonItem;
  savedCourseId?: string | null;
  lessonApiId?: string;
  draft: QuizDraft;
  onDraftChange: (patch: Partial<QuizDraft>) => void;
  onSaved: (quizId: string, quizTitle: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (lesson.quizId) {
    return (
      <div style={{ background: "#e8f5ee", border: "1px solid #b8e0cb", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: "#1f5a3b" }}>Quiz vinculado: {lesson.quizTitle || "Quiz"}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#2d7a52", marginTop: 2 }}>Para editar o quiz, acesse a página de quizzes.</div>
          </div>
        </div>
      </div>
    );
  }

  function addQuestion() {
    const q: LocalQuestion = {
      localId: `q_${Date.now()}`,
      statement: "",
      type: "MULTIPLE_CHOICE",
      options: [
        { localId: `o_${Date.now()}_1`, text: "", isCorrect: true },
        { localId: `o_${Date.now()}_2`, text: "", isCorrect: false },
      ],
    };
    onDraftChange({ questions: [...draft.questions, q] });
  }

  function removeQuestion(localId: string) {
    onDraftChange({ questions: draft.questions.filter((q) => q.localId !== localId) });
  }

  function updateQuestion(localId: string, patch: Partial<LocalQuestion>) {
    onDraftChange({
      questions: draft.questions.map((q) => {
        if (q.localId !== localId) return q;
        const updated = { ...q, ...patch };
        if (patch.type === "TRUE_FALSE") {
          updated.options = [
            { localId: `tf_v_${Date.now()}`, text: "Verdadeiro", isCorrect: true },
            { localId: `tf_f_${Date.now()}`, text: "Falso", isCorrect: false },
          ];
        }
        return updated;
      }),
    });
  }

  function updateOption(qLocalId: string, oLocalId: string, patch: Partial<LocalOption>) {
    onDraftChange({
      questions: draft.questions.map((q) => {
        if (q.localId !== qLocalId) return q;
        const options = q.options.map((o) => o.localId !== oLocalId ? o : { ...o, ...patch });
        if (patch.isCorrect) {
          return { ...q, options: options.map((o) => ({ ...o, isCorrect: o.localId === oLocalId })) };
        }
        return { ...q, options };
      }),
    });
  }

  function addOption(qLocalId: string) {
    onDraftChange({
      questions: draft.questions.map((q) => {
        if (q.localId !== qLocalId) return q;
        if (q.options.length >= 4) return q;
        return { ...q, options: [...q.options, { localId: `o_${Date.now()}`, text: "", isCorrect: false }] };
      }),
    });
  }

  function removeOption(qLocalId: string, oLocalId: string) {
    onDraftChange({
      questions: draft.questions.map((q) => {
        if (q.localId !== qLocalId) return q;
        if (q.options.length <= 2) return q;
        return { ...q, options: q.options.filter((o) => o.localId !== oLocalId) };
      }),
    });
  }

  async function saveQuiz() {
    if (!savedCourseId || !lessonApiId) {
      setError("Salve o rascunho do curso antes de criar o quiz.");
      return;
    }
    if (!draft.title.trim()) {
      setError("Informe o título do quiz.");
      return;
    }
    if (draft.questions.length === 0) {
      setError("Adicione pelo menos uma pergunta.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const questions = draft.questions.map((q, idx) => ({
        statement: q.statement,
        type: q.type,
        order: idx,
        displayCount: q.displayCount ?? undefined,
        options: q.type === "TRUE_FALSE"
          ? [{ text: "Verdadeiro", isCorrect: q.options[0]?.isCorrect ?? true }, { text: "Falso", isCorrect: !(q.options[0]?.isCorrect ?? true) }]
          : q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
      }));
      const res = await api.post<{ id: string; title: string }>("/quizzes", {
        title: draft.title,
        courseId: savedCourseId,
        lessonId: lessonApiId,
        maxAttempts: draft.maxAttempts,
        shuffleQuestions: draft.shuffleQuestions,
        showAnswersAfter: false,
        status: "PUBLISHED",
        questions,
      });
      onSaved(res.data.id, res.data.title || draft.title);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : typeof msg === "string" ? msg : "Erro ao criar quiz.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label style={labelS}>Título do quiz</label>
          <input value={draft.title} onChange={(e) => onDraftChange({ title: e.target.value })} placeholder="Ex: Quiz de fixação" style={{ ...inputS, fontSize: 13.5 }} />
        </div>
        <div style={{ flex: "0 0 140px" }}>
          <label style={labelS}>Máx. tentativas</label>
          <input type="number" value={draft.maxAttempts ?? ""} onChange={(e) => onDraftChange({ maxAttempts: e.target.value ? Number(e.target.value) : null })} min="1" placeholder="Ilimitado" style={{ ...inputS, fontSize: 13.5 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#3a3030", cursor: "pointer" }}>
          <Toggle on={draft.shuffleQuestions} onToggle={() => onDraftChange({ shuffleQuestions: !draft.shuffleQuestions })} />
          Embaralhar perguntas
        </label>
      </div>

      <div style={{ borderTop: "1px solid #f0e8e8", paddingTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#3a3030", marginBottom: 10 }}>Perguntas ({draft.questions.length})</div>
        {draft.questions.map((q, qi) => (
          <div key={q.localId} style={{ background: "#faf7f7", border: "1px solid #eadfdf", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: PRIMARY, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{qi + 1}</div>
              <textarea
                value={q.statement}
                onChange={(e) => updateQuestion(q.localId, { statement: e.target.value })}
                placeholder="Enunciado da pergunta"
                rows={2}
                style={{ flex: 1, border: "1px solid #eadfdf", borderRadius: 8, padding: "8px 10px", fontSize: 13.5, fontFamily: "inherit", fontWeight: 500, color: "#16100f", background: "#fff", outline: "none", resize: "none" }}
              />
              <button onClick={() => removeQuestion(q.localId)} type="button" style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: "#c98a8a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, paddingLeft: 32, flexWrap: "wrap", alignItems: "center" }}>
              {(["MULTIPLE_CHOICE", "TRUE_FALSE"] as const).map((t) => (
                <button key={t} type="button" onClick={() => updateQuestion(q.localId, { type: t })}
                  style={{ padding: "3px 10px", borderRadius: 6, border: `1.5px solid ${q.type === t ? PRIMARY : "#ece4e4"}`, background: q.type === t ? "#fceeee" : "#fff", fontSize: 11.5, fontWeight: 700, color: q.type === t ? PRIMARY : "#a89e9c", cursor: "pointer", fontFamily: "inherit" }}>
                  {t === "MULTIPLE_CHOICE" ? "Múltipla escolha" : "V ou F"}
                </button>
              ))}
              {q.type === "MULTIPLE_CHOICE" && (
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#a89e9c" }}>Mostrar</span>
                  <select
                    value={q.displayCount ?? ""}
                    onChange={(e) => updateQuestion(q.localId, { displayCount: e.target.value ? Number(e.target.value) : undefined })}
                    style={{ border: "1px solid #eadfdf", borderRadius: 6, padding: "3px 8px", fontSize: 12, fontFamily: "inherit", fontWeight: 700, color: "#3a3030", background: "#fff", outline: "none", cursor: "pointer" }}
                  >
                    <option value="">Todas as opções</option>
                    {Array.from({ length: Math.max(0, q.options.length - 1) }, (_, i) => i + 2).map((n) => (
                      <option key={n} value={n}>{n} opções</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {q.type === "MULTIPLE_CHOICE" && (
              <div style={{ paddingLeft: 32, display: "flex", flexDirection: "column", gap: 7 }}>
                {/* Correct answer selector */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#3a3030" }}>Resposta correta:</span>
                  <select
                    value={q.options.find((o) => o.isCorrect)?.localId ?? ""}
                    onChange={(e) => {
                      const correctId = e.target.value;
                      updateOption(q.localId, correctId, { isCorrect: true });
                    }}
                    style={{ border: "1px solid #eadfdf", borderRadius: 7, padding: "5px 10px", fontSize: 13, fontFamily: "inherit", fontWeight: 600, color: "#1f5a3b", background: "#e8f5ee", outline: "none", cursor: "pointer" }}
                  >
                    {q.options.map((o, oi) => (
                      <option key={o.localId} value={o.localId}>{`Opção ${oi + 1}${o.text ? `: ${o.text.slice(0, 30)}` : ""}`}</option>
                    ))}
                  </select>
                </div>
                {q.options.map((o, oi) => (
                  <div key={o.localId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: o.isCorrect ? "#1f8a5b" : "#d8cccc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {o.isCorrect && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                    </span>
                    <input
                      value={o.text}
                      onChange={(e) => updateOption(q.localId, o.localId, { text: e.target.value })}
                      placeholder={`Opção ${oi + 1}`}
                      style={{ flex: 1, border: `1px solid ${o.isCorrect ? "#b8e0cb" : "#eadfdf"}`, borderRadius: 7, padding: "7px 10px", fontSize: 13, fontFamily: "inherit", fontWeight: 500, color: "#16100f", background: o.isCorrect ? "#f0faf5" : "#fff", outline: "none" }}
                    />
                    {q.options.length > 2 && (
                      <button onClick={() => removeOption(q.localId, o.localId)} type="button" style={{ width: 24, height: 24, border: "none", background: "transparent", cursor: "pointer", color: "#c98a8a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    )}
                  </div>
                ))}
                {q.options.length < 10 && (
                  <button onClick={() => addOption(q.localId)} type="button" style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", padding: "4px 0", fontFamily: "inherit" }}>
                    + Adicionar opção
                  </button>
                )}
              </div>
            )}
            {q.type === "TRUE_FALSE" && (
              <div style={{ paddingLeft: 32, display: "flex", gap: 8 }}>
                {(["Verdadeiro", "Falso"] as const).map((label, i) => {
                  const isCorrect = i === 0 ? (q.options[0]?.isCorrect ?? true) : !(q.options[0]?.isCorrect ?? true);
                  return (
                    <button key={label} type="button"
                      onClick={() => {
                        const verdadeiroCorreto = label === "Verdadeiro";
                        updateQuestion(q.localId, {
                          options: [
                            { localId: `tf_v_${Date.now()}`, text: "Verdadeiro", isCorrect: verdadeiroCorreto },
                            { localId: `tf_f_${Date.now()}`, text: "Falso", isCorrect: !verdadeiroCorreto },
                          ],
                        });
                      }}
                      style={{ padding: "6px 14px", borderRadius: 7, border: `1.5px solid ${isCorrect ? "#1f8a5b" : "#eadfdf"}`, background: isCorrect ? "#e8f5ee" : "#fff", fontSize: 13, fontWeight: 700, color: isCorrect ? "#1f8a5b" : "#8a807e", cursor: "pointer", fontFamily: "inherit" }}>
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        <button onClick={addQuestion} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: PRIMARY, background: "#fff", border: "1.5px dashed #e2d2d2", borderRadius: 9, padding: "9px 13px", cursor: "pointer" }}>
          <Plus size={13} /> Adicionar pergunta
        </button>
      </div>

      {error && <div style={{ fontSize: 13, fontWeight: 600, color: PRIMARY, background: "#fceeee", border: "1px solid #f6d6d6", borderRadius: 8, padding: "10px 14px" }}>{error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={saveQuiz} disabled={saving} type="button" style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 10, padding: "11px 20px", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Salvando quiz…" : "Salvar quiz"}
        </button>
      </div>
    </div>
  );
}

function SortableModule({
  module,
  savedCourseId,
  lessonApiIds,
  expandedLessonId,
  moduleSaveStatus,
  lessonSaveStatus,
  panelSaving,
  quizDrafts,
  newlyAddedId,
  onAddLesson,
  onDeleteLesson,
  onDeleteModule,
  onModuleTitleBlur,
  onLessonTitleBlur,
  onUpdateLesson,
  onUpdateLessonContent,
  onToggleLesson,
  onSaveLessonPanel,
  onQuizDraftChange,
  onQuizSaved,
}: {
  module: ModuleItem;
  savedCourseId?: string | null;
  moduleApiId?: string;
  lessonApiIds?: Record<string, string>;
  expandedLessonId: string | null;
  moduleSaveStatus: Record<string, "saving" | "saved" | "error">;
  lessonSaveStatus: Record<string, "saving" | "saved" | "error">;
  panelSaving: string | null;
  quizDrafts: Record<string, QuizDraft>;
  newlyAddedId: string | null;
  onAddLesson: (moduleId: string) => void;
  onDeleteLesson: (moduleId: string, lessonId: string) => void;
  onDeleteModule: (moduleId: string) => void;
  onModuleTitleBlur: (moduleId: string, title: string) => void;
  onLessonTitleBlur: (moduleId: string, lessonId: string, title: string) => void;
  onUpdateLesson: (moduleId: string, lessonId: string, updates: { title?: string; type?: LessonItem["type"] }) => void;
  onUpdateLessonContent: (moduleId: string, lessonId: string, updates: Partial<LessonItem>) => void;
  onToggleLesson: (lessonId: string) => void;
  onSaveLessonPanel: (moduleId: string, lessonId: string) => void;
  onQuizDraftChange: (lessonId: string, patch: Partial<QuizDraft>) => void;
  onQuizSaved: (moduleId: string, lessonId: string, quizId: string, quizTitle: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={{ ...style, background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", background: "#fcfafa", borderBottom: "1px solid #f4eded" }}>
        <span {...attributes} {...listeners} style={{ cursor: "grab", color: "#c0b6b4", display: "flex", flexShrink: 0 }}>
          <GripVertical size={16} />
        </span>
        <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: PRIMARY, background: "#fceeee", border: "1px solid #f6d6d6", padding: "3px 9px", borderRadius: 100, flexShrink: 0 }}>
          Módulo
        </span>
        <input
          value={module.title}
          onChange={(e) => onUpdateLesson(module.id, "", { title: e.target.value })}
          onBlur={(e) => onModuleTitleBlur(module.id, e.target.value)}
          placeholder="Título do módulo"
          autoFocus={newlyAddedId === module.id}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 15,
            fontWeight: 800,
            color: "#16100f",
            fontFamily: "inherit",
            minWidth: 0,
          }}
        />
        <SaveStatusIcon status={moduleSaveStatus[module.id]} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#a89e9c", flexShrink: 0 }}>{module.lessons.length} aulas</span>
        <button onClick={() => onDeleteModule(module.id)} type="button" style={{ width: 30, height: 30, border: "none", background: "transparent", cursor: "pointer", color: "#a89e9c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Trash2 size={15} />
        </button>
      </div>
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {module.lessons.length === 0 && (
          <p style={{ fontSize: 13, fontWeight: 600, color: "#c0b6b4", padding: "8px 4px", textAlign: "center" }}>
            Nenhuma aula. Clique em &quot;Adicionar aula&quot; abaixo.
          </p>
        )}
        {module.lessons.map((l) => {
          const lessonApiId = lessonApiIds?.[l.id];
          const isExpanded = expandedLessonId === l.id;
          const draft = quizDrafts[l.id] ?? {
            title: "",
            maxAttempts: null,
            shuffleQuestions: false,
            showAnswersAfter: true,
            questions: [],
          };

          return (
            <div key={l.id} style={{ border: `1px solid ${isExpanded ? "#d4c5c5" : "#f0e8e8"}`, borderRadius: 10, background: "#fff", overflow: "hidden", transition: "border-color .15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px" }}>
                <span style={{ cursor: "grab", color: "#cfc4c2", display: "flex", flexShrink: 0 }}><GripVertical size={14} /></span>
                <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: "#f6f1f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a807e" }}>
                  <LessonIcon type={l.type} />
                </span>
                <input
                  value={l.title}
                  onChange={(e) => onUpdateLesson(module.id, l.id, { title: e.target.value })}
                  onBlur={(e) => onLessonTitleBlur(module.id, l.id, e.target.value)}
                  placeholder="Título da aula"
                  autoFocus={newlyAddedId === l.id}
                  style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#3a3030", minWidth: 0 }}
                />
                <SaveStatusIcon status={lessonSaveStatus[l.id]} />
                <button
                  onClick={() => onToggleLesson(l.id)}
                  type="button"
                  title={isExpanded ? "Fechar configurações" : "Configurar aula"}
                  style={{ width: 28, height: 28, border: "1px solid #ece4e4", borderRadius: 7, background: isExpanded ? "#fceeee" : "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: isExpanded ? PRIMARY : "#6a605e", flexShrink: 0 }}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <button onClick={() => onDeleteLesson(module.id, l.id)} type="button" style={{ width: 26, height: 26, border: "none", background: "transparent", cursor: "pointer", color: "#c98a8a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Type selector row */}
              <div style={{ display: "flex", gap: 5, padding: "0 12px 10px 55px" }}>
                {(["video", "quiz", "file"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onUpdateLesson(module.id, l.id, { type: t })}
                    style={{ padding: "3px 10px", borderRadius: 6, border: `1.5px solid ${l.type === t ? PRIMARY : "#ece4e4"}`, background: l.type === t ? "#fceeee" : "#fff", fontSize: 11.5, fontWeight: 700, color: l.type === t ? PRIMARY : "#a89e9c", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {t === "video" ? "🎬 Vídeo" : t === "quiz" ? "📝 Quiz" : "📎 Arquivo"}
                  </button>
                ))}
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid #f0e8e8", padding: "16px 16px 16px 55px", background: "#faf7f7" }}>
                  {l.type === "video" && (
                    <VideoPanel lesson={l} onUpdate={(u) => onUpdateLessonContent(module.id, l.id, u)} />
                  )}
                  {l.type === "quiz" && (
                    <QuizPanel
                      lesson={l}
                      savedCourseId={savedCourseId}
                      lessonApiId={lessonApiId}
                      draft={draft}
                      onDraftChange={(patch) => onQuizDraftChange(l.id, patch)}
                      onSaved={(qId, qTitle) => onQuizSaved(module.id, l.id, qId, qTitle)}
                    />
                  )}
                  {l.type === "file" && (
                    <MaterialsPanel lesson={l} onUpdate={(u) => onUpdateLessonContent(module.id, l.id, u)} />
                  )}

                  {l.type !== "quiz" && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                      {!lessonApiId && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#a89e9c", marginRight: "auto", alignSelf: "center" }}>
                          Salve o rascunho para persistir a configuração.
                        </span>
                      )}
                      <button
                        onClick={() => onSaveLessonPanel(module.id, l.id)}
                        disabled={panelSaving === l.id || !lessonApiId}
                        type="button"
                        style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 10, padding: "10px 18px", cursor: lessonApiId ? "pointer" : "default", opacity: (!lessonApiId || panelSaving === l.id) ? 0.55 : 1 }}
                      >
                        {panelSaving === l.id ? "Salvando…" : "Salvar configuração"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <button onClick={() => onAddLesson(module.id)} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: PRIMARY, background: "#fff", border: "1.5px dashed #e2d2d2", borderRadius: 10, padding: "11px 14px", cursor: "pointer", alignSelf: "flex-start" }}>
          <Plus size={15} /> Adicionar aula
        </button>
      </div>
    </div>
  );
}

export function CourseWizard({ initialCourseId, initialData, backHref, showTeacherPicker = false }: CourseWizardProps) {
  const router = useRouter();
  useId();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: professors } = useProfessors();

  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [savedCourseId, setSavedCourseId] = useState<string | null>(initialCourseId ?? null);
  const [courseStatus, setCourseStatus] = useState<string>(initialData?.course.status ?? "DRAFT");
  const [saveToast] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [moduleApiIds, setModuleApiIds] = useState<Record<string, string>>(() => {
    if (initialData) return Object.fromEntries(initialData.modules.map((m) => [m.id, m.id]));
    return {};
  });
  const [lessonApiIds, setLessonApiIds] = useState<Record<string, string>>(() => {
    if (initialData) return Object.fromEntries(
      initialData.modules.flatMap((m) => m.lessons.map((l) => [l.id, l.id]))
    );
    return {};
  });
  const pendingModuleDeletes = useRef<string[]>([]);
  const pendingLessonDeletes = useRef<{ moduleApiId: string; lessonApiId: string }[]>([]);

  // UX state
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [moduleSaveStatus, setModuleSaveStatus] = useState<Record<string, "saving" | "saved" | "error">>({});
  const [lessonSaveStatus, setLessonSaveStatus] = useState<Record<string, "saving" | "saved" | "error">>({});
  const [panelSaving, setPanelSaving] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "module" | "lesson"; moduleId: string; lessonId?: string } | null>(null);
  const [quizDrafts, setQuizDrafts] = useState<Record<string, QuizDraft>>({});
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  const course = initialData?.course;
  const [courseTitle, setCourseTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [category, setCategory] = useState(course?.category ?? "Segurança");
  const [level, setLevel] = useState<CourseLevel>(
    course?.level ? (LEVEL_API_TO_UI[course.level] ?? "inter") : "inter"
  );
  const [objectives, setObjectives] = useState<string[]>(
    course?.objectives && (course.objectives as string[]).length > 0
      ? (course.objectives as string[])
      : ["Objetivo de aprendizado 1"]
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnailUrl ?? "");
  const [download, setDownload] = useState(course?.allowDownload ?? true);
  const [certificateType, setCertificateType] = useState<"none" | "completion" | "approval">(
    (course as { certificateType?: string } | undefined)?.certificateType === "approval"
      ? "approval"
      : (course as { certificateType?: string } | undefined)?.certificateType === "none"
        ? "none"
        : course?.issueCertificate ? "completion" : "none"
  );
  const [minApprovalScore, setMinApprovalScore] = useState(
    (course as { minApprovalScore?: number } | undefined)?.minApprovalScore ?? 70
  );
  const [estimatedDuration, setEstimatedDuration] = useState(
    (course as { estimatedDurationMinutes?: number } | undefined)?.estimatedDurationMinutes ?? ""
  );
  const [visibility, setVisibility] = useState<Visibility>(
    course?.isRestricted ? "restrito" : "publico"
  );
  const [selectedTeacherId, setSelectedTeacherId] = useState(
    initialData?.course.teacherId ?? ""
  );

  const [modules, setModules] = useState<ModuleItem[]>(() => {
    if (initialData?.modules && initialData.modules.length > 0) {
      return initialData.modules.map((m) => ({
        id: m.id,
        title: m.title,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          type: (l.type === "quiz" ? "quiz" : l.type === "file" ? "file" : "video") as LessonItem["type"],
          videoUrl: l.videoUrl ?? undefined,
          durationMinutes: l.durationMinutes ?? undefined,
          materials: (l.materials as MaterialItem[]) ?? [],
          quizId: l.quiz?.id,
          quizTitle: l.quiz?.title,
        })),
      }));
    }
    return [];
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = modules.findIndex((m) => m.id === active.id);
    const newIdx = modules.findIndex((m) => m.id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) { setModules(arrayMove(modules, oldIdx, newIdx)); return; }
    setModules((prev) => prev.map((m) => {
      const oi = m.lessons.findIndex((l) => l.id === active.id);
      const ni = m.lessons.findIndex((l) => l.id === over.id);
      if (oi === -1 || ni === -1) return m;
      return { ...m, lessons: arrayMove(m.lessons, oi, ni) };
    }));
  }

  function addModule() {
    const id = `m${Date.now()}`;
    setModules((prev) => [...prev, { id, title: "", lessons: [] }]);
    setNewlyAddedId(id);
    setTimeout(() => setNewlyAddedId(null), 500);
  }

  function addLesson(moduleId: string) {
    const id = `l${Date.now()}`;
    setModules((prev) => prev.map((m) =>
      m.id !== moduleId ? m : { ...m, lessons: [...m.lessons, { id, title: "", type: "video" as const, materials: [] }] }
    ));
    setNewlyAddedId(id);
    setTimeout(() => setNewlyAddedId(null), 500);
  }

  function deleteLesson(moduleId: string, lessonId: string) {
    setModules((prev) => prev.map((m) => m.id !== moduleId ? m : { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }));
    if (expandedLessonId === lessonId) setExpandedLessonId(null);
    const lApiId = lessonApiIds[lessonId];
    const mApiId = moduleApiIds[moduleId];
    if (lApiId && mApiId && savedCourseId) {
      setLessonApiIds((prev) => { const n = { ...prev }; delete n[lessonId]; return n; });
      pendingLessonDeletes.current.push({ moduleApiId: mApiId, lessonApiId: lApiId });
      api.delete(`/courses/${savedCourseId}/modules/${mApiId}/lessons/${lApiId}`)
        .then(() => {
          pendingLessonDeletes.current = pendingLessonDeletes.current.filter(
            (d) => !(d.moduleApiId === mApiId && d.lessonApiId === lApiId),
          );
        })
        .catch(() => { /* mantido em pendingLessonDeletes para reprocessar em saveCourse */ });
    }
  }

  function deleteModule(moduleId: string) {
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
    const mApiId = moduleApiIds[moduleId];
    if (mApiId && savedCourseId) {
      setModuleApiIds((prev) => { const n = { ...prev }; delete n[moduleId]; return n; });
      pendingModuleDeletes.current.push(mApiId);
      api.delete(`/courses/${savedCourseId}/modules/${mApiId}`)
        .then(() => {
          pendingModuleDeletes.current = pendingModuleDeletes.current.filter((id) => id !== mApiId);
        })
        .catch(() => { /* mantido em pendingModuleDeletes para reprocessar em saveCourse */ });
    }
  }

  function updateModuleTitle(moduleId: string, title: string) {
    setModules((prev) => prev.map((m) => m.id !== moduleId ? m : { ...m, title }));
  }

  function updateLesson(moduleId: string, lessonId: string, updates: { title?: string; type?: LessonItem["type"] }) {
    if (lessonId === "") {
      // This is actually a module title update (called from SortableModule with lessonId="")
      if (updates.title !== undefined) updateModuleTitle(moduleId, updates.title);
      return;
    }
    setModules((prev) => prev.map((m) =>
      m.id !== moduleId ? m : { ...m, lessons: m.lessons.map((l) => l.id !== lessonId ? l : { ...l, ...updates }) }
    ));
    // Immediately persist type change so the player sees the correct type without requiring a full course save
    if (updates.type !== undefined) {
      const lessonApiId = lessonApiIds[lessonId];
      const moduleApiId = moduleApiIds[moduleId];
      if (lessonApiId && moduleApiId && savedCourseId) {
        api.patch(`/courses/${savedCourseId}/modules/${moduleApiId}/lessons/${lessonApiId}`, { type: updates.type }).catch(() => {});
      }
    }
  }

  function updateLessonContent(moduleId: string, lessonId: string, updates: Partial<LessonItem>) {
    setModules((prev) => prev.map((m) =>
      m.id !== moduleId ? m : { ...m, lessons: m.lessons.map((l) => l.id !== lessonId ? l : { ...l, ...updates }) }
    ));
  }

  const handleModuleTitleBlur = useCallback(async (moduleId: string, title: string) => {
    const apiId = moduleApiIds[moduleId];
    if (!apiId || !savedCourseId || title.trim().length < 3) return;
    setModuleSaveStatus((prev) => ({ ...prev, [moduleId]: "saving" }));
    try {
      await api.patch(`/courses/${savedCourseId}/modules/${apiId}`, { title });
      setModuleSaveStatus((prev) => ({ ...prev, [moduleId]: "saved" }));
      setTimeout(() => setModuleSaveStatus((prev) => { const n = { ...prev }; delete n[moduleId]; return n; }), 2000);
    } catch {
      setModuleSaveStatus((prev) => ({ ...prev, [moduleId]: "error" }));
    }
  }, [moduleApiIds, savedCourseId]);

  const handleLessonTitleBlur = useCallback(async (moduleId: string, lessonId: string, title: string) => {
    const lessonApiId = lessonApiIds[lessonId];
    const moduleApiId = moduleApiIds[moduleId];
    if (!lessonApiId || !moduleApiId || !savedCourseId || title.trim().length < 3) return;
    setLessonSaveStatus((prev) => ({ ...prev, [lessonId]: "saving" }));
    try {
      await api.patch(`/courses/${savedCourseId}/modules/${moduleApiId}/lessons/${lessonApiId}`, { title });
      setLessonSaveStatus((prev) => ({ ...prev, [lessonId]: "saved" }));
      setTimeout(() => setLessonSaveStatus((prev) => { const n = { ...prev }; delete n[lessonId]; return n; }), 2000);
    } catch {
      setLessonSaveStatus((prev) => ({ ...prev, [lessonId]: "error" }));
    }
  }, [lessonApiIds, moduleApiIds, savedCourseId]);

  function toggleLesson(lessonId: string) {
    setExpandedLessonId((prev) => prev === lessonId ? null : lessonId);
  }

  const saveLessonPanel = useCallback(async (moduleId: string, lessonId: string) => {
    const lessonApiId = lessonApiIds[lessonId];
    const moduleApiId = moduleApiIds[moduleId];
    if (!lessonApiId || !moduleApiId || !savedCourseId) return;
    const lesson = modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
    if (!lesson) return;
    setPanelSaving(lessonId);
    try {
      await api.patch(`/courses/${savedCourseId}/modules/${moduleApiId}/lessons/${lessonApiId}`, {
        type: lesson.type,
        videoUrl: lesson.videoUrl || null,
        durationMinutes: lesson.durationMinutes || null,
        materials: lesson.materials ?? [],
      });
    } catch {
      // panel save errors are silent — user can retry
    } finally {
      setPanelSaving(null);
    }
  }, [lessonApiIds, moduleApiIds, savedCourseId, modules]);

  function handleQuizDraftChange(lessonId: string, patch: Partial<QuizDraft>) {
    setQuizDrafts((prev) => ({
      ...prev,
      [lessonId]: { ...(prev[lessonId] ?? { title: "", maxAttempts: null, shuffleQuestions: false, showAnswersAfter: true, questions: [] }), ...patch },
    }));
  }

  function handleQuizSaved(moduleId: string, lessonId: string, quizId: string, quizTitle: string) {
    updateLessonContent(moduleId, lessonId, { quizId, quizTitle });
    // Safety net: ensure type="quiz" is persisted even if the type button was clicked before the lesson had a backend ID
    const lessonApiId = lessonApiIds[lessonId];
    const moduleApiId = moduleApiIds[moduleId];
    if (lessonApiId && moduleApiId && savedCourseId) {
      api.patch(`/courses/${savedCourseId}/modules/${moduleApiId}/lessons/${lessonApiId}`, { type: "quiz" }).catch(() => {});
    }
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  const segBtn = (active: boolean) => ({
    flex: 1, fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "11px 8px",
    borderRadius: 9, cursor: "pointer",
    background: active ? PRIMARY : "#fff",
    color: active ? "#fff" : "#6a605e",
    border: active ? `1.5px solid ${PRIMARY}` : "1.5px solid #e6dede",
  } as const);

  async function saveCourse(publish = false) {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        title: courseTitle || "Curso sem título",
        description: description || undefined,
        category: category || undefined,
        level: LEVEL_UI_TO_API[level],
        thumbnailUrl: thumbnailUrl || undefined,
        teacherId: showTeacherPicker ? selectedTeacherId : user.id,
        allowDownload: download,
        issueCertificate: certificateType !== "none",
        certificateType,
        minApprovalScore,
        estimatedDurationMinutes: estimatedDuration ? Number(estimatedDuration) : undefined,
        objectives: objectives.filter(Boolean),
        isRestricted: visibility === "restrito",
      };

      let cId = savedCourseId;
      if (!cId) {
        const res = await api.post<{ id: string }>("/courses", payload);
        cId = res.data.id;
        setSavedCourseId(cId);
      } else {
        await api.patch(`/courses/${cId}`, payload);
      }

      // Reprocessa deleções que falharam na chamada imediata
      let hasDeleteErrors = false;
      const remainingModDeletes: string[] = [];
      for (const mApiId of pendingModuleDeletes.current) {
        try {
          await api.delete(`/courses/${cId}/modules/${mApiId}`);
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status !== 404) { remainingModDeletes.push(mApiId); hasDeleteErrors = true; }
          // 404 = já deletado com sucesso anteriormente, ignora
        }
      }
      pendingModuleDeletes.current = remainingModDeletes;

      const remainingLsnDeletes: { moduleApiId: string; lessonApiId: string }[] = [];
      for (const d of pendingLessonDeletes.current) {
        if (remainingModDeletes.includes(d.moduleApiId)) {
          // Módulo pai ainda falhou; mantém para próxima tentativa
          remainingLsnDeletes.push(d);
          continue;
        }
        try {
          await api.delete(`/courses/${cId}/modules/${d.moduleApiId}/lessons/${d.lessonApiId}`);
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status !== 404) { remainingLsnDeletes.push(d); hasDeleteErrors = true; }
        }
      }
      pendingLessonDeletes.current = remainingLsnDeletes;

      const localModuleIds = { ...moduleApiIds };
      const localLessonIds = { ...lessonApiIds };

      for (let i = 0; i < modules.length; i++) {
        const m = modules[i];
        let mApiId = localModuleIds[m.id];
        if (!mApiId) {
          const modRes = await api.post<{ id: string }>(`/courses/${cId}/modules`, { title: m.title || "Módulo", order: i + 1 });
          mApiId = modRes.data.id;
          localModuleIds[m.id] = mApiId;
        } else {
          // Update existing module title
          await api.patch(`/courses/${cId}/modules/${mApiId}`, { title: m.title || "Módulo" });
        }
        for (let j = 0; j < m.lessons.length; j++) {
          const l = m.lessons[j];
          if (!localLessonIds[l.id]) {
            const lRes = await api.post<{ id: string }>(`/courses/${cId}/modules/${mApiId}/lessons`, {
              title: l.title || "Aula",
              type: l.type,
              order: j + 1,
              videoUrl: l.videoUrl || undefined,
              durationMinutes: l.durationMinutes || undefined,
              materials: l.materials ?? [],
            });
            localLessonIds[l.id] = lRes.data.id;
          } else {
            // Update existing lesson title/type/content
            await api.patch(`/courses/${cId}/modules/${mApiId}/lessons/${localLessonIds[l.id]}`, {
              title: l.title || "Aula",
              type: l.type,
              videoUrl: l.videoUrl || null,
              durationMinutes: l.durationMinutes || null,
              materials: l.materials ?? [],
            });
          }
        }
      }

      setModuleApiIds((prev) => ({ ...prev, ...localModuleIds }));
      setLessonApiIds((prev) => ({ ...prev, ...localLessonIds }));

      if (publish && courseStatus !== "PUBLISHED") {
        await api.patch(`/courses/${cId}/status`, { status: "PUBLISHED" });
        setCourseStatus("PUBLISHED");
      }

      qc.invalidateQueries({ queryKey: ["courses-professor"] });
      qc.invalidateQueries({ queryKey: ["courses-admin"] });
      qc.invalidateQueries({ queryKey: ["course-editor", cId] });

      if (hasDeleteErrors) {
        setSaveError("Alguns itens não foram excluídos do servidor. Verifique sua conexão e tente salvar novamente.");
        return;
      }

      if (publish) {
        router.push(backHref ?? "/professor/cursos");
      }
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = anyErr?.response?.data?.message;
      setSaveError(
        Array.isArray(msg) ? msg[0] : typeof msg === "string" ? msg : "Erro ao salvar o curso."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const levelLabel = level === "basico" ? "Básico" : level === "inter" ? "Intermediário" : "Avançado";
  const isEdit = !!initialCourseId;

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {showPreview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "24px 16px" }}>
          <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 620, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 64px rgba(0,0,0,0.22)", overflow: "hidden" }}>
            {/* Warning banner */}
            <div style={{ background: "#fffbeb", borderBottom: "1px solid #fcd34d", padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Este curso ainda não está publicado — estudantes não podem acessá-lo</span>
            </div>
            {/* Course header preview */}
            <div style={{ background: "#1A1A1A", padding: "22px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>{category} · {levelLabel}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{courseTitle || "Curso sem título"}</div>
              {description && <p style={{ fontSize: 13.5, fontWeight: 500, color: "#c8bebe", marginTop: 10, lineHeight: 1.55, maxWidth: 520 }}>{description}</p>}
            </div>
            {/* Modules preview */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#3a3030", marginBottom: 12 }}>Conteúdo do curso ({modules.length} módulo{modules.length !== 1 ? "s" : ""} · {totalLessons} aula{totalLessons !== 1 ? "s" : ""})</div>
              {modules.length === 0 && <p style={{ fontSize: 13.5, fontWeight: 600, color: "#a89e9c" }}>Nenhum módulo adicionado ainda.</p>}
              {modules.map((m) => (
                <div key={m.id} style={{ border: "1px solid #ece4e4", borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{ padding: "11px 14px", background: "#fcfafa", fontWeight: 800, fontSize: 14, color: "#16100f", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a89e9c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    {m.title || "Módulo sem título"}
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: "#a89e9c", marginLeft: "auto" }}>{m.lessons.length} aula{m.lessons.length !== 1 ? "s" : ""}</span>
                  </div>
                  {m.lessons.map((l) => (
                    <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px 9px 28px", borderTop: "1px solid #f6f1f1" }}>
                      <span style={{ color: "#a89e9c", display: "flex", flexShrink: 0 }}>
                        {l.type === "quiz" ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> : l.type === "file" ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>}
                      </span>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#3a3030" }}>{l.title || "Aula sem título"}</span>
                      {l.durationMinutes && <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#a89e9c", flexShrink: 0 }}>{l.durationMinutes} min</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {/* Footer */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid #ece4e4", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowPreview(false)} type="button" style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#16100f", background: "#f6f1f1", border: "none", borderRadius: 10, padding: "11px 22px", cursor: "pointer" }}>
                Fechar pré-visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          message={
            confirmDelete.type === "module"
              ? "Tem certeza que deseja excluir este módulo e todas as suas aulas?"
              : "Tem certeza que deseja excluir esta aula?"
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.type === "module") {
              deleteModule(confirmDelete.moduleId);
            } else if (confirmDelete.lessonId) {
              deleteLesson(confirmDelete.moduleId, confirmDelete.lessonId);
            }
            setConfirmDelete(null);
          }}
        />
      )}

      <div style={{ minHeight: "100vh", background: "#f6f4f3", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "14px clamp(16px,3vw,32px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "sticky", top: 0, zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
            <button
              onClick={() => backHref ? router.push(backHref) : router.back()}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#6a605e", background: "#f6f1f1", border: "1px solid #ece4e4", padding: "9px 14px", borderRadius: 10, cursor: "pointer", flexShrink: 0 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6a605e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              Sair
            </button>
            <div style={{ width: 1, height: 24, background: "#ece4e4", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "#16100f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {courseTitle || "Curso sem título"}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#a89e9c" }}>
                {isEdit ? "Editando curso" : (savedCourseId ? "Rascunho · salvo" : "Novo curso")}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {saveError && (
              <span style={{ fontSize: 13, fontWeight: 600, color: PRIMARY, maxWidth: 260, textAlign: "right" }}>
                {saveError}
              </span>
            )}
            <button
              onClick={() => saveCourse(false)}
              disabled={isSaving}
              style={{ fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 10, padding: "10px 16px", cursor: "pointer" }}
            >
              {isSaving ? "Salvando…" : "Salvar rascunho"}
            </button>
            <button
              onClick={() => saveCourse(true)}
              disabled={isSaving}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 10, padding: "11px 18px", cursor: "pointer", boxShadow: "0 6px 16px rgba(204,31,31,0.26)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              {courseStatus === "PUBLISHED" ? "Salvar" : courseStatus === "ARCHIVED" ? "Reativar" : "Publicar"}
            </button>
          </div>
        </header>

        {/* Stepper */}
        <div style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "0 clamp(16px,3vw,32px)" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "stretch" }}>
            {STEPS.map((s, i) => {
              const done = i < step, cur = i === step;
              return (
                <button key={s.num} onClick={() => setStep(i)} type="button"
                  style={{ flex: 1, display: "flex", alignItems: "center", gap: 11, padding: "18px 8px", background: "transparent", border: "none", borderBottom: `2.5px solid ${cur ? PRIMARY : "transparent"}`, cursor: "pointer", fontFamily: "inherit", minWidth: 0 }}
                >
                  <span style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, background: cur ? PRIMARY : done ? "#fceeee" : "#f3eaea", color: cur ? "#fff" : done ? PRIMARY : "#b3a6a6", border: done ? `1.5px solid ${PRIMARY}` : "none" }}>
                    {s.num}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#a89e9c", letterSpacing: "0.02em" }}>Etapa {s.num}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: cur || done ? "#16100f" : "#a89e9c", whiteSpace: "nowrap" }}>{s.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: "clamp(22px,3vw,40px) clamp(16px,3vw,32px)", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 760 }}>

            {/* Step 1 — Basic info */}
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Informações básicas</h2>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#8a807e", marginTop: 4 }}>Comece descrevendo o curso para os alunos.</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={labelS}>Título do curso</label>
                    <input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} placeholder="Ex.: Segurança no Trabalho" style={inputS} />
                  </div>
                  <div>
                    <label style={labelS}>Imagem de capa (URL)</label>
                    <input
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://exemplo.com/imagem.jpg"
                      style={inputS}
                    />
                    {thumbnailUrl && (
                      <div style={{ marginTop: 10, borderRadius: 10, overflow: "hidden", maxWidth: 300, border: "1px solid #eadfdf" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumbnailUrl} alt="Capa do curso" style={{ width: "100%", display: "block", maxHeight: 160, objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={labelS}>Descrição</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="O que o aluno vai aprender neste curso..." style={{ ...inputS, resize: "none" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelS}>Categoria</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputS}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelS}>Nível</label>
                      <div style={{ display: "flex", gap: 7 }}>
                        <button onClick={() => setLevel("basico")} type="button" style={segBtn(level === "basico")}>Básico</button>
                        <button onClick={() => setLevel("inter")} type="button" style={segBtn(level === "inter")}>Intermediário</button>
                        <button onClick={() => setLevel("avanc")} type="button" style={segBtn(level === "avanc")}>Avançado</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={labelS}>Objetivos de aprendizado</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {objectives.map((o, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#faf7f7", border: "1px solid #eadfdf", borderRadius: 10, padding: "11px 13px" }}>
                          <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          </span>
                          <input
                            value={o}
                            onChange={(e) => setObjectives((prev) => prev.map((x, j) => j === i ? e.target.value : x))}
                            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 500, color: "#3a3030" }}
                          />
                          <button onClick={() => setObjectives((prev) => prev.filter((_, j) => j !== i))} type="button" style={{ width: 26, height: 26, border: "none", background: "transparent", cursor: "pointer", color: "#c98a8a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setObjectives((prev) => [...prev, ""])}
                        type="button"
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: PRIMARY, background: "#fff", border: "1.5px dashed #e2d2d2", borderRadius: 10, padding: "11px 14px", cursor: "pointer", alignSelf: "flex-start" }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                        Adicionar objetivo
                      </button>
                    </div>
                  </div>
                  {showTeacherPicker && (
                    <div>
                      <label style={labelS}>Professor responsável</label>
                      <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)} style={inputS}>
                        <option value="">Selecione um professor…</option>
                        {(professors ?? []).map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2 — Content */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Conteúdo do curso</h2>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#8a807e", marginTop: 4 }}>Organize módulos e aulas. Clique na seta para configurar cada aula.</p>
                  </div>
                  <button onClick={addModule} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#fff", background: PRIMARY, border: "none", padding: "11px 18px", borderRadius: 10, cursor: "pointer", boxShadow: "0 6px 16px rgba(204,31,31,0.26)" }}>
                    <Plus size={15} /> Adicionar módulo
                  </button>
                </div>
                {modules.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", border: "1.5px dashed #e2d2d2", borderRadius: 14 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "#6a605e" }}>Nenhum módulo ainda. Adicione o primeiro módulo para começar.</div>
                  </div>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {modules.map((m) => (
                        <SortableModule
                          key={m.id}
                          module={m}
                          savedCourseId={savedCourseId}
                          moduleApiId={moduleApiIds[m.id]}
                          lessonApiIds={lessonApiIds}
                          expandedLessonId={expandedLessonId}
                          moduleSaveStatus={moduleSaveStatus}
                          lessonSaveStatus={lessonSaveStatus}
                          panelSaving={panelSaving}
                          quizDrafts={quizDrafts}
                          newlyAddedId={newlyAddedId}
                          onAddLesson={addLesson}
                          onDeleteLesson={(moduleId, lessonId) => setConfirmDelete({ type: "lesson", moduleId, lessonId })}
                          onDeleteModule={(moduleId) => setConfirmDelete({ type: "module", moduleId })}
                          onModuleTitleBlur={handleModuleTitleBlur}
                          onLessonTitleBlur={handleLessonTitleBlur}
                          onUpdateLesson={updateLesson}
                          onUpdateLessonContent={updateLessonContent}
                          onToggleLesson={toggleLesson}
                          onSaveLessonPanel={saveLessonPanel}
                          onQuizDraftChange={handleQuizDraftChange}
                          onQuizSaved={handleQuizSaved}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Step 3 — Settings */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Configurações</h2>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#8a807e", marginTop: 4 }}>Defina regras de acesso e avaliação.</p>
                </div>
                <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, padding: "10px 26px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 0", borderBottom: "1px solid #f6f1f1" }}>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: "#16100f" }}>Permitir download de materiais</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>Alunos podem baixar PDFs e anexos.</div>
                    </div>
                    <Toggle on={download} onToggle={() => setDownload((v) => !v)} />
                  </div>
                  {/* Certificate type */}
                  <div style={{ padding: "18px 0", borderBottom: "1px solid #f6f1f1" }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "#16100f", marginBottom: 12 }}>Certificado de conclusão</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {([
                        { value: "none", label: "Sem certificado", desc: "Nenhum certificado será emitido." },
                        { value: "completion", label: "Certificado por conclusão", desc: "Emitido ao concluir todas as aulas." },
                        { value: "approval", label: "Certificado por aprovação", desc: `Emitido ao concluir com nota ≥ ${minApprovalScore}%.` },
                      ] as const).map((opt) => (
                        <label key={opt.value} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", border: `1.5px solid ${certificateType === opt.value ? PRIMARY : "#eadfdf"}`, borderRadius: 10, cursor: "pointer", background: certificateType === opt.value ? "#fef9f9" : "#fff" }}>
                          <input type="radio" value={opt.value} checked={certificateType === opt.value} onChange={() => setCertificateType(opt.value)} style={{ marginTop: 3, accentColor: PRIMARY, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#16100f" }}>{opt.label}</div>
                            <div style={{ fontSize: 12.5, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>{opt.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Scores and duration */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: "20px 0", borderBottom: "1px solid #f6f1f1" }}>
                    <div>
                      <label style={labelS}>Nota mínima de aprovação (0-100)</label>
                      <input
                        type="number"
                        value={minApprovalScore}
                        onChange={(e) => setMinApprovalScore(Number(e.target.value))}
                        min="0" max="100"
                        disabled={certificateType !== "approval"}
                        style={{ ...inputS, maxWidth: 160, opacity: certificateType !== "approval" ? 0.4 : 1 }}
                      />
                    </div>
                    <div>
                      <label style={labelS}>Duração estimada (minutos)</label>
                      <input
                        type="number"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                        min="1"
                        placeholder="Ex: 120"
                        style={{ ...inputS, maxWidth: 160 }}
                      />
                    </div>
                  </div>
                  <div style={{ padding: "18px 0" }}>
                    <label style={labelS}>Visibilidade</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setVisibility("publico")} type="button" style={segBtn(visibility === "publico")}>Público</button>
                      <button onClick={() => setVisibility("restrito")} type="button" style={segBtn(visibility === "restrito")}>Restrito</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Review */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Revisão e publicação</h2>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#8a807e", marginTop: 4 }}>Confira tudo antes de publicar para os alunos.</p>
                  </div>
                  {(() => {
                    const statusMeta: Record<string, { label: string; bg: string; color: string; border: string }> = {
                      DRAFT:     { label: "Rascunho",  bg: "#fffbeb", color: "#92400e", border: "#fcd34d" },
                      PUBLISHED: { label: "Publicado", bg: "#ecfdf5", color: "#065f46", border: "#6ee7b7" },
                      ARCHIVED:  { label: "Arquivado", bg: "#f3f4f6", color: "#374151", border: "#d1d5db" },
                    };
                    const m = statusMeta[courseStatus] ?? statusMeta.DRAFT;
                    return (
                      <span style={{ fontSize: 12.5, fontWeight: 800, padding: "5px 12px", borderRadius: 100, background: m.bg, color: m.color, border: `1.5px solid ${m.border}`, letterSpacing: "0.02em", alignSelf: "flex-start" }}>
                        {m.label}
                      </span>
                    );
                  })()}
                </div>
                {saveError && (
                  <div style={{ background: "#fceeee", border: "1px solid #f6d6d6", borderRadius: 12, padding: "14px 18px", fontSize: 14, fontWeight: 600, color: PRIMARY }}>
                    {saveError}
                  </div>
                )}
                {saveToast && (
                  <div style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: 12, padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "#065f46", display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    Alterações salvas com sucesso!
                  </div>
                )}
                <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
                  <div style={{ height: 120, background: `linear-gradient(135deg,${PRIMARY},#e85a4f)`, display: "flex", alignItems: "center", padding: "0 26px" }}>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>{category} · {levelLabel}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", marginTop: 4 }}>{courseTitle || "Curso sem título"}</div>
                    </div>
                  </div>
                  <div style={{ padding: "24px 26px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 20 }}>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: "#a89e9c", textTransform: "uppercase", letterSpacing: "0.03em" }}>Módulos</div><div style={{ fontSize: 20, fontWeight: 800, color: "#16100f", marginTop: 4 }}>{modules.length}</div></div>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: "#a89e9c", textTransform: "uppercase", letterSpacing: "0.03em" }}>Aulas</div><div style={{ fontSize: 20, fontWeight: 800, color: "#16100f", marginTop: 4 }}>{totalLessons}</div></div>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: "#a89e9c", textTransform: "uppercase", letterSpacing: "0.03em" }}>Duração</div><div style={{ fontSize: 20, fontWeight: 800, color: "#16100f", marginTop: 4 }}>{estimatedDuration ? `${estimatedDuration} min` : "—"}</div></div>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: "#a89e9c", textTransform: "uppercase", letterSpacing: "0.03em" }}>Certificado</div><div style={{ fontSize: 14, fontWeight: 800, color: "#16100f", marginTop: 4 }}>{{ none: "Sem certificado", completion: "Por conclusão", approval: `Aprovação ≥${minApprovalScore}%` }[certificateType]}</div></div>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: "#a89e9c", textTransform: "uppercase", letterSpacing: "0.03em" }}>Visibilidade</div><div style={{ fontSize: 20, fontWeight: 800, color: "#16100f", marginTop: 4 }}>{visibility === "publico" ? "Público" : "Restrito"}</div></div>
                  </div>
                </div>
                {savedCourseId && (
                  <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "14px 18px", background: "#f6f1f1", borderRadius: 12, border: "1px solid #ece4e4" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6a605e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#6a605e" }}>Visualizar como estudante:</span>
                    {courseStatus === "PUBLISHED" ? (
                      <a
                        href={`/aluno/curso/${savedCourseId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 800, color: PRIMARY, textDecoration: "none", background: "#fceeee", border: `1.5px solid ${PRIMARY}`, borderRadius: 9, padding: "8px 14px" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Abrir página do curso
                      </a>
                    ) : (
                      <button
                        onClick={() => setShowPreview(true)}
                        type="button"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 800, color: "#3a3030", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 9, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        Pré-visualizar
                      </button>
                    )}
                  </div>
                )}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  {courseStatus !== "PUBLISHED" && (
                    <button onClick={() => saveCourse(false)} disabled={isSaving} style={{ fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: "13px 22px", cursor: "pointer" }}>
                      {isSaving ? "Salvando…" : "Salvar rascunho"}
                    </button>
                  )}
                  <button onClick={() => saveCourse(true)} disabled={isSaving} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: "13px 24px", cursor: "pointer", boxShadow: "0 10px 24px rgba(204,31,31,0.26)" }}>
                    {courseStatus === "PUBLISHED" ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    )}
                    {isSaving
                      ? "Salvando…"
                      : courseStatus === "PUBLISHED"
                        ? "Salvar alterações"
                        : courseStatus === "ARCHIVED"
                          ? "Reativar curso"
                          : "Publicar curso"}
                  </button>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 26 }}>
              {step > 0 ? (
                <button onClick={() => setStep((s) => s - 1)} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: "13px 22px", cursor: "pointer" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6a605e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                  Voltar
                </button>
              ) : <span />}
              {step < 3 && (
                <button onClick={() => setStep((s) => s + 1)} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: "13px 24px", cursor: "pointer", boxShadow: "0 8px 20px rgba(204,31,31,0.26)", marginLeft: "auto" }}>
                  Continuar
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
