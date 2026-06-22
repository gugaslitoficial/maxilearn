"use client";

import Link from "next/link";
import { Plus, BookOpen, Users, Edit2 } from "lucide-react";
import { PROFESSOR_COURSES } from "@/lib/mock-data";

// TODO: integrar com GET /professor/courses (rota: /professor/cursos)

const STATUS_STYLE = {
  Publicado: { color: "#1f8a5b", bg: "#e8f7ef" },
  Rascunho: { color: "#b9842f", bg: "#fdf3e2" },
  Arquivado: { color: "#8a807e", bg: "#f2edec" },
} as const;

export default function ProfessorCursosPage() {
  return (
    <div style={{ padding: "clamp(16px,3vw,32px)", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f", margin: 0 }}>Meus Cursos</h1>
          <p style={{ fontSize: 14, fontWeight: 500, color: "#6a605e", marginTop: 4 }}>{PROFESSOR_COURSES.length} cursos no total</p>
        </div>
        <Link
          href="/professor/cursos/novo"
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
            background: "#CC1F1F", color: "#fff", borderRadius: 10,
            fontSize: 14, fontWeight: 700, textDecoration: "none",
            boxShadow: "0 6px 18px rgba(204,31,31,0.22)",
          }}
        >
          <Plus size={16} /> Novo Curso
        </Link>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROFESSOR_COURSES.map((c) => {
          const st = STATUS_STYLE[c.status];
          return (
            <div key={c.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0eaea", overflow: "hidden" }}>
              {/* Top color strip */}
              <div style={{ height: 6, background: c.color }} />
              <div style={{ padding: "18px 18px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                      {c.tag}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#16100f", lineHeight: 1.3 }}>{c.name}</div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#8a807e" }}>{c.category} · {c.level}</div>
                    </div>
                  </div>
                  <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, padding: "3px 9px", borderRadius: 100 }}>
                    {c.status}
                  </span>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Users size={13} color="#8a807e" />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6a605e" }}>{c.students} alunos</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <BookOpen size={13} color="#8a807e" />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6a605e" }}>{c.lessons} aulas</span>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#8a807e" }}>Conclusão média</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#16100f" }}>{c.progress}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 100, background: "#f0eaea", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 100, background: c.color, width: `${c.progress}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href={`/professor/cursos/${c.id}/editar`}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "9px", background: "#f6f4f3", borderRadius: 9,
                      fontSize: 13, fontWeight: 700, color: "#3a3030", textDecoration: "none",
                      border: "1px solid #ece4e4",
                    }}
                  >
                    <Edit2 size={14} /> Editar
                  </Link>
                  <Link
                    href={`/professor/cursos/${c.id}/aulas/1`}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "9px", background: "#fceeee", borderRadius: 9,
                      fontSize: 13, fontWeight: 700, color: "#CC1F1F", textDecoration: "none",
                      border: "1px solid #f6d6d6",
                    }}
                  >
                    <Plus size={14} /> Aula
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
