import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCourseDetail, useCoursePreview } from "./use-course-detail";
import type { LessonWithStatus, ModuleWithStatus } from "./use-course-detail";

function deriveLessonContext(
  query: ReturnType<typeof useCourseDetail>,
  lessonId: string,
) {
  const derived = (() => {
    if (!query.data) return null;
    const { modulesWithStatus, totalLessons, completedCount, progressPercent } = query.data;

    let currentLesson: LessonWithStatus | null = null;
    let currentModule: ModuleWithStatus | null = null;
    let prevLesson: LessonWithStatus | null = null;
    let nextLesson: LessonWithStatus | null = null;
    let isCompleted = false;

    const allLessons: Array<{ lesson: LessonWithStatus; module: ModuleWithStatus }> = [];
    for (const m of modulesWithStatus) {
      for (const l of m.lessons) {
        allLessons.push({ lesson: l, module: m });
      }
    }

    const idx = allLessons.findIndex((x) => x.lesson.id === lessonId);
    if (idx !== -1) {
      currentLesson = allLessons[idx].lesson;
      currentModule = allLessons[idx].module;
      prevLesson = idx > 0 ? allLessons[idx - 1].lesson : null;
      nextLesson = idx < allLessons.length - 1 ? allLessons[idx + 1].lesson : null;
      isCompleted = allLessons[idx].lesson.status === "done";
    }

    return {
      course: query.data,
      modulesWithStatus,
      currentLesson,
      currentModule,
      prevLesson,
      nextLesson,
      isCompleted,
      totalLessons,
      completedCount,
      progressPercent,
    };
  })();

  return { ...query, derived };
}

export function useLessonContext(courseId: string, lessonId: string) {
  const query = useCourseDetail(courseId);
  return deriveLessonContext(query, lessonId);
}

/** Preview variant — always fetches fresh data from the database. */
export function useLessonContextPreview(courseId: string, lessonId: string) {
  const query = useCoursePreview(courseId);
  return deriveLessonContext(query, lessonId);
}

export function useMarkLessonComplete(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) =>
      api.patch(`/lessons/${lessonId}/progress`, { completed: true }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-detail", courseId] });
      qc.invalidateQueries({ queryKey: ["student-overview"] });
    },
  });
}
