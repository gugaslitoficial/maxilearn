import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ProfKpiItem {
  value: number;
  trend: "up" | "down" | "neutral";
  trendPercent: number;
}

export interface ProfChartBar {
  label: string;
  value: number;
}

export interface ProfActivity {
  initials: string;
  text: string;
  time: string;
  color: string;
}

export interface ProfessorOverview {
  kpis: {
    activeCourses: ProfKpiItem;
    totalStudents: ProfKpiItem;
    completionRate: ProfKpiItem;
  };
  chartBars: ProfChartBar[];
  activities: ProfActivity[];
}

export function useProfessorOverview() {
  return useQuery({
    queryKey: ["professor-overview"],
    queryFn: async () => {
      const { data } = await api.get<ProfessorOverview>("/reports/professor/overview");
      return data;
    },
    staleTime: 30_000,
    retry: 1,
  });
}
