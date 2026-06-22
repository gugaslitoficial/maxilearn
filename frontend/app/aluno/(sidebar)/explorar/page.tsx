"use client";

// TODO: integrar com GET /courses?studentId=:id (catálogo com status de matrícula)
import { useState } from "react";
import Link from "next/link";
import { STUDENT_CATALOG } from "@/lib/mock-data";
import type { StudentCourse } from "@/lib/mock-data";

const PRIMARY = "#CC1F1F";

const LEVEL_STYLES: Record<string, { color: string; bg: string }> = {
  "Básico": { color: "#1f8a5b", bg: "#e8f5ee" },
  "Intermediário": { color: "#b9842f", bg: "#fdf3e2" },
  "Avançado": { color: "#CC1F1F", bg: "#fceeee" },
};

function CourseCard({ c }: { c: StudentCourse }) {
  const lv = LEVEL_STYLES[c.level];

  const statusBadge = () => {
    if (c.status === "new") return { label: "Novo", color: "#fff", bg: PRIMARY };
    if (c.status === "progress") return { label: `${c.progress}%`, color: "#16100f", bg: "#fff" };
    if (c.status === "done") return { label: "Concluído", color: "#1f8a5b", bg: "#fff" };
    return { label: "Restrito", color: "#fff", bg: "rgba(0,0,0,0.4)" };
  };
  const badge = statusBadge();

  return (
    <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Thumbnail */}
      <div style={{ position: "relative", height: 140, background: c.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 36, fontWeight: 800, color: "rgba(255,255,255,0.92)", opacity: c.status === "locked" ? 0.5 : 1 }}>{c.tag}</span>
        <span style={{ position: "absolute", top: 12, left: 12, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", color: "#fff", background: "rgba(0,0,0,0.24)", padding: "4px 10px", borderRadius: 100 }}>
          {c.category}
        </span>
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            color: badge.color,
            background: badge.bg,
            padding: "4px 10px",
            borderRadius: 100,
            boxShadow: c.status !== "new" && c.status !== "locked" ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
            zIndex: 2,
            border: c.status === "locked" ? "1px solid rgba(255,255,255,0.3)" : "none",
          }}
        >
          {c.status === "done" && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          )}
          {badge.label}
        </span>
        {/* Lock overlay */}
        {c.status === "locked" && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(22,16,15,0.58)", backdropFilter: "blur(1px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", color: "#16100f", lineHeight: 1.3 }}>{c.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: c.teacherColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>
            {c.teacherInitials}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#6a605e" }}>{c.teacher}</span>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 13, paddingTop: 13, borderTop: "1px solid #f4eded" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#6a605e" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a89e9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {c.duration}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11.5, fontWeight: 800, color: lv.color, background: lv.bg, padding: "3px 10px", borderRadius: 100 }}>
            {c.level}
          </span>
        </div>

        {/* Progress bar (only in-progress) */}
        {c.status === "progress" && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6a605e" }}>Progresso</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1f8a5b" }}>{c.progress}%</span>
            </div>
            <div style={{ height: 7, background: "#eef1ef", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${c.progress}%`, background: "#1f8a5b", borderRadius: 4 }} />
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 18 }}>
          {c.status === "new" && (
            <Link href={`/aluno/curso/${c.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", background: PRIMARY, borderRadius: 11, padding: 12, boxShadow: "0 6px 16px rgba(204,31,31,0.24)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Acessar
            </Link>
          )}
          {c.status === "progress" && (
            <Link href={`/aluno/curso/${c.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", background: "#1f8a5b", borderRadius: 11, padding: 12, boxShadow: "0 6px 16px rgba(31,138,91,0.24)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Continuar
            </Link>
          )}
          {c.status === "done" && (
            <Link href={`/aluno/curso/${c.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", fontSize: 14, fontWeight: 700, color: "#16100f", textDecoration: "none", background: "#fff", border: "1.5px solid #e2d9d9", borderRadius: 11, padding: 12 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              Revisar curso
            </Link>
          )}
          {c.status === "locked" && (
            <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", fontSize: 14, fontWeight: 700, color: "#8a807e", background: "#f1ecec", border: "1.5px solid #e0d6d6", borderRadius: 11, padding: 12, cursor: "pointer", fontFamily: "inherit" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Solicitar acesso
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorarPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");

  const filtered = STUDENT_CATALOG.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.teacher.toLowerCase().includes(search.toLowerCase()) && !c.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && c.category !== category) return false;
    if (level && c.level !== level) return false;
    if (status) {
      if (status === "Não iniciado" && c.status !== "new") return false;
      if (status === "Em andamento" && c.status !== "progress") return false;
      if (status === "Concluído" && c.status !== "done") return false;
    }
    return true;
  });

  const selectStyle: React.CSSProperties = {
    fontFamily: "inherit",
    fontSize: 13.5,
    fontWeight: 600,
    color: "#3a3030",
    background: "#fff",
    border: "1.5px solid #e6dede",
    borderRadius: 10,
    padding: "10px 36px 10px 14px",
    cursor: "pointer",
    outline: "none",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' stroke='%238a807e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
  };

  return (
    <>
      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "22px clamp(20px,3vw,36px)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Explorar cursos</h1>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>Descubra novos treinamentos e continue evoluindo.</p>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Filters */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 9, background: "#f6f1f1", border: "1px solid #ece4e4", borderRadius: 10, padding: "10px 13px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a89e9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              placeholder="Buscar curso, professor ou tema..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 14, fontWeight: 500, color: "#16100f" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
              <option value="">Categoria</option>
              <option>Segurança</option>
              <option>Técnico</option>
              <option>Comportamental</option>
              <option>Compliance</option>
            </select>
            <select value={level} onChange={(e) => setLevel(e.target.value)} style={selectStyle}>
              <option value="">Nível</option>
              <option>Básico</option>
              <option>Intermediário</option>
              <option>Avançado</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
              <option value="">Meu status</option>
              <option>Não iniciado</option>
              <option>Em andamento</option>
              <option>Concluído</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#8a807e", fontSize: 15, fontWeight: 600 }}>
            Nenhum curso encontrado para os filtros selecionados.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
            {filtered.map((c) => <CourseCard key={c.id} c={c} />)}
          </div>
        )}
      </div>
    </>
  );
}
