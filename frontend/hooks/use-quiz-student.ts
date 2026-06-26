import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  statement: string;
  type: string;
  order: number;
  options: QuizOption[];
}

export interface StudentQuiz {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  minPassingScore: number;
  maxAttempts: number | null;
  shuffleQuestions: boolean;
  showAnswersAfter: boolean;
  questionCount: number;
  attemptCount: number;
  canAttempt: boolean;
  attemptsRemaining: number | null;
  questions: QuizQuestion[];
}

export interface AnswerInput {
  questionId: string;
  selectedOptionId: string;
}

export interface AnswerDetail {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  correctOptionText: string;
}

export interface SubmitResult {
  submissionId: string;
  score: number;
  passed: boolean;
  attemptNumber: number;
  attemptsRemaining: number | null;
  certificateIssued: boolean;
  answers?: AnswerDetail[];
}

export function useQuizStudent(quizId: string) {
  return useQuery({
    queryKey: ["quiz-student", quizId],
    queryFn: async () => {
      const { data } = await api.get<StudentQuiz>(`/quizzes/${quizId}`);
      return data;
    },
    staleTime: 10_000,
  });
}

export function useSubmitQuiz(quizId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: AnswerInput[]) =>
      api.post<SubmitResult>(`/quizzes/${quizId}/submit`, { answers }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quiz-student", quizId] });
      qc.invalidateQueries({ queryKey: ["student-overview"] });
      qc.invalidateQueries({ queryKey: ["student-certificates"] });
    },
  });
}
