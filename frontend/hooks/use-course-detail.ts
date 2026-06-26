import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { hashGradient, hashAvatarColor, makeTag, makeInitials } from "@/lib/utils";

export interface LessonRaw {
  id: string;
  title: string;
  type: string;
  durationMinutes: number | null;
  order: number;
  isFree: boolean;
}

export interface ModuleRaw {
  id: string;
  title: string;
  order: number;
  lessons: LessonRaw[];
}

export interface CourseDetailRaw {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  thumbnailUrl: string | null;
  status: string;
  objectives: string[];
  issueCertificate: boolean;
  minPassingScore: number;
  isRestricted: boolean;
  teacher: { id: string; name: string; avatarUrl: string | null };
  _count: { modules: number; enrollments: number };
  modules: ModuleRaw[];
  enrollmentStatus: "PENDING" | "ACTIVE" | "REVOKED" | null;
}

export interface LessonProgressRaw {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

export type LessonStatus = "done" | "current" | "locked";

export interface LessonWithStatus extends LessonRaw {
  status: LessonStatus;
}

export interface ModuleWithStatus extends ModuleRaw {
  lessons: LessonWithStatus[];
  moduleCompletedCount: number;
  moduleBadge: "done" | "progress" | "locked";
}

export interface CourseDetail extends CourseDetailRaw {
  gradient: string;
  tag: string;
  teacherInitials: string;
  teacherColor: string;
  progressPercent: number;
  completedCount: number;
  totalLessons: number;
  modulesWithStatus: ModuleWithStatus[];
  nextLesson: LessonRaw | null;
  nextLessonModuleId: string | null;
}

function computeStatuses(
  modules: ModuleRaw[],
  progress: LessonProgressRaw[],
  isActive: boolean,
): Pick<CourseDetail, "modulesWithStatus" | "completedCount" | "nextLesson" | "nextLessonModuleId"> {
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  let foundCurrent = false;
  let nextLesson: LessonRaw | null = null;
  let nextLessonModuleId: string | null = null;
  let completedCount = 0;

  const modulesWithStatus: ModuleWithStatus[] = modules.map((m) => {
    let modDone = 0;
    const lessons: LessonWithStatus[] = m.lessons.map((l) => {
      if (done.has(l.id)) {
        completedCount++;
        modDone++;
        return { ...l, status: "done" };
      }
      if (!foundCurrent && isActive) {
        foundCurrent = true;
        nextLesson = l;
        nextLessonModuleId = m.id;
        return { ...l, status: "current" };
      }
      return { ...l, status: "locked" };
    });

    const total = m.lessons.length;
    const moduleBadge: ModuleWithStatus["moduleBadge"] =
      modDone === total && total > 0 ? "done" : modDone > 0 ? "progress" : "locked";

    return { ...m, lessons, moduleCompletedCount: modDone, moduleBadge };
  });

  return { modulesWithStatus, completedCount, nextLesson, nextLessonModuleId };
}

async function fetchCourseDetail(courseId: string): Promise<CourseDetail> {
  const [courseRes, progressRes] = await Promise.all([
    api.get<CourseDetailRaw>(`/courses/${courseId}`),
    api
      .get<{ total: number; completedCount: number; percentage: number; progress: LessonProgressRaw[] }>(
        `/courses/${courseId}/progress`,
      )
      .catch(() => ({
        data: { total: 0, completedCount: 0, percentage: 0, progress: [] as LessonProgressRaw[] },
      })),
  ]);

  const course = courseRes.data;
  const prog = progressRes.data;
  const isActive = course.enrollmentStatus === "ACTIVE";

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

  const { modulesWithStatus, completedCount, nextLesson, nextLessonModuleId } =
    computeStatuses(course.modules, prog.progress, isActive);

  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return {
    ...course,
    gradient: hashGradient(course.id),
    tag: makeTag(course.title, course.category),
    teacherInitials: makeInitials(course.teacher.name),
    teacherColor: hashAvatarColor(course.teacher.name),
    progressPercent,
    completedCount,
    totalLessons,
    modulesWithStatus,
    nextLesson,
    nextLessonModuleId,
  } as CourseDetail;
}

export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: () => fetchCourseDetail(courseId),
    staleTime: 15_000,
  });
}

/** Preview variant — always fetches fresh data, isolated cache key, never stale. */
export function useCoursePreview(courseId: string) {
  return useQuery({
    queryKey: ["course-preview", courseId],
    queryFn: () => fetchCourseDetail(courseId),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useInvalidateCourseDetail() {
  const qc = useQueryClient();
  return (courseId: string) => qc.invalidateQueries({ queryKey: ["course-detail", courseId] });
}
