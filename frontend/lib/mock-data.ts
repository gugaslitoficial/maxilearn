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
