// ─── Aluno / Estudante mock data ─────────────────────────────────────────────

export type StudentEnrollStatus = "new" | "progress" | "done" | "locked";

export interface StudentCourse {
  id: string;
  tag: string;
  title: string;
  category: string;
  teacher: string;
  teacherInitials: string;
  teacherColor: string;
  duration: string;
  level: "Básico" | "Intermediário" | "Avançado";
  gradient: string;
  status: StudentEnrollStatus;
  progress: number; // 0-100
  totalLessons: number;
  currentLesson: number;
}

export interface StudentLesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "doc";
  status: "done" | "current" | "locked";
}

export interface StudentModule {
  id: string;
  title: string;
  meta: string;
  badge: "done" | "progress" | "locked";
  lessons: StudentLesson[];
}

export interface StudentActivity {
  type: "quiz" | "lesson";
  title: string;
  course: string;
  tag: string;
  tagKind: "urgent" | "new" | "neutral";
}

export interface StudentAchievement {
  key: string;
  title: string;
  sub: string;
  unlocked: boolean;
  color: string;
  bg: string;
}

export interface StudentQuizQuestion {
  id: string;
  statement: string;
  options: string[];
  correct: number;
}

export const STUDENT_CATALOG: StudentCourse[] = [
  { id: "1", tag: "ST", title: "Segurança no Trabalho", category: "Segurança", teacher: "Ricardo Paz", teacherInitials: "RP", teacherColor: "#3a6ea5", duration: "6h", level: "Básico", gradient: "linear-gradient(135deg,#CC1F1F,#e85a4f)", status: "progress", progress: 78, totalLessons: 12, currentLesson: 8 },
  { id: "3", tag: "AC", title: "Atendimento ao Cliente", category: "Comportamental", teacher: "Bruno Alves", teacherInitials: "BA", teacherColor: "#2f9b8e", duration: "4h", level: "Básico", gradient: "linear-gradient(135deg,#1f8a5b,#43b787)", status: "progress", progress: 44, totalLessons: 9, currentLesson: 4 },
  { id: "2", tag: "LI", title: "Lubrificação Industrial", category: "Técnico", teacher: "Helena Dias", teacherInitials: "HD", teacherColor: "#b9842f", duration: "9h", level: "Avançado", gradient: "linear-gradient(135deg,#3a6ea5,#5b9bd5)", status: "progress", progress: 12, totalLessons: 18, currentLesson: 2 },
  { id: "5", tag: "LG", title: "LGPD na Prática", category: "Compliance", teacher: "Sofia Nunes", teacherInitials: "SN", teacherColor: "#9b2f7a", duration: "3h", level: "Intermediário", gradient: "linear-gradient(135deg,#7a4fb9,#a06fe0)", status: "done", progress: 100, totalLessons: 7, currentLesson: 7 },
  { id: "4", tag: "LT", title: "Liderança de Times", category: "Comportamental", teacher: "Helena Dias", teacherInitials: "HD", teacherColor: "#b9842f", duration: "7h", level: "Intermediário", gradient: "linear-gradient(135deg,#b9842f,#e0a94d)", status: "locked", progress: 0, totalLessons: 14, currentLesson: 0 },
  { id: "6", tag: "GM", title: "Gestão de Manutenção", category: "Técnico", teacher: "Ricardo Paz", teacherInitials: "RP", teacherColor: "#3a6ea5", duration: "8h", level: "Avançado", gradient: "linear-gradient(135deg,#6a605e,#9a8f8c)", status: "locked", progress: 0, totalLessons: 11, currentLesson: 0 },
];

export const STUDENT_COMPLETED_COURSES = [
  { id: "lg", tag: "LG", title: "LGPD na Prática", grade: "9,2", gradient: "linear-gradient(135deg,#7a4fb9,#a06fe0)" },
  { id: "co", tag: "CO", title: "Comunicação Eficaz", grade: "8,7", gradient: "linear-gradient(135deg,#b9842f,#e0a94d)" },
  { id: "et", tag: "ET", title: "Ética no Trabalho", grade: "9,5", gradient: "linear-gradient(135deg,#2f9b8e,#52c0b2)" },
];

