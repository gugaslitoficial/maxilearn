"use client";

import { useState, useId } from "react";
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
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CourseEditorData } from "@/hooks/use-course-editor";

const PRIMARY = "#CC1F1F";

type CourseLevel = "basico" | "inter" | "avanc";
type Visibility = "publico" | "restrito";

interface LessonItem { id: string; title: string; type: "video" | "quiz" | "file" }
interface ModuleItem { id: string; title: string; lessons: LessonItem[] }

interface CourseWizardProps {
  initialCourseId?: string;
  initialData?: CourseEditorData;
}

const STEPS = [
  { num: "1", label: "Informações" },
  { num: "2", label: "Conteúdo" },
  { num: "3", label: "Configurações" },
  { num: "4", label: "Revisão" },
];

const CATEGORIES = ["Segurança", "Técnico", "Compliance", "Comportamental", "Liderança", "Outro"];

const LEVEL_UI_TO_API: Record<CourseLevel, string> = {
  basico: "BEGINNER",
  inter: "INTERMEDIATE",
  avanc: "ADVANCED",
};

const LEVEL_API_TO_UI: Record<string, CourseLevel> = {
  BEGINNER: "basico",
  INTERMEDIATE: "inter",
  ADVANCED: "avanc",
};

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

function SortableModule({ module, onAddLesson, onDeleteLesson, onDeleteModule }: {
  module: ModuleItem;
  onAddLesson: (moduleId: string) => void;
  onDeleteLesson: (moduleId: string, lessonId: string) => void;
  onDeleteModule: (moduleId: string) => void;
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
        <span style={{ flex: 1, fontSize: 15, fontWeight: 800, color: "#16100f", minWidth: 0 }}>{module.title}</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#a89e9c", flexShrink: 0 }}>{module.lessons.length} aulas</span>
        <button onClick={() => onDeleteModule(module.id)} type="button" style={{ width: 30, height: 30, border: "none", background: "transparent", cursor: "pointer", color: "#a89e9c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Trash2 size={15} />
        </button>
      </div>
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {module.lessons.map((l) => (
          <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", border: "1px solid #f0e8e8", borderRadius: 10, background: "#fff" }}>
            <span style={{ cursor: "grab", color: "#cfc4c2", display: "flex", flexShrink: 0 }}><GripVertical size={14} /></span>
            <span style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: "#f6f1f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a807e" }}>
              <LessonIcon type={l.type} />
            </span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#3a3030", minWidth: 0 }}>{l.title}</span>
            <button onClick={() => onDeleteLesson(module.id, l.id)} type="button" style={{ width: 26, height: 26, border: "none", background: "transparent", cursor: "pointer", color: "#c98a8a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
        <button onClick={() => onAddLesson(module.id)} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: PRIMARY, background: "#fff", border: "1.5px dashed #e2d2d2", borderRadius: 10, padding: "11px 14px", cursor: "pointer", alignSelf: "flex-start" }}>
          <Plus size={15} /> Adicionar aula
        </button>
      </div>
    </div>
  );
}

export function CourseWizard({ initialCourseId, initialData }: CourseWizardProps) {
  const router = useRouter();
  const uid = useId();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Track which local IDs already exist on the server
  const [savedCourseId, setSavedCourseId] = useState<string | null>(initialCourseId ?? null);
  const [moduleApiIds] = useState<Record<string, string>>(() => {
    if (initialData) return Object.fromEntries(initialData.modules.map((m) => [m.id, m.id]));
    return {};
  });
  const [lessonApiIds] = useState<Record<string, string>>(() => {
    if (initialData) return Object.fromEntries(
      initialData.modules.flatMap((m) => m.lessons.map((l) => [l.id, l.id]))
    );
    return {};
  });
  const moduleApiIdsRef = { current: moduleApiIds };
  const lessonApiIdsRef = { current: lessonApiIds };

  // Form state — pre-fill from initialData if editing
  const course = initialData?.course;
  const [courseTitle, setCourseTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [category, setCategory] = useState(course?.category ?? "Segurança");
  const [level, setLevel] = useState<CourseLevel>(
    course?.level ? (LEVEL_API_TO_UI[course.level] ?? "inter") : "inter"
  );
  const [objectives, setObjectives] = useState<string[]>(
    course?.objectives && course.objectives.length > 0
      ? course.objectives
      : ["Objetivo de aprendizado 1"]
  );
  const [download, setDownload] = useState(course?.allowDownload ?? true);
  const [cert, setCert] = useState(course?.issueCertificate ?? true);
  const [minScore, setMinScore] = useState(
    course?.minPassingScore ? String(course.minPassingScore / 10) : "7"
  );
  const [visibility, setVisibility] = useState<Visibility>(
    course?.isRestricted ? "restrito" : "publico"
  );

  // Modules state
  const [modules, setModules] = useState<ModuleItem[]>(() => {
    if (initialData?.modules && initialData.modules.length > 0) {
      return initialData.modules.map((m) => ({
        id: m.id,
        title: m.title,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          type: (l.type?.toLowerCase() === "video" ? "video" : l.type?.toLowerCase() === "quiz" ? "quiz" : "file") as "video" | "quiz" | "file",
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
    setModules((prev) => [...prev, { id: `m${Date.now()}`, title: "Novo módulo", lessons: [] }]);
  }
  function addLesson(moduleId: string) {
    setModules((prev) => prev.map((m) =>
      m.id !== moduleId ? m : { ...m, lessons: [...m.lessons, { id: `l${Date.now()}`, title: "Nova aula", type: "video" as const }] }
    ));
  }
  function deleteLesson(moduleId: string, lessonId: string) {
    setModules((prev) => prev.map((m) => m.id !== moduleId ? m : { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }));
  }
  function deleteModule(moduleId: string) {
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
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
        teacherId: user.id,
        allowDownload: download,
        issueCertificate: cert,
        minPassingScore: Math.round(parseFloat(minScore || "7") * 10),
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

      // Create new modules/lessons (only if not already on server)
      const localModuleIds = { ...moduleApiIdsRef.current };
      const localLessonIds = { ...lessonApiIdsRef.current };

      for (let i = 0; i < modules.length; i++) {
        const m = modules[i];
        let mApiId = localModuleIds[m.id];
        if (!mApiId) {
          const modRes = await api.post<{ id: string }>(`/courses/${cId}/modules`, { title: m.title, order: i + 1 });
          mApiId = modRes.data.id;
          localModuleIds[m.id] = mApiId;
        }
        for (let j = 0; j < m.lessons.length; j++) {
          const l = m.lessons[j];
          if (!localLessonIds[l.id]) {
            const lessonType = l.type === "quiz" ? "QUIZ" : l.type === "file" ? "DOCUMENT" : "VIDEO";
            const lRes = await api.post<{ id: string }>(`/courses/${cId}/modules/${mApiId}/lessons`, {
              title: l.title, type: lessonType, order: j + 1,
            });
            localLessonIds[l.id] = lRes.data.id;
          }
        }
      }

      // Update refs in place so next save sees them
      Object.assign(moduleApiIdsRef.current, localModuleIds);
      Object.assign(lessonApiIdsRef.current, localLessonIds);

      if (publish) {
        await api.patch(`/courses/${cId}/status`, { status: "PUBLISHED" });
      }

      qc.invalidateQueries({ queryKey: ["courses-professor"] });
      qc.invalidateQueries({ queryKey: ["course-editor", cId] });

      if (publish) {
        router.push("/professor/cursos");
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
    <div style={{ minHeight: "100vh", background: "#f6f4f3", display: "flex", flexDirection: "column" }}>

      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "14px clamp(16px,3vw,32px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
          <button
            onClick={() => router.back()}
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
            <span style={{ fontSize: 13, fontWeight: 600, color: "#CC1F1F", maxWidth: 260, textAlign: "right" }}>
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
            Publicar
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
              </div>
            </div>
          )}

          {/* Step 2 — Content */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Conteúdo do curso</h2>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#8a807e", marginTop: 4 }}>Organize módulos e aulas. Arraste pelo punho para reordenar.</p>
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
                      <SortableModule key={m.id} module={m} onAddLesson={addLesson} onDeleteLesson={deleteLesson} onDeleteModule={deleteModule} />
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 0", borderBottom: "1px solid #f6f1f1" }}>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "#16100f" }}>Emitir certificado ao concluir</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#8a807e", marginTop: 2 }}>Certificado automático ao atingir 100%.</div>
                  </div>
                  <Toggle on={cert} onToggle={() => setCert((v) => !v)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: "20px 0" }}>
                  <div>
                    <label style={labelS}>Nota mínima no quiz (0-10)</label>
                    <input type="number" value={minScore} onChange={(e) => setMinScore(e.target.value)} min="0" max="10" step="0.5" style={{ ...inputS, maxWidth: 160 }} />
                  </div>
                  <div>
                    <label style={labelS}>Visibilidade</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setVisibility("publico")} type="button" style={segBtn(visibility === "publico")}>Público</button>
                      <button onClick={() => setVisibility("restrito")} type="button" style={segBtn(visibility === "restrito")}>Restrito</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Revisão e publicação</h2>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#8a807e", marginTop: 4 }}>Confira tudo antes de publicar para os alunos.</p>
              </div>
              {saveError && (
                <div style={{ background: "#fceeee", border: "1px solid #f6d6d6", borderRadius: 12, padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "#CC1F1F" }}>
                  {saveError}
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
                  <div><div style={{ fontSize: 12, fontWeight: 700, color: "#a89e9c", textTransform: "uppercase", letterSpacing: "0.03em" }}>Certificado</div><div style={{ fontSize: 20, fontWeight: 800, color: "#16100f", marginTop: 4 }}>{cert ? "Sim" : "Não"}</div></div>
                  <div><div style={{ fontSize: 12, fontWeight: 700, color: "#a89e9c", textTransform: "uppercase", letterSpacing: "0.03em" }}>Visibilidade</div><div style={{ fontSize: 20, fontWeight: 800, color: "#16100f", marginTop: 4 }}>{visibility === "publico" ? "Público" : "Restrito"}</div></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => saveCourse(false)} disabled={isSaving} style={{ fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#16100f", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: "13px 22px", cursor: "pointer" }}>
                  {isSaving ? "Salvando…" : "Salvar rascunho"}
                </button>
                <button onClick={() => saveCourse(true)} disabled={isSaving} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, color: "#fff", background: PRIMARY, border: "none", borderRadius: 11, padding: "13px 24px", cursor: "pointer", boxShadow: "0 10px 24px rgba(204,31,31,0.26)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  {isSaving ? "Publicando…" : "Publicar curso"}
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
  );
}
