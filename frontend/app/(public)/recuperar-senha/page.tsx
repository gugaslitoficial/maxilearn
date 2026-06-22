import type { Metadata } from "next";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { RecuperarSenhaForm } from "@/components/auth/RecuperarSenhaForm";

export const metadata: Metadata = {
  title: "Recuperar senha — MaxiLearn",
};

function RecoverBottom() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "rgba(255,255,255,0.82)",
      }}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <span style={{ fontSize: 13.5, fontWeight: 600 }}>
        Conexão segura e criptografada
      </span>
    </div>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[3fr_2fr] lg:items-stretch">
      <AuthBrandPanel
        tagline="Recupere seu acesso em segundos."
        description="Enviaremos um link seguro para você criar uma nova senha e voltar aos seus treinamentos."
        bottom={<RecoverBottom />}
      />
      <RecuperarSenhaForm />
    </div>
  );
}
