import { Injectable } from '@nestjs/common';
import { CourseStatus, EnrollmentStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

const PT_MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

@Injectable()
export class ReportsService {
  private readonly PALETTE = [
    '#e8f0ff','#f0e8ff','#e8fff0','#fff8e8','#ffe8e8',
    '#e8f5ff','#f5ffe8','#fff0e8','#e8e8ff','#f8e8ff',
  ];

  constructor(private readonly prisma: PrismaService) {}

  // ── helpers ───────────────────────────────────────────────────────────────────

  private getRange(period: number) {
    const to = new Date();
    const from = new Date(to.getTime() - period * 86400000);
    const prevFrom = new Date(from.getTime() - period * 86400000);
    return { to, from, prevFrom };
  }

  private calcTrend(curr: number, prev: number): { trend: 'up' | 'down' | 'neutral'; trendPercent: number } {
    if (prev === 0) return { trend: curr > 0 ? 'up' : 'neutral', trendPercent: 0 };
    const diff = ((curr - prev) / prev) * 100;
    return {
      trend: diff > 1 ? 'up' : diff < -1 ? 'down' : 'neutral',
      trendPercent: Math.abs(Math.round(diff)),
    };
  }

  private makeTag(title: string, category?: string | null): string {
    if (category) return category.replace(/\s+/g, '').slice(0, 4).toUpperCase();
    return title.split(/\s+/).map(w => w[0]).join('').slice(0, 3).toUpperCase();
  }

  private makeInitials(name: string): string {
    return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).join('').slice(0, 2);
  }

  private fmtDate(d: Date): string {
    return `${d.getDate()} ${PT_MONTHS[d.getMonth()]}`;
  }

  private relativeTime(d: Date): string {
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  private palette(i: number): string {
    return this.PALETTE[i % this.PALETTE.length];
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────────────

  async adminOverview(user: AuthenticatedUser, period: number) {
    const { from, prevFrom, to } = this.getRange(period);
    const cid = user.companyId;
    const yesterday = new Date(Date.now() - 86400000);

    const [
      totalUsers,
      newUsersCurr, newUsersPrev,
      activeCourses,
      newCoursesCurr, newCoursesPrev,
      activeEnrollments,
      certsCurr, certsPrev,
      activeToday,
      activeUsersCurr, activeUsersPrev,
      learnCurr, learnPrev,
    ] = await Promise.all([
      this.prisma.user.count({ where: { companyId: cid } }),
      this.prisma.user.count({ where: { companyId: cid, createdAt: { gte: from } } }),
      this.prisma.user.count({ where: { companyId: cid, createdAt: { gte: prevFrom, lt: from } } }),
      this.prisma.course.count({ where: { companyId: cid, status: CourseStatus.PUBLISHED } }),
      this.prisma.course.count({ where: { companyId: cid, status: CourseStatus.PUBLISHED, createdAt: { gte: from } } }),
      this.prisma.course.count({ where: { companyId: cid, status: CourseStatus.PUBLISHED, createdAt: { gte: prevFrom, lt: from } } }),
      this.prisma.enrollment.count({ where: { course: { companyId: cid }, status: EnrollmentStatus.ACTIVE } }),
      this.prisma.certificate.count({ where: { companyId: cid, issuedAt: { gte: from } } }),
      this.prisma.certificate.count({ where: { companyId: cid, issuedAt: { gte: prevFrom, lt: from } } }),
      this.prisma.user.count({ where: { companyId: cid, lastAccessAt: { gte: yesterday } } }),
      this.prisma.user.count({ where: { companyId: cid, lastAccessAt: { gte: from } } }),
      this.prisma.user.count({ where: { companyId: cid, lastAccessAt: { gte: prevFrom, lt: from } } }),
      this.prisma.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM(l."durationMinutes"), 0)::int as total
        FROM "LessonProgress" lp
        JOIN "Lesson" l ON l.id = lp."lessonId"
        JOIN "Module" m ON m.id = l."moduleId"
        JOIN "Course" c ON c.id = m."courseId"
        WHERE lp.completed = true AND lp."completedAt" >= ${from} AND lp."completedAt" < ${to}
          AND c."companyId" = ${cid}
      `,
      this.prisma.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM(l."durationMinutes"), 0)::int as total
        FROM "LessonProgress" lp
        JOIN "Lesson" l ON l.id = lp."lessonId"
        JOIN "Module" m ON m.id = l."moduleId"
        JOIN "Course" c ON c.id = m."courseId"
        WHERE lp.completed = true AND lp."completedAt" >= ${prevFrom} AND lp."completedAt" < ${from}
          AND c."companyId" = ${cid}
      `,
    ]);

    const totalCerts = await this.prisma.certificate.count({ where: { companyId: cid } });
    const completionRate = activeEnrollments > 0 ? Math.round((totalCerts / activeEnrollments) * 100) : 0;
    const learningHoursCurr = Math.round(Number(learnCurr[0]?.total ?? 0) / 60);
    const learningHoursPrev = Math.round(Number(learnPrev[0]?.total ?? 0) / 60);

    // Engagement chart — daily lesson completions
    const engRows = await this.prisma.$queryRaw<{ day: string; value: number }[]>`
      SELECT TO_CHAR(DATE(lp."completedAt"), 'YYYY-MM-DD') as day, COUNT(*)::int as value
      FROM "LessonProgress" lp
      JOIN "Lesson" l ON l.id = lp."lessonId"
      JOIN "Module" m ON m.id = l."moduleId"
      JOIN "Course" c ON c.id = m."courseId"
      WHERE lp.completed = true AND lp."completedAt" >= ${from} AND lp."completedAt" < ${to}
        AND c."companyId" = ${cid}
      GROUP BY DATE(lp."completedAt")
      ORDER BY DATE(lp."completedAt") ASC
    `;
    const engMap = new Map(engRows.map(r => [r.day, r.value]));
    const engagement = Array.from({ length: period }, (_, i) => {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      return { date: this.fmtDate(d), value: engMap.get(key) ?? 0 };
    });

    // Activities feed
    const completions = await this.prisma.lessonProgress.findMany({
      where: { completed: true, completedAt: { not: null }, lesson: { module: { course: { companyId: cid } } } },
      select: {
        completedAt: true,
        student: { select: { name: true } },
        lesson: { select: { title: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 8,
    });

    // Top courses
    const topCoursesList = await this.prisma.course.findMany({
      where: { companyId: cid, status: CourseStatus.PUBLISHED },
      select: {
        id: true, title: true, category: true,
        teacher: { select: { name: true } },
        _count: { select: { enrollments: { where: { status: EnrollmentStatus.ACTIVE } } } },
        certificates: { select: { id: true } },
      },
      orderBy: { enrollments: { _count: 'desc' } },
      take: 5,
    });

    return {
      kpis: {
        totalUsers:     { value: totalUsers,         ...this.calcTrend(newUsersCurr, newUsersPrev) },
        activeCourses:  { value: activeCourses,      ...this.calcTrend(newCoursesCurr, newCoursesPrev) },
        completionRate: { value: completionRate,      ...this.calcTrend(certsCurr, certsPrev) },
        activeToday:    { value: activeToday,         ...this.calcTrend(activeUsersCurr, activeUsersPrev) },
        activeUsers:    { value: activeUsersCurr,     ...this.calcTrend(activeUsersCurr, activeUsersPrev) },
        learningHours:  { value: learningHoursCurr,  ...this.calcTrend(learningHoursCurr, learningHoursPrev) },
        certificates:   { value: certsCurr,           ...this.calcTrend(certsCurr, certsPrev) },
      },
      engagement,
      activities: completions.map((c, i) => ({
        initials: this.makeInitials(c.student.name),
        text: `${c.student.name} concluiu "${c.lesson.title}"`,
        time: this.relativeTime(c.completedAt!),
        color: this.palette(i),
      })),
      topCourses: topCoursesList.map((c, i) => ({
        name: c.title,
        teacher: c.teacher.name,
        students: c._count.enrollments,
        pct: c._count.enrollments > 0 ? Math.round((c.certificates.length / c._count.enrollments) * 100) : 0,
        tag: this.makeTag(c.title, c.category),
        color: this.palette(i),
      })),
    };
  }

  async adminUsers(user: AuthenticatedUser, period: number) {
    const { from } = this.getRange(period);
    const cid = user.companyId;

    const students = await this.prisma.user.findMany({
      where: { companyId: cid, role: Role.STUDENT, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    if (students.length === 0) return { data: [], total: 0 };

    const studentIds = students.map(s => s.id);

    const [enrollGroups, certGroups, hoursRows] = await Promise.all([
      this.prisma.enrollment.groupBy({
        by: ['studentId'],
        where: { studentId: { in: studentIds }, status: EnrollmentStatus.ACTIVE },
        _count: { id: true },
      }),
      this.prisma.certificate.groupBy({
        by: ['studentId'],
        where: { studentId: { in: studentIds }, companyId: cid },
        _count: { id: true },
      }),
      this.prisma.$queryRaw<{ studentId: string; minutes: number }[]>`
        SELECT lp."studentId", COALESCE(SUM(l."durationMinutes"), 0)::int as minutes
        FROM "LessonProgress" lp
        JOIN "Lesson" l ON l.id = lp."lessonId"
        WHERE lp."studentId" IN (${Prisma.join(studentIds)})
          AND lp.completed = true
          AND lp."completedAt" >= ${from}
        GROUP BY lp."studentId"
      `,
    ]);

    const enrollMap = new Map(enrollGroups.map(e => [e.studentId, e._count.id]));
    const certMap   = new Map(certGroups.map(c => [c.studentId, c._count.id]));
    const hoursMap  = new Map(hoursRows.map(h => [h.studentId, Math.round(h.minutes / 60)]));

    const data = students.map((s, i) => ({
      initials:  this.makeInitials(s.name),
      name:      s.name,
      started:   enrollMap.get(s.id) ?? 0,
      completed: certMap.get(s.id) ?? 0,
      hours:     hoursMap.get(s.id) ?? 0,
      certs:     certMap.get(s.id) ?? 0,
      color:     this.palette(i),
    }));

    return { data, total: data.length };
  }

  async adminCourses(user: AuthenticatedUser, _period: number) {
    const cid = user.companyId;

    const courses = await this.prisma.course.findMany({
      where: { companyId: cid, status: CourseStatus.PUBLISHED },
      select: {
        id: true, title: true, category: true,
        enrollments: { where: { status: EnrollmentStatus.ACTIVE }, select: { id: true } },
        certificates: { select: { id: true } },
      },
      orderBy: { enrollments: { _count: 'desc' } },
    });

    const data = courses.map((c, i) => {
      const students = c.enrollments.length;
      const progress = students > 0 ? Math.round((c.certificates.length / students) * 100) : 0;
      return {
        tag:      this.makeTag(c.title, c.category),
        name:     c.title,
        students,
        progress,
        color:    this.palette(i),
      };
    });

    return { data, total: data.length };
  }

  async adminExport(user: AuthenticatedUser, period: number): Promise<string> {
    const { data } = await this.adminUsers(user, period);
    const header = 'Nome,Cursos Iniciados,Cursos Concluídos,Horas,Certificados';
    const rows = data.map(u => `"${u.name}",${u.started},${u.completed},${u.hours},${u.certs}`);
    return [header, ...rows].join('\n');
  }

  // ── PROFESSOR ─────────────────────────────────────────────────────────────────

  async professorOverview(user: AuthenticatedUser) {
    const cid = user.companyId;
    const tid = user.userId;
    const sevenDaysAgo  = new Date(Date.now() - 7 * 86400000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);

    const courses = await this.prisma.course.findMany({
      where: { teacherId: tid, companyId: cid, status: CourseStatus.PUBLISHED },
      select: { id: true, title: true },
    });

    const EMPTY_KPI = { trend: 'neutral' as const, trendPercent: 0 };

    if (courses.length === 0) {
      return {
        kpis: {
          activeCourses:  { value: 0, ...EMPTY_KPI },
          totalStudents:  { value: 0, ...EMPTY_KPI },
          completionRate: { value: 0, ...EMPTY_KPI },
        },
        chartBars: [],
        activities: [],
      };
    }

    const courseIds = courses.map(c => c.id);

    const [
      totalStudents,
      newStudentsCurr, newStudentsPrev,
      totalCerts,
      activeEnrollments,
    ] = await Promise.all([
      this.prisma.enrollment.count({ where: { courseId: { in: courseIds }, status: EnrollmentStatus.ACTIVE } }),
      this.prisma.enrollment.count({ where: { courseId: { in: courseIds }, status: EnrollmentStatus.ACTIVE, approvedAt: { gte: sevenDaysAgo } } }),
      this.prisma.enrollment.count({ where: { courseId: { in: courseIds }, status: EnrollmentStatus.ACTIVE, approvedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      this.prisma.certificate.count({ where: { courseId: { in: courseIds } } }),
      this.prisma.enrollment.count({ where: { courseId: { in: courseIds }, status: EnrollmentStatus.ACTIVE } }),
    ]);

    const completionRate = activeEnrollments > 0 ? Math.round((totalCerts / activeEnrollments) * 100) : 0;

    // Chart bars: active students per course in last 7 days
    const barsRows = await this.prisma.$queryRaw<{ courseId: string; value: number }[]>`
      SELECT m."courseId", COUNT(DISTINCT lp."studentId")::int as value
      FROM "LessonProgress" lp
      JOIN "Lesson" l ON l.id = lp."lessonId"
      JOIN "Module" m ON m.id = l."moduleId"
      WHERE lp."completedAt" >= ${sevenDaysAgo}
        AND lp.completed = true
        AND m."courseId" IN (${Prisma.join(courseIds)})
      GROUP BY m."courseId"
    `;
    const barsMap = new Map(barsRows.map(r => [r.courseId, r.value]));
    const chartBars = courses.map(c => ({
      label: c.title.split(/\s+/).slice(0, 2).join(' '),
      value: barsMap.get(c.id) ?? 0,
    }));

    // Activities
    const completions = await this.prisma.lessonProgress.findMany({
      where: {
        completed: true,
        completedAt: { not: null },
        lesson: { module: { courseId: { in: courseIds } } },
      },
      select: {
        completedAt: true,
        student: { select: { name: true } },
        lesson: { select: { title: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 8,
    });

    return {
      kpis: {
        activeCourses:  { value: courses.length, ...EMPTY_KPI },
        totalStudents:  { value: totalStudents, ...this.calcTrend(newStudentsCurr, newStudentsPrev) },
        completionRate: { value: completionRate, ...EMPTY_KPI },
      },
      chartBars,
      activities: completions.map((c, i) => ({
        initials: this.makeInitials(c.student.name),
        text:     `${c.student.name} concluiu "${c.lesson.title}"`,
        time:     this.relativeTime(c.completedAt!),
        color:    this.palette(i),
      })),
    };
  }

  async professorStudents(user: AuthenticatedUser, courseId?: string) {
    const isAdmin = user.role === Role.ADMIN;
    const teacherFilter = isAdmin ? {} : { teacherId: user.userId };

    const courseWhere = courseId
      ? { id: courseId, companyId: user.companyId, ...teacherFilter }
      : { companyId: user.companyId, ...teacherFilter };

    const courses = await this.prisma.course.findMany({
      where: courseWhere,
      select: {
        id: true,
        modules: { select: { lessons: { select: { id: true } } } },
        quizzes: { select: { id: true } },
      },
    });

    const rows: Record<string, unknown>[] = [];

    for (const course of courses) {
      const lessonIds = course.modules.flatMap(m => m.lessons).map(l => l.id);
      const quizIds   = course.quizzes.map(q => q.id);
      const totalLessons = lessonIds.length;

      const enrollments = await this.prisma.enrollment.findMany({
        where: { courseId: course.id, status: EnrollmentStatus.ACTIVE },
        select: { student: { select: { id: true, name: true, email: true, lastAccessAt: true } } },
      });

      if (enrollments.length === 0) continue;

      const studentIds = enrollments.map(e => e.student.id);

      const [progressGroups, scoreGroups, certs] = await Promise.all([
        lessonIds.length > 0
          ? this.prisma.lessonProgress.groupBy({
              by: ['studentId'],
              where: { studentId: { in: studentIds }, lessonId: { in: lessonIds }, completed: true },
              _count: { id: true },
            })
          : Promise.resolve([] as { studentId: string; _count: { id: number } }[]),
        quizIds.length > 0
          ? this.prisma.quizSubmission.groupBy({
              by: ['studentId'],
              where: { studentId: { in: studentIds }, quizId: { in: quizIds } },
              _avg: { score: true },
            })
          : Promise.resolve([] as { studentId: string; _avg: { score: number | null } }[]),
        this.prisma.certificate.findMany({
          where: { courseId: course.id, studentId: { in: studentIds } },
          select: { studentId: true, issuedAt: true },
        }),
      ]);

      const progMap  = new Map(progressGroups.map(p => [p.studentId, p._count.id]));
      const scoreMap = new Map(scoreGroups.map(s => [s.studentId, s._avg.score ?? 0]));
      const certMap  = new Map(certs.map(c => [c.studentId, c.issuedAt]));

      enrollments.forEach((e, i) => {
        const s = e.student;
        const done = progMap.get(s.id) ?? 0;
        const progress = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
        const rawScore = scoreMap.get(s.id) ?? 0;
        const grade = Math.round((rawScore / 10) * 10) / 10;
        const certDate = certMap.get(s.id);

        rows.push({
          id:         s.id,
          initials:   this.makeInitials(s.name),
          name:       s.name,
          email:      s.email,
          lessons:    done,
          progress,
          grade,
          lastAccess: s.lastAccessAt ? this.relativeTime(s.lastAccessAt) : 'Nunca',
          status:     certDate ? 'done' : done > 0 ? 'progress' : 'not_started',
          color:      this.palette(i),
          hasCert:    !!certDate,
          certDate:   certDate ? certDate.toLocaleDateString('pt-BR') : null,
        });
      });
    }

    return { data: rows, total: rows.length };
  }

  // ── STUDENT ───────────────────────────────────────────────────────────────────

  async studentOverview(user: AuthenticatedUser) {
    const sid = user.userId;
    const cid = user.companyId;
    const fourWeeksAgo = new Date(Date.now() - 28 * 86400000);

    const [started, certificates, hoursResult, weeklyResult] = await Promise.all([
      this.prisma.enrollment.count({ where: { studentId: sid, status: EnrollmentStatus.ACTIVE } }),
      this.prisma.certificate.count({ where: { studentId: sid, companyId: cid } }),
      this.prisma.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM(l."durationMinutes"), 0)::int as total
        FROM "LessonProgress" lp
        JOIN "Lesson" l ON l.id = lp."lessonId"
        WHERE lp."studentId" = ${sid} AND lp.completed = true
      `,
      this.prisma.$queryRaw<{ week_start: string; minutes: number }[]>`
        SELECT TO_CHAR(DATE_TRUNC('week', lp."completedAt"), 'YYYY-MM-DD') as week_start,
               COALESCE(SUM(l."durationMinutes"), 0)::int as minutes
        FROM "LessonProgress" lp
        JOIN "Lesson" l ON l.id = lp."lessonId"
        WHERE lp."studentId" = ${sid}
          AND lp.completed = true
          AND lp."completedAt" >= ${fourWeeksAgo}
        GROUP BY DATE_TRUNC('week', lp."completedAt")
        ORDER BY week_start ASC
      `,
    ]);

    const totalHours = Math.round(Number(hoursResult[0]?.total ?? 0) / 60);
    const weekMap = new Map(weeklyResult.map(r => [r.week_start, Math.round(r.minutes / 60)]));

    // Build exactly 4 week buckets (Mon-based, matching DATE_TRUNC output)
    const weeklyHours = Array.from({ length: 4 }, (_, i) => {
      const d = new Date(fourWeeksAgo);
      d.setDate(d.getDate() + i * 7);
      // Snap to Monday (DATE_TRUNC week)
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      d.setDate(d.getDate() + diff);
      const key = d.toISOString().split('T')[0];
      return { week: this.fmtDate(d), hours: weekMap.get(key) ?? 0 };
    });

    return {
      started,
      completed: certificates,
      hours: totalHours,
      certificates,
      weeklyHours,
    };
  }
}
