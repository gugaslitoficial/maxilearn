import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiQuizStatus } from "@/lib/utils";

export interface ApiQuiz {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  companyId: string;
  minPassingScore: number;
  maxAttempts: number | null;
  shuffleQuestions: boolean;
  showAnswersAfter: boolean;
  status: ApiQuizStatus;
  questionCount: number;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizzesPage {
  data: ApiQuiz[];
  total: number;
  page: number;
  totalPages: number;
}

export interface QuizQuestionPayload {
  statement: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  order?: number;
  options: Array<{ text: string; isCorrect: boolean }>;
}

export interface CreateQuizPayload {
  title: string;
  courseId: string;
  minPassingScore?: number;
  maxAttempts?: number | null;
  shuffleQuestions?: boolean;
  showAnswersAfter?: boolean;
  status?: ApiQuizStatus;
  questions?: QuizQuestionPayload[];
}

export function useQuizzes(filter: { page?: number; perPage?: number; courseId?: string } = {}) {
  return useQuery({
    queryKey: ["quizzes", filter],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {
        page: filter.page ?? 1,
        perPage: filter.perPage ?? 50,
      };
      if (filter.courseId) params.courseId = filter.courseId;
      const { data } = await api.get<QuizzesPage>("/quizzes", { params });
      return data;
    },
    placeholderData: (prev) => prev,
    retry: 1,
  });
}

export function useCreateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQuizPayload) =>
      api.post<ApiQuiz>("/quizzes", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
  });
}

export function useUpdateQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateQuizPayload>) =>
      api.patch<ApiQuiz>(`/quizzes/${id}`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
  });
}

export function useDeleteQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/quizzes/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
  });
}
