import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type OverviewPeriod = 7 | 30 | 90;

export interface KpiItem {
  value: number;
  trend: "up" | "down" | "neutral";
  trendPercent: number;
}

export interface EngagementPoint {
  date: string;
  value: number;
}

export interface Activity {
  initials: string;
  text: string;
  time: string;
  color: string;
}

export interface TopCourse {
  name: string;
  teacher: string;
  students: number;
  pct: number;
  tag: string;
  color: string;
}

export interface AdminOverview {
  kpis: {
    totalUsers: KpiItem;
    activeCourses: KpiItem;
    completionRate: KpiItem;
    activeToday: KpiItem;
    activeUsers: KpiItem;
    learningHours: KpiItem;
    certificates: KpiItem;
  };
  engagement: EngagementPoint[];
  activities: Activity[];
  topCourses: TopCourse[];
}

export function useAdminOverview(period: OverviewPeriod = 30) {
  return useQuery({
    queryKey: ["admin-overview", period],
    queryFn: async () => {
      const { data } = await api.get<AdminOverview>("/reports/admin/overview", {
        params: { period },
      });
      return data;
    },
  });
}