export const STUDENT_ACTIVITIES: StudentActivity[] = [
  { type: "quiz", title: "Quiz — Avaliação final", course: "Segurança no Trabalho", tag: "Prazo: amanhã", tagKind: "urgent" },
  { type: "lesson", title: "Nova aula liberada — EPIs", course: "Segurança no Trabalho", tag: "Liberada hoje", tagKind: "new" },
  { type: "quiz", title: "Quiz — Módulo 1", course: "Atendimento ao Cliente", tag: "Prazo: em 3 dias", tagKind: "neutral" },
  { type: "lesson", title: "Nova aula — Viscosidade", course: "Lubrificação Industrial", tag: "Liberada ontem", tagKind: "new" },
];

export const STUDENT_MODULES: StudentModule[] = [
  {
    id: "m1",
    title: "Módulo 1 — Fundamentos",
    meta: "4 aulas · 1h20 · concluído",
    badge: "done",
    lessons: [
      { id: "l1", title: "Introdução à segurança do trabalho", duration: "12 min", type: "video", status: "done" },
      { id: "l2", title: "Tipos de riscos ocupacionais", duration: "18 min", type: "video", status: "done" },
      { id: "l3", title: "Material de apoio — NRs", duration: "5 páginas", type: "doc", status: "done" },
      { id: "l4", title: "Quiz — Fundamentos", duration: "10 min", type: "doc", status: "done" },
    ],
  },
  {
    id: "m2",
    title: "Módulo 2 — EPIs e Prevenção",
    meta: "5 aulas · 2h10 · em andamento",
    badge: "progress",
    lessons: [
      { id: "l5", title: "Equipamentos de proteção individual", duration: "22 min", type: "video", status: "done" },
      { id: "l6", title: "Proteção coletiva vs. individual", duration: "16 min", type: "video", status: "done" },
      { id: "l7", title: "EPIs por tipo de atividade", duration: "20 min", type: "video", status: "current" },
      { id: "l8", title: "Manutenção e validade dos EPIs", duration: "14 min", type: "video", status: "locked" },
      { id: "l9", title: "Quiz — EPIs", duration: "10 min", type: "doc", status: "locked" },
    ],
  },
  {
    id: "m3",
    title: "Módulo 3 — Normas e Emergências",
    meta: "3 aulas · 1h30 · bloqueado",
    badge: "locked",
    lessons: [
      { id: "l10", title: "Normas regulamentadoras essenciais", duration: "24 min", type: "video", status: "locked" },
      { id: "l11", title: "Procedimentos de emergência", duration: "28 min", type: "video", status: "locked" },
      { id: "l12", title: "Avaliação final", duration: "15 min", type: "doc", status: "locked" },
    ],
  },
];

export const STUDENT_WEEKLY_HOURS = [
  { week: "Sem 1", hours: 4 },
  { week: "Sem 2", hours: 6 },
  { week: "Sem 3", hours: 5 },
  { week: "Sem 4", hours: 8 },
];

export const STUDENT_ACHIEVEMENTS: StudentAchievement[] = [
  { key: "first-lesson", title: "Primeira aula", sub: "Concluída", unlocked: true, color: "#1f8a5b", bg: "#e8f5ee" },
  { key: "first-cert", title: "Primeiro certificado", sub: "Conquistado", unlocked: true, color: "#7a4fb9", bg: "#f1ebf8" },
  { key: "10h", title: "10 horas estudadas", sub: "Alcançado", unlocked: true, color: "#b9842f", bg: "#fdf3e2" },
  { key: "7days", title: "Sequência de 7 dias", sub: "Em chamas!", unlocked: true, color: "#CC1F1F", bg: "#fceeee" },
  { key: "5courses", title: "5 cursos concluídos", sub: "Faltam 2", unlocked: false, color: "#b3a6a6", bg: "#f1ecec" },
  { key: "top-grade", title: "Nota máxima", sub: "Bloqueado", unlocked: false, color: "#b3a6a6", bg: "#f1ecec" },
];

