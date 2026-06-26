import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface QuizPreviewOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizPreviewQuestion {
  id: string;
  statement: string;
  type: string;
  order: number;
  displayCount?: number;
  options: QuizPreviewOption[];
}

export interface QuizPreview {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  minPassingScore: number;
  maxAttempts: number | null;
  shuffleQuestions: boolean;
  showAnswersAfter: boolean;
  status: string;
  questionCount: number;
  questions: QuizPreviewQuestion[];
}

export function useQuizPreview(quizId: string | null) {
  return useQuery({
    queryKey: ["quiz-preview-detail", quizId],
    queryFn: async () => {
      const { data } = await api.get<QuizPreview>(`/quizzes/${quizId}`);
      return data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    enabled: !!quizId,
  });
}
