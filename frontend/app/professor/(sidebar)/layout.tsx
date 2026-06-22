import type { ReactNode } from "react";
import { ProfessorShell } from "@/components/professor/ProfessorShell";

export default function ProfessorSidebarLayout({ children }: { children: ReactNode }) {
  return <ProfessorShell>{children}</ProfessorShell>;
}
