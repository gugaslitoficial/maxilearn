import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

const COURSE_SELECT = {
  id: true,
  title: true,
  description: true,
  category: true,
  level: true,
  thumbnailUrl: true,
  status: true,
  companyId: true,
  teacherId: true,
  allowDownload: true,
  issueCertificate: true,
  certificateType: true,
  minPassingScore: true,
  minApprovalScore: true,
  estimatedDurationMinutes: true,
  objectives: true,
  isRestricted: true,
  createdAt: true,
  updatedAt: true,
  teacher: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { modules: true, enrollments: true } },
};

const ALLOWED_TRANSITIONS: Record<CourseStatus, CourseStatus[]> = {
  DRAFT: [CourseStatus.PUBLISHED],
  PUBLISHED: [CourseStatus.ARCHIVED],
  ARCHIVED: [CourseStatus.PUBLISHED],
};

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertAccess(courseId: string, user: AuthenticatedUser) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.companyId !== user.companyId) throw new NotFoundException('Course not found');
    return course;
  }

  private async assertMutateAccess(courseId: string, user: AuthenticatedUser) {
    const course = await this.assertAccess(courseId, user);
    if (user.role === Role.PROFESSOR && course.teacherId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }
    return course;
  }

  async findAll(
    user: AuthenticatedUser,
    query: { page?: number; perPage?: number; search?: string; status?: CourseStatus; category?: string },
  ) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.perPage) || 20;
    const skip = (page - 1) * perPage;

    const where: Record<string, unknown> = { companyId: user.companyId };

    if (user.role === Role.PROFESSOR) where['teacherId'] = user.userId;
    if (user.role === Role.STUDENT) where['status'] = CourseStatus.PUBLISHED;

    if (query.search) where['title'] = { contains: query.search, mode: 'insensitive' };
    if (query.status && user.role !== Role.STUDENT) where['status'] = query.status;
    if (query.category) where['category'] = { contains: query.category, mode: 'insensitive' };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({ where, select: COURSE_SELECT, skip, take: perPage, orderBy: { createdAt: 'desc' } }),
    ]);

    return { data, total, page, perPage };
  }

  async findOne(courseId: string, user: AuthenticatedUser) {
    const course = await this.assertAccess(courseId, user);

    if (user.role === Role.STUDENT && course.status !== CourseStatus.PUBLISHED) {
      throw new NotFoundException('Course not found');
    }

    const full = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        ...COURSE_SELECT,
        modules: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                type: true,
                durationMinutes: true,
                order: true,
                isFree: true,
                materials: true,
                videoUrl: user.role !== Role.STUDENT ? true : undefined,
                quiz: user.role !== Role.STUDENT ? { select: { id: true, title: true } } : false,
              },
            },
          },
        },
      },
    });

    if (!full) throw new NotFoundException('Course not found');

    if (user.role === Role.STUDENT) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: user.userId, courseId } },
      });
      if (enrollment?.status === 'REVOKED') {
        throw new ForbiddenException('Your access to this course has been revoked');
      }
      return { ...full, enrollmentStatus: enrollment?.status ?? null };
    }

    return full;
  }

  async create(user: AuthenticatedUser, dto: CreateCourseDto) {
    if (user.role === Role.PROFESSOR && dto.teacherId !== user.userId) {
      throw new ForbiddenException('Professors can only create courses assigned to themselves');
    }

    const teacher = await this.prisma.user.findFirst({
      where: { id: dto.teacherId, companyId: user.companyId, role: { in: [Role.PROFESSOR, Role.ADMIN] } },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');

    return this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        level: dto.level,
        thumbnailUrl: dto.thumbnailUrl,
        teacherId: dto.teacherId,
        companyId: user.companyId,
        allowDownload: dto.allowDownload,
        issueCertificate: dto.issueCertificate,
        certificateType: dto.certificateType,
        minPassingScore: dto.minPassingScore,
        minApprovalScore: dto.minApprovalScore,
        estimatedDurationMinutes: dto.estimatedDurationMinutes,
        objectives: dto.objectives ?? [],
        isRestricted: dto.isRestricted,
      },
      select: COURSE_SELECT,
    });
  }

  async update(courseId: string, user: AuthenticatedUser, dto: UpdateCourseDto) {
    await this.assertMutateAccess(courseId, user);

    if (dto.teacherId && user.role === Role.PROFESSOR && dto.teacherId !== user.userId) {
      throw new ForbiddenException('Cannot reassign course to another teacher');
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { ...dto, objectives: dto.objectives as unknown as undefined },
      select: COURSE_SELECT,
    });
  }

  async updateStatus(courseId: string, user: AuthenticatedUser, dto: UpdateStatusDto) {
    const course = await this.assertMutateAccess(courseId, user);
    if (course.status === dto.status) {
      return this.prisma.course.findUnique({ where: { id: courseId }, select: COURSE_SELECT });
    }
    const allowed = ALLOWED_TRANSITIONS[course.status];
    if (!allowed.includes(dto.status)) {
      throw new ForbiddenException(`Cannot transition from ${course.status} to ${dto.status}`);
    }
    return this.prisma.course.update({ where: { id: courseId }, data: { status: dto.status }, select: COURSE_SELECT });
  }

  async remove(courseId: string, user: AuthenticatedUser) {
    await this.assertMutateAccess(courseId, user);
    await this.prisma.course.delete({ where: { id: courseId } });
    return { message: 'Course deleted' };
  }

  async getProgress(courseId: string, user: AuthenticatedUser) {
    await this.assertAccess(courseId, user);

    const lessons = await this.prisma.lesson.findMany({
      where: { module: { courseId } },
      select: { id: true },
    });
    const lessonIds = lessons.map((l) => l.id);

    const progress = await this.prisma.lessonProgress.findMany({
      where: { studentId: user.userId, lessonId: { in: lessonIds } },
    });

    const completedCount = progress.filter((p) => p.completed).length;
    const total = lessonIds.length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return { total, completedCount, percentage, progress };
  }

  async createEnrollment(courseId: string, user: AuthenticatedUser, dto: CreateEnrollmentDto) {
    await this.assertAccess(courseId, user);

    const studentId = user.role === Role.STUDENT ? user.userId : (dto.studentId as string);
    if (!studentId) throw new NotFoundException('studentId is required for non-student roles');

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing) return existing;

    const status = user.role === Role.STUDENT ? 'PENDING' : 'ACTIVE';
    const approvedAt = status === 'ACTIVE' ? new Date() : undefined;

    return this.prisma.enrollment.create({
      data: { studentId, courseId, status, approvedAt },
    });
  }
}
