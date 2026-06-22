import type { ReactNode } from "react";
import { AlunoShell } from "@/components/aluno/AlunoShell";

export default function AlunoSidebarLayout({ children }: { children: ReactNode }) {
  return <AlunoShell>{children}</AlunoShell>;
}
