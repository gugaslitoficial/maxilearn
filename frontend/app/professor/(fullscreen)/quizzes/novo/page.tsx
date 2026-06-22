"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PROFESSOR_COURSES } from "@/lib/mock-data";

// TODO: integrar com POST /professor/quizzes (rota: /professor/quizzes/novo)

const PRIMARY = "#CC1F1F";

type QuestionType = "multiple" | "truefalse";

interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  choices: Choice[];
  correctTrueFalse: boolean | null;
}

function makeId() { return Math.random().toString(36).slice(2); }

function makeQuestion(type: QuestionType = "multiple", order: number): Question {
  return {
    id: makeId(),
    type,
    text: "",
    correctTrueFalse: null,
    choices: type === "multiple"
      ? [
          { id: makeId(), text: `Alternativa A`, isCorrect: false },
          { id: makeId(), text: `Alternativa B`, isCorrect: false },
          { id: makeId(), text: `Alternativa C`, isCorrect: false },
          { id: makeId(), text: `Alternativa D`, isCorrect: false },
        ]
      : [],
  };
}

const INITIAL_QUESTIONS: Question[] = [
  {
    id: makeId(),
    type: "multiple",
    text: "Qual EPI é obrigatório em ambientes com risco de queda de altura?",
    correctTrueFalse: null,
    choices: [
      { id: makeId(), text: "Capacete de proteção", isCorrect: false },
      { id: makeId(), text: "Cinto de segurança tipo paraquedista", isCorrect: true },
      { id: makeId(), text: "Óculos de proteção", isCorrect: false },
      { id: makeId(), text: "Protetor auricular", isCorrect: false },
    ],
  },
  {
    id: makeId(),
    type: "truefalse",
    text: "O uso de EPIs substitui a necessidade de outras medidas de segurança no trabalho.",
    correctTrueFalse: false,
    choices: [],
  },
];

const inputS = {
  width: "100%",
  fontFamily: "inherit",
  fontSize: 14.5,
  fontWeight: 500,
  color: "#16100f",
  background: "#faf7f7",
  border: "1px solid #eadfdf",
  borderRadius: 10,
  padding: "12px 14px",
  outline: "none",
  boxSizing: "border-box" as const,
};

