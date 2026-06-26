import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface StudentWeeklyHour {
  week: string;
  hours: number;
}

export interface StudentOverview {
  started: number;
  completed: number;
  hours: number;
  certificates: number;
  weeklyHours: StudentWeeklyHour[];
}

export function useStudentOverview() {
  return useQuery({
    queryKey: ["student-overview"],
    queryFn: async () => {
      const { data } = await api.get<StudentOverview>("/reports/student/overview");
      return data;
    },
    staleTime: 30_000,
  });
}
