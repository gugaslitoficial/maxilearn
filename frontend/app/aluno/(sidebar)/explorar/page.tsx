"use client";

import { useState } from "react";
import Link from "next/link";
import { useCatalog, useRequestEnrollment } from "@/hooks/use-catalog";
import { LEVEL_LABEL } from "@/lib/utils";
import type { ApiCourseLevel } from "@/lib/utils";
import type { CatalogCourse, CatalogEnrollStatus } from "@/hooks/use-catalog";
import { Toast } from "@/components/ui/Toast";

const PRIMARY = "#CC1F1F";

const LEVEL_STYLES: Record<string, { color: string; bg: string }> = {
  BASIC:        { color: "#1f8a5b", bg: "#e8f5ee" },
  BEGINNER:     { color: "#1f8a5b", bg: "#e8f5ee" },
  INTERMEDIATE: { color: "#b9842f", bg: "#fdf3e2" },
  ADVANCED:     { color: "#CC1F1F", bg: "#fceeee" },
};

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ height: 140, background: "linear-gradient(90deg,#f0eaea 25%,#e8e0e0 50%,#f0eaea 75%)", backgroundSize: "200% 100%", animation: "ml-shimmer 1.4s infinite" }} />
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 18, background: "#f0eaea", borderRadius: 6, animation: "ml-shimmer 1.4s infinite", backgroundSize: "200% 100%" }} />
        <div style={{ height: 14, width: "60%", background: "#f0eaea", borderRadius: 6, animation: "ml-shimmer 1.4s infinite", backgroundSize: "200% 100%" }} />
        <div style={{ height: 40, background: "#f0eaea", borderRadius: 10, marginTop: 8, animation: "ml-shimmer 1.4s infinite", backgroundSize: "200% 100%" }} />
      </div>
    </div>
  );
}

function EnrollButton({ course, onRequest }: { course: CatalogCourse; onRequest: (id: string) => void }) {
  const status: CatalogEnrollStatus = course.enrollmentStatus;
  if (status === "ACTIVE") {
    return (
      <Link
        href={`/aluno/curso/${course.id}`}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", fontSize: 14, fontWeight: 800, color: "#fff", textDecoration: "none", background: "#1f8a5b", borderRadius: 11, padding: 12, boxShadow: "0 6px 16px rgba(31,138,91,0.24)" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        Acessar
      </Link>
    );
  }
  if (status === "PENDING") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", fontSize: 13.5, fontWeight: 700, color: "#b9842f", background: "#fdf3e2", border: "1.5px solid #f3e1bf", borderRadius: 11, padding: 12 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
        Aguardando aprovação
      </div>
    );
  }
  if (status === "REVOKED") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", fontSize: 13.5, fontWeight: 700, color: "#8a807e", background: "#f1ecec", border: "1.5px solid #e0d6d6", borderRadius: 11, padding: 12 }}>
        Acesso revogado
      </div>
    );
  }
  return (
    <button
      onClick={() => onRequest(course.id)}
      type="button"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", fontSize: 14, fontWeight: 700, color: "#8a807e", background: "#f1ecec", border: "1.5px solid #e0d6d6", borderRadius: 11, padding: 12, cursor: "pointer", fontFamily: "inherit" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
      Solicitar acesso
    </button>
  );
}

function CourseCard({ c, onRequest }: { c: CatalogCourse; onRequest: (id: string) => void }) {
  const lv = LEVEL_STYLES[c.level ?? ""] ?? { color: "#8a807e", bg: "#f1ecec" };
  const levelLabel = c.level ? (LEVEL_LABEL[c.level as ApiCourseLevel] ?? c.level) : null;

  return (
    <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", height: 140, background: c.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 36, fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>{c.tag}</span>
        {c.category && (
          <span style={{ position: "absolute", top: 12, left: 12, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", color: "#fff", background: "rgba(0,0,0,0.24)", padding: "4px 10px", borderRadius: 100 }}>
            {c.category}
          </span>
        )}
      </div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", color: "#16100f", lineHeight: 1.3 }}>{c.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: c.teacherColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>
            {c.teacherInitials}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#6a605e" }}>{c.teacher.name}</span>
        </div>
        {levelLabel && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 13, paddingTop: 13, borderTop: "1px solid #f4eded" }}>
            <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11.5, fontWeight: 800, color: lv.color, background: lv.bg, padding: "3px 10px", borderRadius: 100 }}>
              {levelLabel}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#8a807e" }}>{c._count.enrollments} aluno{c._count.enrollments !== 1 ? "s" : ""}</span>
          </div>
        )}
        <div style={{ marginTop: 18 }}>
          <EnrollButton course={c} onRequest={onRequest} />
        </div>
      </div>
    </div>
  );
}

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

export default function ExplorarPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [enrollStatus, setEnrollStatus] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const catalog = useCatalog({ search, category, level, enrollStatus });
  const requestEnrollment = useRequestEnrollment();

  async function handleRequest(courseId: string) {
    try {
      await requestEnrollment.mutateAsync(courseId);
      setToast("Solicitação enviada! Aguardando aprovação.");
    } catch {
      setToast("Erro ao solicitar acesso. Tente novamente.");
    }
  }

  const courses = catalog.data ?? [];

  return (
    <>
      <style>{`@keyframes ml-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      <header style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "22px clamp(20px,3vw,36px)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#16100f" }}>Explorar cursos</h1>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#8a807e", marginTop: 3 }}>Descubra novos treinamentos e continue evoluindo.</p>
      </header>

      <div style={{ flex: 1, padding: "clamp(20px,3vw,32px)", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Filters */}
        <div style={{ background: "#fff", border: "1px solid #ece4e4", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 9, background: "#f6f1f1", border: "1px solid #ece4e4", borderRadius: 10, padding: "10px 13px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a89e9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
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
              <option value="BASIC">Básico</option>
              <option value="INTERMEDIATE">Intermediário</option>
              <option value="ADVANCED">Avançado</option>
            </select>
            <select value={enrollStatus} onChange={(e) => setEnrollStatus(e.target.value)} style={selectStyle}>
              <option value="">Meu status</option>
              <option value="ACTIVE">Em andamento</option>
              <option value="NONE">Não iniciado</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {catalog.isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#8a807e", fontSize: 15, fontWeight: 600 }}>
            Nenhum curso encontrado para os filtros selecionados.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
            {courses.map((c) => <CourseCard key={c.id} c={c} onRequest={handleRequest} />)}
          </div>
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
