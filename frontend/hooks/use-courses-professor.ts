import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiCourseStatus } from "@/lib/utils";

export interface ApiCourseProfessor {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  thumbnailUrl: string | null;
  status: ApiCourseStatus;
  teacherId: string;
  teacher: { id: string; name: string; avatarUrl: string | null };
  allowDownload: boolean;
  issueCertificate: boolean;
  minPassingScore: number;
  objectives: string[];
  isRestricted: boolean;
  _count: { modules: number; enrollments: number };
  createdAt: string;
  updatedAt: string;
}

export interface CoursesProfessorPage {
  data: ApiCourseProfessor[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CoursesProfessorFilter {
  page?: number;
  perPage?: number;
  search?: string;
  status?: ApiCourseStatus | "";
  category?: string;
}

export interface CreateCourseProfessorPayload {
  title: string;
  description?: string;
  category?: string;
  level?: string;
  teacherId: string;
  allowDownload?: boolean;
  issueCertificate?: boolean;
  minPassingScore?: number;
  objectives?: string[];
  isRestricted?: boolean;
}

export interface UpdateCourseProfessorPayload {
  title?: string;
  description?: string;
  category?: string;
  level?: string;
  allowDownload?: boolean;
  issueCertificate?: boolean;
  minPassingScore?: number;
  objectives?: string[];
  isRestricted?: boolean;
}

export function useCoursesProfessor(filter: CoursesProfessorFilter = {}) {
  return useQuery({
    queryKey: ["courses-professor", filter],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {
        page: filter.page ?? 1,
        perPage: filter.perPage ?? 20,
      };
      if (filter.search) params.search = filter.search;
      if (filter.status) params.status = filter.status;
      if (filter.category) params.category = filter.category;
      const { data } = await api.get<CoursesProfessorPage>("/courses", { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCoursesProfessorAll() {
  return useQuery({
    queryKey: ["courses-professor-all"],
    queryFn: async () => {
      const { data } = await api.get<CoursesProfessorPage>("/courses", {
        params: { perPage: 100 },
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useCreateCourseProfessor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCourseProfessorPayload) =>
      api.post<ApiCourseProfessor>("/courses", payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses-professor"] });
      qc.invalidateQueries({ queryKey: ["courses-professor-all"] });
    },
  });
}

export function useUpdateCourseProfessor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateCourseProfessorPayload) =>
      api.patch<ApiCourseProfessor>(`/courses/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses-professor"] });
      qc.invalidateQueries({ queryKey: ["course-editor"] });
    },
  });
}

export function useUpdateCourseStatusProfessor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApiCourseStatus }) =>
      api.patch<ApiCourseProfessor>(`/courses/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses-professor"] }),
  });
}

export function useDeleteCourseProfessor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/courses/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses-professor"] }),
  });
}
