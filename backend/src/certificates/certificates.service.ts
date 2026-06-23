import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ListCertificatesDto } from './dto/list-certificates.dto';
import { CreateCertificateDto } from './dto/create-certificate.dto';

const COMPANY_BRANDING = {
  id: true,
  name: true,
  logoUrl: true,
  primaryColor: true,
  platformName: true,
};

const CERT_SELECT = {
  id: true,
  studentId: true,
  courseId: true,
  companyId: true,
  validationCode: true,
  issuedAt: true,
  studentName: true,
  courseName: true,
  teacherName: true,
  courseDuration: true,
  company: { select: COMPANY_BRANDING },
};

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── findAll ───────────────────────────────────────────────────────────────

  async findAll(user: AuthenticatedUser, query: ListCertificatesDto) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.perPage) || 20;
    const skip = (page - 1) * perPage;

    const where: Record<string, unknown> = { companyId: user.companyId };

    if (user.role === Role.STUDENT) {
      where['studentId'] = user.userId;
    } else if (user.role === Role.PROFESSOR) {
      where['course'] = { companyId: user.companyId, teacherId: user.userId };
    }

    if (query.courseId) where['courseId'] = query.courseId;

    if (query.studentId && user.role !== Role.STUDENT) {
      where['studentId'] = query.studentId;
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.certificate.count({ where }),
      this.prisma.certificate.findMany({
        where,
        select: CERT_SELECT,
        skip,
        take: perPage,
        orderBy: { issuedAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / perPage);
    return { data, total, page, totalPages };
  }

  // ─── findOne ───────────────────────────────────────────────────────────────

  async findOne(id: string, user: AuthenticatedUser) {
    const cert = await this.prisma.certificate.findFirst({
      where: { id, companyId: user.companyId },
      select: CERT_SELECT,
    });

    if (!cert) throw new NotFoundException('Certificate not found');

    if (user.role === Role.STUDENT && cert.studentId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role === Role.PROFESSOR) {
      const course = await this.prisma.course.findFirst({
        where: { id: cert.courseId, teacherId: user.userId, companyId: user.companyId },
      });
      if (!course) throw new ForbiddenException('Access denied');
    }

    return cert;
  }

  // ─── validate (public) ─────────────────────────────────────────────────────

  async validate(validationCode: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { validationCode },
      select: {
        ...CERT_SELECT,
        student: { select: { email: true } },
      },
    });

    if (!cert) throw new NotFoundException('Certificate not found');

    return cert;
  }

  // ─── create (ADMIN — manual) ───────────────────────────────────────────────

  async create(user: AuthenticatedUser, dto: CreateCertificateDto) {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, companyId: user.companyId },
      select: { id: true, title: true, teacher: { select: { name: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');

    const student = await this.prisma.user.findFirst({
      where: { id: dto.studentId, companyId: user.companyId, role: Role.STUDENT },
      select: { id: true, name: true },
    });
    if (!student) throw new NotFoundException('Student not found');

    const existing = await this.prisma.certificate.findUnique({
      where: { studentId_courseId: { studentId: dto.studentId, courseId: dto.courseId } },
    });
    if (existing) throw new ConflictException('Certificate already issued for this student and course');

    return this.prisma.certificate.create({
      data: {
        studentId: dto.studentId,
        courseId: dto.courseId,
        companyId: user.companyId,
        studentName: student.name,
        courseName: course.title,
        teacherName: course.teacher.name,
        courseDuration: dto.courseDuration,
      },
      select: CERT_SELECT,
    });
  }

  // ─── createIfNotExists (internal — called by QuizzesService) ──────────────

  async createIfNotExists(data: {
    studentId: string;
    courseId: string;
    companyId: string;
    studentName: string;
    courseName: string;
    teacherName: string;
    courseDuration?: string;
  }): Promise<boolean> {
    const existing = await this.prisma.certificate.findUnique({
      where: { studentId_courseId: { studentId: data.studentId, courseId: data.courseId } },
    });

    if (existing) return false;

    await this.prisma.certificate.create({ data });
    return true;
  }
}
