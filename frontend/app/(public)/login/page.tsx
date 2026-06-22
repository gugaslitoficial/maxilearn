import type { Metadata } from "next";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login — MaxiLearn",
};

function LoginBottom() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#fff",
            lineHeight: 1,
          }}
        >
          +40
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.78)",
            marginTop: 4,
          }}
        >
          cursos ativos
        </div>
      </div>
      <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.25)" }} />
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#fff",
            lineHeight: 1,
          }}
        >
          98%
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.78)",
            marginTop: 4,
          }}
        >
          de conclusão
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[3fr_2fr] lg:items-stretch">
      <AuthBrandPanel
        tagline="O conhecimento que move a sua equipe."
        description="Acesse seus treinamentos, acompanhe seu progresso e conquiste novos certificados."
        bottom={<LoginBottom />}
      />
      <LoginForm />
    </div>
  );
}