export const STUDENT_QUIZ_QUESTIONS: StudentQuizQuestion[] = [
  {
    id: "q1",
    statement: "Qual equipamento de proteção individual é obrigatório para atividades de trabalho em altura?",
    options: ["Cinto de segurança tipo paraquedista", "Apenas capacete de proteção", "Luvas de raspa de couro", "Protetor auricular tipo concha"],
    correct: 0,
  },
  {
    id: "q2",
    statement: "O uso de EPI dispensa a necessidade de proteção coletiva no local de trabalho?",
    options: ["Verdadeiro, o EPI substitui completamente a proteção coletiva", "Falso, EPI e proteção coletiva são complementares", "Verdadeiro, desde que o EPI tenha CA válido", "Falso, apenas em ambientes de alto risco"],
    correct: 1,
  },
  {
    id: "q3",
    statement: "Com que frequência deve-se verificar a validade do CA (Certificado de Aprovação) de um EPI?",
    options: ["Anualmente", "Antes de cada uso", "Mensalmente", "Apenas na compra"],
    correct: 1,
  },
  {
    id: "q4",
    statement: "Qual norma regulamentadora trata especificamente de Equipamentos de Proteção Individual no Brasil?",
    options: ["NR-6", "NR-12", "NR-35", "NR-18"],
    correct: 0,
  },
  {
    id: "q5",
    statement: "Em caso de acidente com risco de vida no ambiente de trabalho, a primeira ação correta é:",
    options: ["Registrar o ocorrido no BO", "Acionar SESMT e/ou Bombeiros imediatamente", "Continuar o trabalho até o fim do turno", "Avisar apenas o supervisor imediato"],
    correct: 1,
  },
  {
    id: "q6",
    statement: "O que significa a sigla CA no contexto de EPIs?",
    options: ["Controle de Acidente", "Certificado de Aprovação", "Carta de Autorização", "Conformidade Assegurada"],
    correct: 1,
  },
  {
    id: "q7",
    statement: "Qual EPI é indicado para proteção auditiva em ambientes com ruído acima de 85 dB?",
    options: ["Capacete de segurança", "Óculos de proteção", "Protetor auricular", "Luvas de borracha"],
    correct: 2,
  },
  {
    id: "q8",
    statement: "Quem é responsável por fornecer os EPIs aos trabalhadores, segundo a NR-6?",
    options: ["O próprio trabalhador", "O sindicato da categoria", "O empregador", "O SESMT"],
    correct: 2,
  },
  {
    id: "q9",
    statement: "Qual das alternativas NÃO é uma função do SESMT (Serviço Especializado em Eng. de Segurança)?",
    options: ["Realizar auditorias financeiras", "Aplicar treinamentos de segurança", "Investigar acidentes de trabalho", "Recomendar uso de EPIs"],
    correct: 0,
  },
  {
    id: "q10",
    statement: "A CIPA (Comissão Interna de Prevenção de Acidentes) é regulamentada por qual NR?",
    options: ["NR-4", "NR-5", "NR-6", "NR-7"],
    correct: 1,
  },
];

// ─── NOTIFICAÇÕES ────────────────────────────────────────────────────────────

export type NotifType = "aluno" | "aula" | "quiz" | "cert" | "curso" | "plano";

export interface MockNotification {
  id: number;
  group: "Hoje" | "Ontem" | "Esta semana";
  type: NotifType;
  text: string;
  time: string;
  readDefault?: boolean;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: 1, group: "Hoje",       type: "aluno", text: 'Marina Teixeira inscreveu-se em "Segurança no Trabalho"', time: "há 12 min" },
  { id: 2, group: "Hoje",       type: "quiz",  text: 'João Souza respondeu o quiz "EPIs" — nota 8,0',           time: "há 40 min" },
  { id: 3, group: "Hoje",       type: "aula",  text: 'Ana Lima concluiu a aula "Proteção coletiva"',            time: "há 1 h" },
  { id: 4, group: "Ontem",      type: "cert",  text: 'Certificado emitido para Pedro Esteves em "LGPD na Prática"', time: "ontem, 16:20" },
  { id: 5, group: "Ontem",      type: "curso", text: 'Novo curso disponível: "Brigada de Incêndio"',            time: "ontem, 09:05" },
  { id: 6, group: "Esta semana",type: "plano", text: "Seu plano Profissional vence em 5 dias",                  time: "seg, 08:00" },
  { id: 7, group: "Esta semana",type: "aluno", text: 'Bruno Alves inscreveu-se em "Atendimento ao Cliente"',   time: "dom, 14:30", readDefault: true },
  { id: 8, group: "Esta semana",type: "aula",  text: 'Sofia Nunes concluiu o módulo "Fundamentos"',            time: "sáb, 11:10", readDefault: true },
];
