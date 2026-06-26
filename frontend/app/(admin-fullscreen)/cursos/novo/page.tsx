"use client";

import { CourseWizard } from "@/components/professor/CourseWizard";

export default function AdminCriarCursoPage() {
  return <CourseWizard backHref="/cursos" showTeacherPicker />;
}
