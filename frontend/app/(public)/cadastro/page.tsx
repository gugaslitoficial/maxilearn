import type { Metadata } from "next";
import { CadastroFlow } from "@/components/auth/CadastroFlow";

export const metadata: Metadata = {
  title: "Criar conta — MaxiLearn",
};

export default function CadastroPage() {
  return <CadastroFlow />;
}
