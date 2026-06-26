import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { StudentProgressStatus } from "@/lib/utils";

export interface ApiProfessorStudent {
  id: string;
  initials: string;
  name: string;
  email: string;
  lessons: number;
  progress: number;
  grade: number;
  lastAccess: string;
  status: StudentProgressStatus;
  color: string;
  hasCert: boolean;
  certDate: string | null;
}

export interface ProfessorStudentsResult {
  data: ApiProfessorStudent[];
  total: number;
}

export function useProfessorStudents(courseId?: string) {
  return useQuery({
    queryKey: ["professor-students", courseId ?? "all"],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (courseId) params.courseId = courseId;
      const { data } = await api.get<ProfessorStudentsResult>(
        "/reports/professor/students",
        { params },
      );
      return data;
    },
    placeholderData: (prev) => prev,
  });
}
