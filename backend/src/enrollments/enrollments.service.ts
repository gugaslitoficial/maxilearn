import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, EnrollmentStatus, Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { ListEnrollmentsDto } from './dto/list-enrollments.dto';
import { BulkApproveDto } from './dto/bulk-approve.dto';

const STUDENT_SELECT = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  jobTitle: true,
};

const COURSE_SELECT = {
  id: true,
  title: true,
};

const ENROLLMENT_SELECT = {
  id: true,
  status: true,
  requestedAt: true,
  approvedAt: true,
  student: { select: STUDENT_SELECT },
  course: { select: COURSE_SELECT },
};

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthenticatedUser, dto: CreateEnrollmentDto) {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, companyId: user.companyId },
    });

    if (!course) throw new NotFoundException('Course not found');

    if (course.status !== CourseStatus.PUBLISHED) {
      throw new BadRequestException('Cannot enroll in a course that is not published');
    }

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: user.userId, courseId: dto.courseId } },
    });
    if (existing) throw new ConflictException('Enrollment already exists for this course');

    return this.prisma.enrollment.create({
      data: { studentId: user.userId, courseId: dto.courseId },
      select: ENROLLMENT_SELECT,
    });
  }

  async findAll(user: AuthenticatedUser, query: ListEnrollmentsDto) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.perPage) || 20;
    const skip = (page - 1) * perPage;

    const where = this.buildListWhere(user, query);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.enrollment.count({ where }),
      this.prisma.enrollment.findMany({
        where,
        select: ENROLLMENT_SELECT,
        skip,
        take: perPage,
        orderBy: { requestedAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / perPage);
    return { data, total, page, totalPages };
  }

  async getPending(user: AuthenticatedUser) {
    const where: Record<string, unknown> = { status: EnrollmentStatus.PENDING };

    if (user.role === Role.PROFESSOR) {
      where['course'] = { companyId: user.companyId, teacherId: user.userId };
    } else {
      where['course'] = { companyId: user.companyId };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.enrollment.count({ where }),
      this.prisma.enrollment.findMany({
        where,
        select: ENROLLMENT_SELECT,
        orderBy: { requestedAt: 'desc' },
      }),
    ]);

    return { total, data };
  }

  async approve(enrollmentId: string, user: AuthenticatedUser) {
    const enrollment = await this.findAndAuthorize(enrollmentId, user);

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new BadRequestException('Enrollment must be in PENDING status to approve');
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.ACTIVE, approvedAt: new Date() },
      select: ENROLLMENT_SELECT,
    });
  }

  async revoke(enrollmentId: string, user: AuthenticatedUser) {
    const enrollment = await this.findAndAuthorize(enrollmentId, user);

    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new BadRequestException('Enrollment must be in ACTIVE status to revoke');
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.REVOKED },
      select: ENROLLMENT_SELECT,
    });
  }

  async reject(enrollmentId: string, user: AuthenticatedUser) {
    const enrollment = await this.findAndAuthorize(enrollmentId, user);

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new BadRequestException('Enrollment must be in PENDING status to reject');
    }

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.REVOKED },
      select: ENROLLMENT_SELECT,
    });
  }

  async bulkApprove(user: AuthenticatedUser, dto: BulkApproveDto) {
    const courseFilter: Record<string, unknown> =
      user.role === Role.PROFESSOR
        ? { companyId: user.companyId, teacherId: user.userId }
        : { companyId: user.companyId };

    const eligible = await this.prisma.enrollment.findMany({
      where: {
        id: { in: dto.enrollmentIds },
        status: EnrollmentStatus.PENDING,
        course: courseFilter,
      },
      select: { id: true },
    });

    const eligibleIds = eligible.map((e) => e.id);
    const skipped = dto.enrollmentIds.length - eligibleIds.length;

    if (eligibleIds.length > 0) {
      await this.prisma.$transaction(
        eligibleIds.map((id) =>
          this.prisma.enrollment.update({
            where: { id },
            data: { status: EnrollmentStatus.ACTIVE, approvedAt: new Date() },
          }),
        ),
      );
    }

    return { approved: eligibleIds.length, skipped };
  }

  private async findAndAuthorize(enrollmentId: string, user: AuthenticatedUser) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        status: true,
        course: { select: { companyId: true, teacherId: true } },
      },
    });

    if (!enrollment || enrollment.course.companyId !== user.companyId) {
      throw new NotFoundException('Enrollment not found');
    }

    if (user.role === Role.PROFESSOR && enrollment.course.teacherId !== user.userId) {
      throw new ForbiddenException('Access denied: enrollment belongs to another professor\'s course');
    }

    return enrollment;
  }

  private buildListWhere(user: AuthenticatedUser, query: ListEnrollmentsDto): Record<string, unknown> {
    const statusFilter = query.status ? { status: query.status } : {};

    if (user.role === Role.STUDENT) {
      return { ...statusFilter, studentId: user.userId };
    }

    if (user.role === Role.PROFESSOR) {
      if (!query.courseId) {
        throw new BadRequestException('courseId is required for professors');
      }
      return {
        ...statusFilter,
        courseId: query.courseId,
        course: { companyId: user.companyId, teacherId: user.userId },
      };
    }

    // ADMIN
    return {
      ...statusFilter,
      course: { companyId: user.companyId },
      ...(query.courseId && { courseId: query.courseId }),
    };
  }
}
