import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ReportPeriod = 7 | 30 | 90;

export interface ReportUser {
  initials: string;
  name: string;
  started: number;
  completed: number;
  hours: number;
  certs: number;
  color: string;
}

export interface ReportCourse {
  tag: string;
  name: string;
  students: number;
  progress: number;
  color: string;
}

export function useReportUsers(period: ReportPeriod = 30) {
  return useQuery({
    queryKey: ["report-users", period],
    queryFn: async () => {
      const { data } = await api.get<{ data: ReportUser[]; total: number }>(
        "/reports/admin/users",
        { params: { period } }
      );
      return data;
    },
  });
}

export function useReportCourses(period: ReportPeriod = 30) {
  return useQuery({
    queryKey: ["report-courses", period],
    queryFn: async () => {
      const { data } = await api.get<{ data: ReportCourse[]; total: number }>(
        "/reports/admin/courses",
        { params: { period } }
      );
      return data;
    },
  });
}
