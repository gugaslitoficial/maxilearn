"use client";

import { useParams } from "next/navigation";
import { CourseWizard } from "@/components/professor/CourseWizard";
import { useCourseEditor } from "@/hooks/use-course-editor";

function Sk({ h, w, r = 8 }: { h: number; w?: number | string; r?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ width: w ?? "100%", height: h, borderRadius: r, background: "#f1ece9" }}
    />
  );
}

export default function EditarCursoPage() {
  const params = useParams();
  const courseId = params.id as string;

  const { data, isLoading, isError } = useCourseEditor(courseId);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f4f3" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #ece4e4", padding: "14px 32px", display: "flex", alignItems: "center", gap: 16 }}>
          <Sk h={36} w={80} r={10} />
          <Sk h={36} w={200} r={10} />
        </div>
        <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 32px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Sk h={28} w={260} />
          <Sk h={200} r={16} />
          <Sk h={120} r={16} />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f4f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#CC1F1F" }}>Não foi possível carregar o curso.</div>
          <a href="/professor/cursos" style={{ display: "inline-block", marginTop: 16, fontSize: 14, fontWeight: 700, color: "#CC1F1F" }}>← Voltar para cursos</a>
        </div>
      </div>
    );
  }

  return <CourseWizard initialCourseId={courseId} initialData={data} />;
}
