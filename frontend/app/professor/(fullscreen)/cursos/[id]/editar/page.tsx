"use client";

// Reuses the same 4-step wizard as CriarCursoPage but pre-filled with existing course data
// TODO: integrar com GET /professor/courses/:id e PUT /professor/courses/:id (rota: /professor/cursos/[id]/editar)

import { useParams } from "next/navigation";
import CriarCursoPage from "@/app/professor/(fullscreen)/cursos/novo/page";

export default function EditarCursoPage() {
  // In the real implementation, this would fetch existing course data and pass it to the wizard
  const params = useParams();
  void params; // courseId available as params.id

  return <CriarCursoPage />;
}