export default function NovoQuizPage() {
  const router = useRouter();
  const [quizName, setQuizName] = useState("Nova Avaliação");
  const [courseId, setCourseId] = useState("");
  const [minScore, setMinScore] = useState("70");
  const [maxAttempts, setMaxAttempts] = useState("2");
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);

  function addQuestion(type: QuestionType) {
    setQuestions((prev) => [...prev, makeQuestion(type, prev.length + 1)]);
  }

  function deleteQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestionText(id: string, text: string) {
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, text } : q));
  }

  function updateChoice(qId: string, cId: string, text: string) {
    setQuestions((prev) => prev.map((q) => {
      if (q.id !== qId) return q;
      return { ...q, choices: q.choices.map((c) => c.id === cId ? { ...c, text } : c) };
    }));
  }

  function setCorrectChoice(qId: string, cId: string) {
    setQuestions((prev) => prev.map((q) => {
      if (q.id !== qId) return q;
      return { ...q, choices: q.choices.map((c) => ({ ...c, isCorrect: c.id === cId })) };
    }));
  }

  function setCorrectTrueFalse(qId: string, val: boolean) {
    setQuestions((prev) => prev.map((q) => q.id === qId ? { ...q, correctTrueFalse: val } : q));
  }

  function toggleType(qId: string, type: QuestionType) {
    setQuestions((prev) => prev.map((q) => {
      if (q.id !== qId) return q;
      if (type === "multiple") {
        return { ...q, type, correctTrueFalse: null, choices: makeQuestion("multiple", 0).choices };
      }
      return { ...q, type, choices: [], correctTrueFalse: null };
    }));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f4f3", display: "flex", flexDirection: "column" }}>

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "14px clamp(16px,4vw,40px)", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 10 }}>
        <button
          onClick={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid #ece4e4", background: "#f6f4f3", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={18} color="#6a605e" />
        </button>
        <input
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          style={{ fontSize: 17, fontWeight: 800, color: "#16100f", border: "none", background: "transparent", outline: "none", flex: 1, fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "9px 16px", background: "#f6f4f3", border: "1px solid #ece4e4", borderRadius: 9, fontSize: 13.5, fontWeight: 700, color: "#6a605e", cursor: "pointer" }}>
            Rascunho
          </button>
          <button
            onClick={() => router.push("/professor/quizzes")}
            style={{ padding: "9px 18px", background: PRIMARY, border: "none", borderRadius: 9, fontSize: 13.5, fontWeight: 700, color: "#fff", cursor: "pointer" }}
          >
            Publicar
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: "clamp(16px,3vw,32px)", maxWidth: 900, margin: "0 auto", width: "100%" }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Questions — main */}
          <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {questions.map((q, idx) => (
              <div key={q.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0eaea", padding: "20px 22px" }}>
                {/* Question header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: "#fceeee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: PRIMARY, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    {/* Type toggle */}
                    <div style={{ display: "flex", gap: 0, background: "#f0eaea", borderRadius: 8, padding: 3 }}>
                      {(["multiple", "truefalse"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => toggleType(q.id, t)}
                          style={{
                            padding: "5px 12px", borderRadius: 6, border: "none",
                            fontSize: 12, fontWeight: 700,
                            background: q.type === t ? "#fff" : "transparent",
                            color: q.type === t ? "#16100f" : "#8a807e",
                            cursor: "pointer",
                            boxShadow: q.type === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                          }}
                        >
                          {t === "multiple" ? "Múltipla escolha" : "V / F"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #f6d6d6", background: "#fceeee", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                  >
                    <Trash2 size={14} color={PRIMARY} />
                  </button>
                </div>

                {/* Question text */}
                <textarea
                  value={q.text}
                  onChange={(e) => updateQuestionText(q.id, e.target.value)}
                  placeholder="Digite o enunciado da questão..."
                  rows={2}
                  style={{ ...inputS, resize: "vertical", marginBottom: 14 }}
                />

                {/* Multiple choice */}
                {q.type === "multiple" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {q.choices.map((c) => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                          onClick={() => setCorrectChoice(q.id, c.id)}
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            border: c.isCorrect ? `2px solid ${PRIMARY}` : "2px solid #d0c8c8",
                            background: c.isCorrect ? PRIMARY : "#fff",
                            cursor: "pointer",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {c.isCorrect && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                        </button>
                        <input
                          value={c.text}
                          onChange={(e) => updateChoice(q.id, c.id, e.target.value)}
                          style={{ ...inputS, flex: 1 }}
                          placeholder="Alternativa..."
                        />
                      </div>
                    ))}
                    <p style={{ fontSize: 11.5, fontWeight: 600, color: "#b3a6a6", marginTop: 4 }}>Clique no círculo para marcar a resposta correta</p>
                  </div>
                )}

                {/* True / False */}
                {q.type === "truefalse" && (
                  <div style={{ display: "flex", gap: 10 }}>
                    {([true, false] as const).map((val) => (
                      <button
                        key={String(val)}
                        onClick={() => setCorrectTrueFalse(q.id, val)}
                        style={{
                          flex: 1,
                          padding: "12px",
                          borderRadius: 10,
                          border: q.correctTrueFalse === val ? `2px solid ${PRIMARY}` : "1px solid #eadfdf",
                          background: q.correctTrueFalse === val ? "#fceeee" : "#faf7f7",
                          fontSize: 14,
                          fontWeight: 800,
                          color: q.correctTrueFalse === val ? PRIMARY : "#6a605e",
                          cursor: "pointer",
                        }}
                      >
                        {val ? "Verdadeiro" : "Falso"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Add question buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => addQuestion("multiple")}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 18px", border: `2px dashed #eadfdf`, borderRadius: 10, background: "transparent", fontSize: 13.5, fontWeight: 700, color: "#8a807e", cursor: "pointer" }}
              >
                <Plus size={15} /> Múltipla escolha
              </button>
              <button
                onClick={() => addQuestion("truefalse")}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 18px", border: `2px dashed #eadfdf`, borderRadius: 10, background: "transparent", fontSize: 13.5, fontWeight: 700, color: "#8a807e", cursor: "pointer" }}
              >
                <Plus size={15} /> Verdadeiro / Falso
              </button>
            </div>
          </div>

          {/* Right panel — settings */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0eaea", padding: "20px" }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800, color: "#16100f", marginBottom: 16, margin: "0 0 16px" }}>Configurações</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#3a3030", marginBottom: 7 }}>Curso</label>
                  <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={inputS}>
                    <option value="">Selecione...</option>
                    {PROFESSOR_COURSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#3a3030", marginBottom: 7 }}>Nota mínima (%)</label>
                  <input type="number" min={0} max={100} value={minScore} onChange={(e) => setMinScore(e.target.value)} style={inputS} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#3a3030", marginBottom: 7 }}>Tentativas</label>
                  <input type="number" min={1} value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} style={inputS} />
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0eaea", padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#6a605e" }}>Total de questões</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#16100f" }}>{questions.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#6a605e" }}>Múltipla escolha</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#16100f" }}>{questions.filter((q) => q.type === "multiple").length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#6a605e" }}>Verdadeiro/Falso</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#16100f" }}>{questions.filter((q) => q.type === "truefalse").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
