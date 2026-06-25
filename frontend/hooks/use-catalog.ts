import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { hashGradient, hashAvatarColor, makeTag, makeInitials } from "@/lib/utils";

export type CatalogEnrollStatus = "NONE" | "PENDING" | "ACTIVE" | "REVOKED";

export interface CatalogCourse {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  teacher: { id: string; name: string; avatarUrl: string | null };
  _count: { modules: number; enrollments: number };
  gradient: string;
  tag: string;
  teacherInitials: string;
  teacherColor: string;
  enrollmentStatus: CatalogEnrollStatus;
}

interface RawCourse {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  thumbnailUrl: string | null;
  status: string;
  teacher: { id: string; name: string; avatarUrl: string | null };
  _count: { modules: number; enrollments: number };
}

interface RawEnrollment {
  id: string;
  status: "PENDING" | "ACTIVE" | "REVOKED";
  course: { id: string; title: string };
}

export interface CatalogFilter {
  search?: string;
  category?: string;
  level?: string;
  enrollStatus?: string;
}

export function useCatalog(filter: CatalogFilter = {}) {
  return useQuery({
    queryKey: ["catalog", filter],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = { perPage: 100 };
      if (filter.search) params.search = filter.search;
      if (filter.category) params.category = filter.category;

      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.get<{ data: RawCourse[] }>("/courses", { params }),
        api.get<{ data: RawEnrollment[] }>("/enrollments", { params: { perPage: 200 } }),
      ]);

      const enrollMap = new Map<string, "PENDING" | "ACTIVE" | "REVOKED">();
      for (const e of enrollmentsRes.data.data) {
        enrollMap.set(e.course.id, e.status);
      }

      let courses: CatalogCourse[] = coursesRes.data.data.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        level: c.level,
        teacher: c.teacher,
        _count: c._count,
        gradient: hashGradient(c.id),
        tag: makeTag(c.title, c.category),
        teacherInitials: makeInitials(c.teacher.name),
        teacherColor: hashAvatarColor(c.teacher.name),
        enrollmentStatus: (enrollMap.get(c.id) ?? "NONE") as CatalogEnrollStatus,
      }));

      if (filter.level) courses = courses.filter((c) => c.level === filter.level);
      if (filter.enrollStatus === "ACTIVE") courses = courses.filter((c) => c.enrollmentStatus === "ACTIVE");
      if (filter.enrollStatus === "NONE") courses = courses.filter((c) => c.enrollmentStatus === "NONE");

      return courses;
    },
    staleTime: 20_000,
    retry: 1,
  });
}

export function useRequestEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) =>
      api.post<RawEnrollment>("/enrollments", { courseId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalog"] });
      qc.invalidateQueries({ queryKey: ["course-detail"] });
    },
  });
}
