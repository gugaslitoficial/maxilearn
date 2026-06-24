import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ApiEnrollmentStudent {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  jobTitle: string | null;
}

export interface ApiEnrollmentCourse {
  id: string;
  title: string;
}

export interface ApiEnrollment {
  id: string;
  status: "PENDING" | "ACTIVE" | "REVOKED";
  requestedAt: string;
  approvedAt: string | null;
  student: ApiEnrollmentStudent;
  course: ApiEnrollmentCourse;
}

export interface PendingEnrollmentsResult {
  total: number;
  data: ApiEnrollment[];
}

export interface EnrollmentsPage {
  data: ApiEnrollment[];
  total: number;
  page: number;
  totalPages: number;
}

export function usePendingEnrollments() {
  return useQuery({
    queryKey: ["enrollments-pending"],
    queryFn: async () => {
      const { data } = await api.get<PendingEnrollmentsResult>("/enrollments/pending");
      return data;
    },
    staleTime: 15_000,
    retry: 1,
  });
}

export function useActiveEnrollments(courseId?: string) {
  return useQuery({
    queryKey: ["enrollments-active", courseId ?? "all"],
    queryFn: async () => {
      const params: Record<string, string | number> = { status: "ACTIVE", perPage: 100 };
      if (courseId) params.courseId = courseId;
      const { data } = await api.get<EnrollmentsPage>("/enrollments", { params });
      return data;
    },
    placeholderData: (prev) => prev,
    retry: 1,
  });
}

export function useApproveEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiEnrollment>(`/enrollments/${id}/approve`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments-pending"] });
      qc.invalidateQueries({ queryKey: ["enrollments-active"] });
    },
  });
}

export function useRejectEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiEnrollment>(`/enrollments/${id}/reject`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["enrollments-pending"] }),
  });
}

export function useRevokeEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<ApiEnrollment>(`/enrollments/${id}/revoke`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments-pending"] });
      qc.invalidateQueries({ queryKey: ["enrollments-active"] });
    },
  });
}

export function useBulkApproveEnrollments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentIds: string[]) =>
      api.patch("/enrollments/approve-bulk", { enrollmentIds }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments-pending"] });
      qc.invalidateQueries({ queryKey: ["enrollments-active"] });
    },
  });
}
