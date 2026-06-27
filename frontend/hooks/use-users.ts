import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiRole } from "@/lib/utils";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: ApiRole;
  isActive: boolean;
  jobTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
  lastAccessAt: string | null;
  createdAt: string;
  companyId: string;
  courseCount: number;
}

export interface UsersPage {
  data: ApiUser[];
  total: number;
  page: number;
  perPage: number;
}

export interface UsersFilter {
  page?: number;
  perPage?: number;
  search?: string;
  role?: ApiRole | "";
  isActive?: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: ApiRole;
  password?: string;
  sendInvite?: boolean;
}

export interface UpdateUserPayload {
  id: string;
  name?: string;
  email?: string;
  role?: ApiRole;
  isActive?: boolean;
  jobTitle?: string;
}

export function useUsers(filter: UsersFilter = {}) {
  return useQuery({
    queryKey: ["users", filter],
    queryFn: async () => {
      const params: Record<string, string | number | boolean | undefined> = {
        page: filter.page ?? 1,
        perPage: filter.perPage ?? 20,
      };
      if (filter.search) params.search = filter.search;
      if (filter.role) params.role = filter.role;
      if (filter.isActive !== undefined) params.isActive = filter.isActive;
      const { data } = await api.get<UsersPage>("/users", { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useProfessors() {
  return useQuery({
    queryKey: ["users-professors"],
    queryFn: async () => {
      const { data } = await api.get<UsersPage>("/users", {
        params: { role: "PROFESSOR", perPage: 100 },
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      api.post<ApiUser>("/users", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateUserPayload) =>
      api.patch<ApiUser>(`/users/${id}`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
