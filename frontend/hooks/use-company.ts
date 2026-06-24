import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ApiCompany {
  id: string;
  name: string;
  cnpj: string | null;
  segment: string | null;
  contactEmail: string | null;
  phone: string | null;
  site: string | null;
  platformName: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  loginBackgroundUrl: string | null;
  faviconUrl: string | null;
  notifNewUser: boolean;
  notifCourseDone: boolean;
  notifInactiveAlert: boolean;
  secTwoFactor: boolean;
  secStrongPassword: boolean;
  secSessionHours: number;
}

export interface UpdateCompanyPayload {
  name?: string;
  cnpj?: string;
  segment?: string;
  contactEmail?: string;
  phone?: string;
  site?: string;
  notifNewUser?: boolean;
  notifCourseDone?: boolean;
  notifInactiveAlert?: boolean;
  secTwoFactor?: boolean;
  secStrongPassword?: boolean;
  secSessionHours?: number;
}

export interface UpdateBrandingPayload {
  platformName?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export function useCompany() {
  return useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const { data } = await api.get<ApiCompany>("/companies/me");
      return data;
    },
    staleTime: 60_000,
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCompanyPayload) =>
      api.patch<ApiCompany>("/companies/me", payload).then((r) => r.data),
    onSuccess: (updated) =>
      qc.setQueryData<ApiCompany>(["company"], updated),
  });
}

export function useUpdateBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateBrandingPayload) =>
      api.patch<ApiCompany>("/companies/me/branding", payload).then((r) => r.data),
    onSuccess: (updated) =>
      qc.setQueryData<ApiCompany>(["company"], updated),
  });
}
