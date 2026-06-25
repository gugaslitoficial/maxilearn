import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CertificateCompany {
  id: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  platformName: string | null;
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  companyId: string;
  validationCode: string;
  issuedAt: string;
  studentName: string;
  courseName: string;
  teacherName: string;
  courseDuration: string | null;
  company: CertificateCompany;
}

export function useCertificates() {
  return useQuery({
    queryKey: ["student-certificates"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Certificate[]; total: number; page: number; totalPages: number }>(
        "/certificates",
        { params: { perPage: 50 } },
      );
      return data;
    },
    staleTime: 30_000,
    retry: 1,
  });
}
