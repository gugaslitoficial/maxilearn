import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiCourseStatus } from "@/lib/utils";

export interface ApiCourse {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  thumbnailUrl: string | null;
  status: ApiCourseStatus;
  teacher: { id: string; name: string; avatarUrl: string | null };
  _count: { modules: number; enrollments: number };
  createdAt: string;
  updatedAt: string;
}

export interface CoursesPage {
  data: ApiCourse[];
  total: number;
  page: number;
  perPage: number;
}

export interface CoursesFilter {
  page?: number;
  perPage?: number;
  search?: string;
  status?: ApiCourseStatus | "";
  category?: string;
}

export interface CreateCoursePayload {
  title: string;
  description?: string;
  category?: string;
  level?: string;
  teacherId: string;
  status?: ApiCourseStatus;
}

export function useCoursesAdmin(filter: CoursesFilter = {}) {
  return useQuery({
    queryKey: ["courses-admin", filter],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {
        page: filter.page ?? 1,
        perPage: filter.perPage ?? 20,
      };
      if (filter.search) params.search = filter.search;
      if (filter.status) params.status = filter.status;
      if (filter.category) params.category = filter.category;
      const { data } = await api.get<CoursesPage>("/courses", { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) =>
      api.post<ApiCourse>("/courses", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses-admin"] }),
  });
}

export function useUpdateCourseStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApiCourseStatus }) =>
      api.patch<ApiCourse>(`/courses/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses-admin"] }),
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/courses/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses-admin"] }),
  });
}
