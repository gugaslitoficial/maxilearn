import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface QuestionAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CourseQuestionReply {
  id: string;
  questionId: string;
  authorId: string;
  author: QuestionAuthor;
  body: string;
  createdAt: string;
}

export interface CourseQuestion {
  id: string;
  courseId: string;
  lessonId: string;
  authorId: string;
  author: QuestionAuthor;
  question: string;
  createdAt: string;
  replies: CourseQuestionReply[];
}

export function useCourseQuestions(lessonId: string | null) {
  return useQuery({
    queryKey: ["course-questions", lessonId],
    queryFn: async () => {
      const { data } = await api.get<CourseQuestion[]>(`/course-questions?lessonId=${lessonId}`);
      return data;
    },
    staleTime: 10_000,
    enabled: !!lessonId,
  });
}

export function useCreateCourseQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { lessonId: string; courseId: string; question: string }) =>
      api.post<CourseQuestion>("/course-questions", payload).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["course-questions", vars.lessonId] });
    },
  });
}

export function useCreateReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, body, lessonId }: { questionId: string; body: string; lessonId: string }) =>
      api.post<CourseQuestionReply>(`/course-questions/${questionId}/reply`, { body }).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["course-questions", vars.lessonId] });
    },
  });
}

export function useDeleteCourseQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId }: { questionId: string; lessonId: string }) =>
      api.delete(`/course-questions/${questionId}`).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["course-questions", vars.lessonId] });
    },
  });
}
