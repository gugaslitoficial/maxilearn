import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiCourseProfessor } from "@/hooks/use-courses-professor";

export interface ApiLesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  order: number;
  isFreePreview: boolean;
  type: string;
  moduleId: string;
}

export interface ApiModule {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons: ApiLesson[];
}

export interface CourseEditorData {
  course: ApiCourseProfessor;
  modules: ApiModule[];
}

export interface CreateModulePayload {
  title: string;
  order?: number;
}

export interface UpdateModulePayload {
  title?: string;
  order?: number;
}

export interface CreateLessonPayload {
  title: string;
  type?: string;
  order?: number;
  videoUrl?: string;
  description?: string;
  isFreePreview?: boolean;
  durationMinutes?: number;
}

export interface UpdateLessonPayload {
  title?: string;
  description?: string;
  videoUrl?: string;
  isFreePreview?: boolean;
  durationMinutes?: number;
  order?: number;
}

async function fetchCourseWithModules(courseId: string): Promise<CourseEditorData> {
  const [courseRes, modulesRes] = await Promise.all([
    api.get<ApiCourseProfessor>(`/courses/${courseId}`),
    api.get<ApiModule[]>(`/courses/${courseId}/modules`),
  ]);
  const modules = modulesRes.data;
  const withLessons = await Promise.all(
    modules.map(async (m) => {
      const lessonsRes = await api.get<ApiLesson[]>(
        `/courses/${courseId}/modules/${m.id}/lessons`,
      );
      return { ...m, lessons: lessonsRes.data };
    }),
  );
  return { course: courseRes.data, modules: withLessons };
}

export function useCourseEditor(courseId: string | null) {
  return useQuery({
    queryKey: ["course-editor", courseId],
    queryFn: () => fetchCourseWithModules(courseId!),
    enabled: !!courseId,
    staleTime: 0,
    retry: 1,
  });
}

export function useCreateModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateModulePayload) =>
      api.post<ApiModule>(`/courses/${courseId}/modules`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-editor", courseId] }),
  });
}

export function useUpdateModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateModulePayload) =>
      api.patch<ApiModule>(`/courses/${courseId}/modules/${id}`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-editor", courseId] }),
  });
}

export function useDeleteModule(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (moduleId: string) =>
      api.delete(`/courses/${courseId}/modules/${moduleId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-editor", courseId] }),
  });
}

export function useCreateLesson(courseId: string, moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLessonPayload) =>
      api
        .post<ApiLesson>(`/courses/${courseId}/modules/${moduleId}/lessons`, payload)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-editor", courseId] }),
  });
}

export function useUpdateLesson(courseId: string, moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateLessonPayload) =>
      api
        .patch<ApiLesson>(`/courses/${courseId}/modules/${moduleId}/lessons/${id}`, payload)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-editor", courseId] }),
  });
}

export function useDeleteLesson(courseId: string, moduleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) =>
      api
        .delete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-editor", courseId] }),
  });
}

export function useReorderModules(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      api.patch(`/courses/${courseId}/modules/reorder`, { ids }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-editor", courseId] }),
  });
}
