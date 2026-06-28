import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentStatus, Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly certificates: CertificatesService,
  ) {}

  // ── Certificate Requests ───────────────────────────────────────────────────

  async submitCertificateRequest(user: AuthenticatedUser, courseId: string) {
    // Must be a student with active enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: user.userId, courseId } },
    });
    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException('Matrícula ativa necessária para solicitar certificado');
    }

    const course = await this.prisma.course.findFirst({
      where: { id: courseId, companyId: user.companyId },
      select: {
        id: true,
        title: true,
        teacherId: true,
        issueCertificate: true,
        minPassingScore: true,
        teacher: { select: { name: true } },
        modules: { select: { lessons: { select: { id: true, type: true, quizId: true } } } },
      },
    });
    if (!course) throw new NotFoundException('Curso não encontrado');
    if (!course.issueCertificate) {
      throw new BadRequestException('Este curso não emite certificados');
    }

    // Check all lessons completed
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const lessonIds = allLessons.map((l) => l.id);
    const totalLessons = lessonIds.length;

    if (totalLessons > 0) {
      const completedProgress = await this.prisma.lessonProgress.count({
        where: { studentId: user.userId, lessonId: { in: lessonIds }, completed: true },
      });
      if (completedProgress < totalLessons) {
        throw new BadRequestException(
          `Você ainda não concluiu todas as aulas (${completedProgress}/${totalLessons})`,
        );
      }
    }

    // Check quiz passed if course has quizzes linked to lessons
    const quizLessons = allLessons.filter((l) => l.type === 'quiz' && l.quizId);
    if (quizLessons.length > 0) {
      const quizIds = quizLessons.map((l) => l.quizId!);
      // Check that student has at least one passing submission for each quiz
      for (const qid of quizIds) {
        const quiz = await this.prisma.quiz.findUnique({
          where: { id: qid },
          select: { minPassingScore: true },
        });
        if (!quiz) continue;
        const passed = await this.prisma.quizSubmission.findFirst({
          where: { quizId: qid, studentId: user.userId, passed: true },
        });
        if (!passed) {
          throw new BadRequestException(
            'Você precisa ser aprovado no quiz do curso para solicitar o certificado',
          );
        }
      }
    }

    // Create or return existing pending request
    const existing = await this.prisma.certificateRequest.findUnique({
      where: { studentId_courseId: { studentId: user.userId, courseId } },
    });
    if (existing) {
      if (existing.status === 'APPROVED') {
        throw new ConflictException('Certificado já foi emitido para este curso');
      }
      if (existing.status === 'PENDING') {
        throw new ConflictException('Solicitação já enviada, aguardando aprovação');
      }
      // REJECTED — allow re-request
      await this.prisma.certificateRequest.update({
        where: { id: existing.id },
        data: { status: 'PENDING', requestedAt: new Date(), reviewedAt: null, reviewedById: null },
      });
    } else {
      await this.prisma.certificateRequest.create({
        data: { studentId: user.userId, courseId, companyId: user.companyId },
      });
    }

    // Notify admins and professor
    const student = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true },
    });

    const admins = await this.prisma.user.findMany({
      where: { companyId: user.companyId, role: Role.ADMIN, isActive: true },
      select: { id: true },
    });

    const recipientIds = [...new Set([...admins.map((a) => a.id), course.teacherId])];
    if (recipientIds.length > 0) {
      await this.prisma.notification.createMany({
        data: recipientIds.map((uid) => ({
          userId: uid,
          companyId: user.companyId,
          type: 'CERTIFICATE_REQUEST',
          title: 'Nova solicitação de certificado',
          body: `${student?.name ?? 'Aluno'} solicitou certificado para "${course.title}"`,
          metadata: { courseId, studentId: user.userId },
        })),
      });
    }

    return { message: 'Solicitação enviada com sucesso' };
  }

  async listCertificateRequests(user: AuthenticatedUser) {
    const where: Record<string, unknown> = {
      companyId: user.companyId,
      status: 'PENDING',
    };
    if (user.role === Role.PROFESSOR) {
      where['course'] = { teacherId: user.userId };
    }

    const requests = await this.prisma.certificateRequest.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, teacher: { select: { name: true } } } },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return { data: requests, total: requests.length };
  }

  async reviewCertificateRequest(
    user: AuthenticatedUser,
    requestId: string,
    action: 'approve' | 'reject',
  ) {
    const req = await this.prisma.certificateRequest.findFirst({
      where: { id: requestId, companyId: user.companyId },
      include: {
        student: { select: { id: true, name: true } },
        course: { select: { id: true, title: true, teacher: { select: { id: true, name: true } } } },
      },
    });
    if (!req) throw new NotFoundException('Solicitação não encontrada');

    if (user.role === Role.PROFESSOR && req.course.teacher.id !== user.userId) {
      throw new ForbiddenException('Acesso negado');
    }

    if (req.status !== 'PENDING') {
      throw new BadRequestException('Solicitação já foi revisada');
    }

    await this.prisma.certificateRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedById: user.userId,
      },
    });

    if (action === 'approve') {
      await this.certificates.createIfNotExists({
        studentId: req.studentId,
        courseId: req.courseId,
        companyId: req.companyId,
        studentName: req.student.name,
        courseName: req.course.title,
        teacherName: req.course.teacher.name,
      });
    }

    // Notify student
    await this.prisma.notification.create({
      data: {
        userId: req.studentId,
        companyId: req.companyId,
        type: action === 'approve' ? 'CERTIFICATE_APPROVED' : 'CERTIFICATE_REJECTED',
        title: action === 'approve' ? 'Certificado emitido!' : 'Solicitação de certificado negada',
        body:
          action === 'approve'
            ? `Seu certificado para "${req.course.title}" foi aprovado e já está disponível.`
            : `Sua solicitação de certificado para "${req.course.title}" foi negada.`,
        metadata: { courseId: req.courseId },
      },
    });

    return { message: action === 'approve' ? 'Certificado emitido com sucesso' : 'Solicitação rejeitada' };
  }

  // ── Quiz Retry Requests ────────────────────────────────────────────────────

  async submitQuizRetryRequest(user: AuthenticatedUser, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: { select: { id: true, title: true, teacherId: true } },
      },
    });
    if (!quiz || quiz.companyId !== user.companyId) throw new NotFoundException('Quiz não encontrado');

    // Must have active enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: user.userId, courseId: quiz.courseId } },
    });
    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException('Matrícula ativa necessária');
    }

    // Quiz must have a maxAttempts limit
    if (quiz.maxAttempts === null) {
      throw new BadRequestException('Este quiz não tem limite de tentativas');
    }

    const attemptCount = await this.prisma.quizSubmission.count({
      where: { quizId, studentId: user.userId },
    });

    const extension = await this.prisma.quizAttemptExtension.findUnique({
      where: { studentId_quizId: { studentId: user.userId, quizId } },
    });
    const effectiveMax = quiz.maxAttempts + (extension?.extraAttempts ?? 0);

    if (attemptCount < effectiveMax) {
      throw new BadRequestException('Você ainda tem tentativas disponíveis');
    }

    // Must have failed (no passing submission)
    const passed = await this.prisma.quizSubmission.findFirst({
      where: { quizId, studentId: user.userId, passed: true },
    });
    if (passed) {
      throw new BadRequestException('Você já foi aprovado neste quiz');
    }

    const existing = await this.prisma.quizRetryRequest.findUnique({
      where: { studentId_quizId: { studentId: user.userId, quizId } },
    });
    if (existing) {
      if (existing.status === 'PENDING') {
        throw new ConflictException('Solicitação já enviada, aguardando aprovação');
      }
      // APPROVED or REJECTED — allow re-request
      await this.prisma.quizRetryRequest.update({
        where: { id: existing.id },
        data: { status: 'PENDING', requestedAt: new Date(), reviewedAt: null, reviewedById: null },
      });
    } else {
      await this.prisma.quizRetryRequest.create({
        data: {
          studentId: user.userId,
          quizId,
          courseId: quiz.courseId,
          companyId: user.companyId,
        },
      });
    }

    const student = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true },
    });

    const admins = await this.prisma.user.findMany({
      where: { companyId: user.companyId, role: Role.ADMIN, isActive: true },
      select: { id: true },
    });

    const recipientIds = [...new Set([...admins.map((a) => a.id), quiz.course.teacherId])];
    if (recipientIds.length > 0) {
      await this.prisma.notification.createMany({
        data: recipientIds.map((uid) => ({
          userId: uid,
          companyId: user.companyId,
          type: 'QUIZ_RETRY_REQUEST',
          title: 'Solicitação de nova tentativa de quiz',
          body: `${student?.name ?? 'Aluno'} solicitou nova tentativa no quiz "${quiz.title}" (${quiz.course.title})`,
          metadata: { quizId, courseId: quiz.courseId, studentId: user.userId },
        })),
      });
    }

    return { message: 'Solicitação de nova tentativa enviada com sucesso' };
  }

  async listQuizRetryRequests(user: AuthenticatedUser) {
    const where: Record<string, unknown> = {
      companyId: user.companyId,
      status: 'PENDING',
    };
    if (user.role === Role.PROFESSOR) {
      where['course'] = { teacherId: user.userId };
    }

    const requests = await this.prisma.quizRetryRequest.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true } },
        quiz: { select: { id: true, title: true, minPassingScore: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });

    return { data: requests, total: requests.length };
  }

  async reviewQuizRetryRequest(
    user: AuthenticatedUser,
    requestId: string,
    action: 'approve' | 'reject',
  ) {
    const req = await this.prisma.quizRetryRequest.findFirst({
      where: { id: requestId, companyId: user.companyId },
      include: {
        student: { select: { id: true, name: true } },
        quiz: { select: { id: true, title: true } },
        course: { select: { id: true, title: true, teacher: { select: { id: true } } } },
      },
    });
    if (!req) throw new NotFoundException('Solicitação não encontrada');

    if (user.role === Role.PROFESSOR && req.course.teacher.id !== user.userId) {
      throw new ForbiddenException('Acesso negado');
    }

    if (req.status !== 'PENDING') {
      throw new BadRequestException('Solicitação já foi revisada');
    }

    await this.prisma.quizRetryRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedById: user.userId,
      },
    });

    if (action === 'approve') {
      await this.prisma.quizAttemptExtension.upsert({
        where: { studentId_quizId: { studentId: req.studentId, quizId: req.quizId } },
        create: {
          studentId: req.studentId,
          quizId: req.quizId,
          extraAttempts: 1,
          grantedById: user.userId,
        },
        update: {
          extraAttempts: { increment: 1 },
          grantedAt: new Date(),
          grantedById: user.userId,
        },
      });
    }

    await this.prisma.notification.create({
      data: {
        userId: req.studentId,
        companyId: req.companyId,
        type: action === 'approve' ? 'QUIZ_RETRY_APPROVED' : 'QUIZ_RETRY_REJECTED',
        title:
          action === 'approve' ? 'Nova tentativa de quiz liberada!' : 'Solicitação de tentativa negada',
        body:
          action === 'approve'
            ? `Uma nova tentativa foi liberada para o quiz "${req.quiz.title}".`
            : `Sua solicitação de nova tentativa para o quiz "${req.quiz.title}" foi negada.`,
        metadata: { quizId: req.quizId, courseId: req.courseId },
      },
    });

    return {
      message:
        action === 'approve' ? 'Nova tentativa liberada com sucesso' : 'Solicitação rejeitada',
    };
  }
}
