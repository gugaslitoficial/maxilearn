import { FeatureCard } from "./FeatureCard";

const features = [
  {
    title: "Gestão de usuários por nível de acesso",
    description:
      "Defina administradores, gestores e alunos com permissões granulares para cada equipe ou departamento.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#CC1F1F"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Upload de vídeo e materiais",
    description:
      "Hospede vídeos, PDFs, apresentações e links em uma biblioteca organizada por trilhas de aprendizagem.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#CC1F1F"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m22 8-6 4 6 4V8Z" />
        <rect x="2" y="6" width="14" height="12" rx="2" />
      </svg>
    ),
  },
  {
    title: "Quizzes e avaliações",
    description:
      "Crie provas e questionários com correção automática e nota mínima para liberar a próxima etapa.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#CC1F1F"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: "Progresso e relatórios em tempo real",
    description:
      "Acompanhe conclusão, engajamento e desempenho por aluno, turma ou curso em dashboards ao vivo.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#CC1F1F"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    title: "Identidade visual personalizável por empresa",
    description:
      "Aplique logo, cores e domínio próprio. Cada cliente tem uma plataforma com a cara da sua marca.",
    highlighted: true,
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="13.5" cy="6.5" r=".5" fill="#fff" />
        <circle cx="17.5" cy="10.5" r=".5" fill="#fff" />
        <circle cx="8.5" cy="7.5" r=".5" fill="#fff" />
        <circle cx="6.5" cy="12.5" r=".5" fill="#fff" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
      </svg>
    ),
  },
  {
    title: "Certificados automáticos",
    description:
      "Emita certificados personalizados automaticamente ao concluir cada curso, com validação e download.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#CC1F1F"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section
      id="funcionalidades"
      className="bg-white flex flex-col justify-start py-12 md:py-16 px-5 md:px-10 lg:px-16 scroll-mt-16"
    >
      <div className="max-w-[1240px] mx-auto w-full">
        {/* Heading */}
        <div className="max-w-[760px] mx-auto mb-10 md:mb-14 text-center">
          <h2
            className="text-[28px] sm:text-[32px] md:text-[36px] leading-[1.12] font-extrabold tracking-[-0.03em] text-[#16100f] text-balance"
          >
            Tudo que sua empresa precisa para treinar com{" "}
            <span style={{ color: "#CC1F1F" }}>excelência</span>
          </h2>
          <p
            className="text-[15px] md:text-[16px] leading-[1.55] font-medium text-[#5a5050] mt-5 max-w-[540px] mx-auto text-pretty"
          >
            Uma plataforma completa para gerenciar pessoas, conteúdo e
            resultados — do onboarding ao certificado.
          </p>
        </div>

        {/* Mobile: horizontal snap carousel with peek effect */}
        <div
          className="sm:hidden overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 pb-4"
          style={{ paddingLeft: 20, scrollPaddingLeft: 20 }}
        >
          <div className="flex gap-4" style={{ paddingRight: 20 }}>
            {features.map(({ title, description, icon, highlighted }) => (
              <div key={title} className="snap-start shrink-0 w-[80vw] flex flex-col">
                <FeatureCard
                  title={title}
                  description={description}
                  icon={icon}
                  highlighted={highlighted}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tablet/Desktop: grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {features.map(({ title, description, icon, highlighted }) => (
            <FeatureCard
              key={title}
              title={title}
              description={description}
              icon={icon}
              highlighted={highlighted}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
