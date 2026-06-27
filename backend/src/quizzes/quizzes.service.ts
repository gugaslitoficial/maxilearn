import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentStatus, QuestionType, Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../common/prisma/prisma.service';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ReorderQuestionsDto } from './dto/reorder-questions.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { ListQuizzesDto } from './dto/list-quizzes.dto';
import { CertificatesService } from '../certificates/certificates.service';

type OptionJson = { id: string; text: string; isCorrect: boolean };

const QUIZ_LIST_SELECT = {
  id: true,
  title: true,
  courseId: true,
  companyId: true,
  minPassingScore: true,
  maxAttempts: true,
  shuffleQuestions: true,
  showAnswersAfter: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  course: { select: { id: true, title: true } },
  _count: { select: { questions: true, submissions: true } },
};

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly certificates: CertificatesService,
  ) {}

  // ─── Guards ────────────────────────────────────────────────────────────────

  private async assertQuizAccess(quizId: string, user: AuthenticatedUser) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: { select: { companyId: true, teacherId: true } } },
    });
    if (!quiz || quiz.companyId !== user.companyId) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  private async assertMutateAccess(quizId: string, user: AuthenticatedUser) {
    const quiz = await this.assertQuizAccess(quizId, user);
    if (user.role === Role.PROFESSOR && quiz.course.teacherId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }
    return quiz;
  }

  private async assertActiveEnrollment(courseId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException('Active enrollment required to access this quiz');
    }
    return enrollment;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private normalizeOptions(dto: CreateQuestionDto): OptionJson[] {
    if (dto.type === QuestionType.TRUE_FALSE) {
      const isVerdadeiroCorrect = dto.options?.some(
        (o) => o.text.toLowerCase().includes('verdadeiro') && o.isCorrect,
      ) ?? false;
      return [
        { id: randomUUID(), text: 'Verdadeiro', isCorrect: isVerdadeiroCorrect },
        { id: randomUUID(), text: 'Falso', isCorrect: !isVerdadeiroCorrect },
      ];
    }

    if (!dto.options || dto.options.length < 2) {
      throw new BadRequestException('Multiple choice questions require at least 2 options');
    }
    const correctCount = dto.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new BadRequestException('Multiple choice questions must have exactly 1 correct option');
    }
    return dto.options.map((o) => ({
      id: o.id ?? randomUUID(),
      text: o.text,
      isCorrect: o.isCorrect,
    }));
  }

  private formatListItem(quiz: {
    id: string;
    title: string;
    courseId: string;
    companyId: string;
    minPassingScore: number;
    maxAttempts: number | null;
    shuffleQuestions: boolean;
    showAnswersAfter: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    course: { id: string; title: string };
    _count: { questions: number; submissions: number };
  }) {
    return {
      id: quiz.id,
      title: quiz.title,
      courseId: quiz.courseId,
      courseName: quiz.course.title,
      companyId: quiz.companyId,
      minPassingScore: quiz.minPassingScore,
      maxAttempts: quiz.maxAttempts,
      shuffleQuestions: quiz.shuffleQuestions,
      showAnswersAfter: quiz.showAnswersAfter,
      status: quiz.status,
      questionCount: quiz._count.questions,
      submissionCount: quiz._count.submissions,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };
  }

  // ─── findAll ───────────────────────────────────────────────────────────────

  async findAll(user: AuthenticatedUser, query: ListQuizzesDto) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.perPage) || 20;
    const skip = (page - 1) * perPage;

    const where: Record<string, unknown> = { companyId: user.companyId };

    if (user.role === Role.PROFESSOR) {
      where['course'] = { companyId: user.companyId, teacherId: user.userId };
    }

    if (user.role === Role.STUDENT) {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { studentId: user.userId, status: EnrollmentStatus.ACTIVE },
        select: { courseId: true },
      });
      const courseIds = enrollments.map((e) => e.courseId);
      where['courseId'] = { in: courseIds };
    }

    if (query.courseId) where['courseId'] = query.courseId;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.quiz.count({ where }),
      this.prisma.quiz.findMany({
        where,
        select: QUIZ_LIST_SELECT,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / perPage);
    return {
      data: data.map((q) => this.formatListItem(q)),
      total,
      page,
      totalPages,
    };
  }

  // ─── findOne ───────────────────────────────────────────────────────────────

  async findOne(quizId: string, user: AuthenticatedUser) {
    const quiz = await this.assertQuizAccess(quizId, user);

    if (user.role === Role.STUDENT) {
      await this.assertActiveEnrollment(quiz.courseId, user.userId);
    }

    const full = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: { select: { id: true, title: true } },
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { questions: true, submissions: true } },
      },
    });

    if (!full) throw new NotFoundException('Quiz not found');

    let questions = full.questions.map((q) => {
      const opts = q.options as OptionJson[];
      return {
        id: q.id,
        statement: q.statement,
        type: q.type,
        order: q.order,
        displayCount: q.displayCount,
        options: user.role === Role.STUDENT
          ? opts.map(({ id, text }) => ({ id, text }))
          : opts,
      };
    });

    const base = {
      id: full.id,
      title: full.title,
      courseId: full.courseId,
      courseName: full.course.title,
      companyId: full.companyId,
      minPassingScore: full.minPassingScore,
      maxAttempts: full.maxAttempts,
      shuffleQuestions: full.shuffleQuestions,
      showAnswersAfter: full.showAnswersAfter,
      status: full.status,
      questions,
      questionCount: full._count.questions,
      createdAt: full.createdAt,
      updatedAt: full.updatedAt,
    };

    if (user.role === Role.STUDENT) {
      const attemptCount = await this.prisma.quizSubmission.count({
        where: { quizId, studentId: user.userId },
      });
      const canAttempt = full.maxAttempts === null || attemptCount < full.maxAttempts;
      return {
        ...base,
        attemptCount,
        canAttempt,
        attemptsRemaining: full.maxAttempts === null ? null : full.maxAttempts - attemptCount,
      };
    }

    return base;
  }

  // ─── create ────────────────────────────────────────────────────────────────

  async create(user: AuthenticatedUser, dto: CreateQuizDto) {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, companyId: user.companyId },
      select: { id: true, teacherId: true },
    });
    if (!course) throw new NotFoundException('Course not found');

    if (user.role === Role.PROFESSOR && course.teacherId !== user.userId) {
      throw new ForbiddenException('Professors can only create quizzes for their own courses');
    }

    const questionsData = (dto.questions ?? []).map((q, idx) => ({
      statement: q.statement,
      type: q.type,
      order: q.order ?? idx,
      displayCount: q.displayCount ?? null,
      options: this.normalizeOptions(q),
    }));

    const quiz = await this.prisma.quiz.create({
      data: {
        title: dto.title,
        courseId: dto.courseId,
        companyId: user.companyId,
        lessonId: dto.lessonId ?? null,
        minPassingScore: dto.minPassingScore ?? 70,
        maxAttempts: dto.maxAttempts ?? null,
        shuffleQuestions: dto.shuffleQuestions ?? false,
        showAnswersAfter: false,
        status: dto.status ?? 'DRAFT',
        questions: { create: questionsData },
      },
      include: {
        course: { select: { id: true, title: true } },
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { questions: true, submissions: true } },
      },
    });

    return this.formatListItem(quiz);
  }

  // ─── update ────────────────────────────────────────────────────────────────

  async update(quizId: string, user: AuthenticatedUser, dto: UpdateQuizDto) {
    await this.assertMutateAccess(quizId, user);

    const quiz = await this.prisma.quiz.update({
      where: { id: quizId },
      data: dto,
      select: { ...QUIZ_LIST_SELECT },
    });

    return this.formatListItem(quiz);
  }

  // ─── remove ────────────────────────────────────────────────────────────────

  async remove(quizId: string, user: AuthenticatedUser) {
    await this.assertMutateAccess(quizId, user);

    const submissionCount = await this.prisma.quizSubmission.count({ where: { quizId } });
    if (submissionCount > 0) {
      throw new BadRequestException(
        `Cannot delete quiz: it has ${submissionCount} submission(s). Consider archiving it instead.`,
      );
    }

    await this.prisma.quiz.delete({ where: { id: quizId } });
    return { message: 'Quiz deleted' };
  }

  // ─── addQuestion ───────────────────────────────────────────────────────────

  async addQuestion(quizId: string, user: AuthenticatedUser, dto: CreateQuestionDto) {
    await this.assertMutateAccess(quizId, user);

    const lastQuestion = await this.prisma.question.findFirst({
      where: { quizId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = lastQuestion ? lastQuestion.order + 1 : 0;

    const question = await this.prisma.question.create({
      data: {
        quizId,
        statement: dto.statement,
        type: dto.type,
        order: dto.order ?? nextOrder,
        displayCount: dto.displayCount ?? null,
        options: this.normalizeOptions(dto),
      },
    });

    return question;
  }

  // ─── updateQuestion ────────────────────────────────────────────────────────

  async updateQuestion(
    quizId: string,
    questionId: string,
    user: AuthenticatedUser,
    dto: UpdateQuestionDto,
  ) {
    await this.assertMutateAccess(quizId, user);

    const existing = await this.prisma.question.findFirst({
      where: { id: questionId, quizId },
    });
    if (!existing) throw new NotFoundException('Question not found');

    let options: OptionJson[] | undefined;
    if (dto.options) {
      const type = dto.type ?? existing.type;
      options = this.normalizeOptions({ ...dto, type, statement: '', options: dto.options } as CreateQuestionDto);
    }

    return this.prisma.question.update({
      where: { id: questionId },
      data: {
        ...(dto.statement && { statement: dto.statement }),
        ...(dto.type && { type: dto.type }),
        ...(dto.displayCount !== undefined && { displayCount: dto.displayCount }),
        ...(options && { options }),
      },
    });
  }

  // ─── removeQuestion ────────────────────────────────────────────────────────

  async removeQuestion(quizId: string, questionId: string, user: AuthenticatedUser) {
    await this.assertMutateAccess(quizId, user);

    const question = await this.prisma.question.findFirst({
      where: { id: questionId, quizId },
    });
    if (!question) throw new NotFoundException('Question not found');

    await this.prisma.question.delete({ where: { id: questionId } });

    const remaining = await this.prisma.question.findMany({
      where: { quizId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    if (remaining.length > 0) {
      await this.prisma.$transaction(
        remaining.map((q, idx) =>
          this.prisma.question.update({ where: { id: q.id }, data: { order: idx } }),
        ),
      );
    }

    return { message: 'Question removed' };
  }

  // ─── reorderQuestions ──────────────────────────────────────────────────────

  async reorderQuestions(quizId: string, user: AuthenticatedUser, dto: ReorderQuestionsDto) {
    await this.assertMutateAccess(quizId, user);

    await this.prisma.$transaction(
      dto.questions.map(({ questionId, order }) =>
        this.prisma.question.updateMany({
          where: { id: questionId, quizId },
          data: { order },
        }),
      ),
    );

    const questions = await this.prisma.question.findMany({
      where: { quizId },
      orderBy: { order: 'asc' },
    });

    return questions;
  }

  // ─── submit ────────────────────────────────────────────────────────────────

  async submit(quizId: string, user: AuthenticatedUser, dto: SubmitQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        course: {
          select: {
            id: true,
            issueCertificate: true,
            title: true,
            teacher: { select: { name: true } },
            company: { select: { id: true } },
          },
        },
      },
    });

    if (!quiz || quiz.companyId !== user.companyId) throw new NotFoundException('Quiz not found');

    await this.assertActiveEnrollment(quiz.courseId, user.userId);

    const previousAttempts = await this.prisma.quizSubmission.count({
      where: { quizId, studentId: user.userId },
    });

    if (quiz.maxAttempts !== null && previousAttempts >= quiz.maxAttempts) {
      throw new BadRequestException(
        `Maximum number of attempts (${quiz.maxAttempts}) reached for this quiz`,
      );
    }

    const answerMap = new Map(dto.answers.map((a) => [a.questionId, a.selectedOptionId]));

    if (answerMap.size !== quiz.questions.length) {
      throw new BadRequestException('All questions must be answered before submitting');
    }

    for (const q of quiz.questions) {
      if (!answerMap.has(q.id)) {
        throw new BadRequestException(`Question "${q.statement.slice(0, 40)}" is not answered`);
      }
    }

    let correctCount = 0;
    const answerDetails: Array<{
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
      correctOptionId: string;
      correctOptionText: string;
    }> = [];

    for (const q of quiz.questions) {
      const opts = q.options as OptionJson[];
      const selectedId = answerMap.get(q.id)!;
      const selectedOpt = opts.find((o) => o.id === selectedId);
      const correctOpt = opts.find((o) => o.isCorrect)!;

      if (!selectedOpt) {
        throw new BadRequestException(`Invalid option ID for question "${q.statement.slice(0, 40)}"`);
      }

      const isCorrect = selectedOpt.isCorrect;
      if (isCorrect) correctCount++;

      answerDetails.push({
        questionId: q.id,
        selectedOptionId: selectedId,
        isCorrect,
        correctOptionId: correctOpt.id,
        correctOptionText: correctOpt.text,
      });
    }

    const score = quiz.questions.length > 0
      ? Math.round((correctCount / quiz.questions.length) * 100)
      : 0;
    const passed = score >= quiz.minPassingScore;
    const attemptNumber = previousAttempts + 1;
    const attemptsRemaining = quiz.maxAttempts === null
      ? null
      : quiz.maxAttempts - attemptNumber;

    const answers = dto.answers.map((a) => ({
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
    }));

    const submission = await this.prisma.quizSubmission.create({
      data: {
        quizId,
        studentId: user.userId,
        companyId: user.companyId,
        answers,
        score,
        passed,
        attemptNumber,
      },
    });

    let certificateIssued = false;
    if (passed && quiz.course.issueCertificate) {
      const student = await this.prisma.user.findUnique({
        where: { id: user.userId },
        select: { name: true },
      });

      certificateIssued = await this.certificates.createIfNotExists({
        studentId: user.userId,
        courseId: quiz.courseId,
        companyId: user.companyId,
        studentName: student?.name ?? '',
        courseName: quiz.course.title,
        teacherName: quiz.course.teacher.name,
      });
    }

    const result: Record<string, unknown> = {
      submissionId: submission.id,
      score,
      passed,
      attemptNumber,
      attemptsRemaining,
      certificateIssued,
    };

    return result;
  }

  // ─── getSubmissions ────────────────────────────────────────────────────────

  async getSubmissions(quizId: string, user: AuthenticatedUser) {
    const quiz = await this.assertQuizAccess(quizId, user);

    const where: Record<string, unknown> = { quizId };

    if (user.role === Role.STUDENT) {
      where['studentId'] = user.userId;
    } else if (user.role === Role.PROFESSOR && quiz.course.teacherId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.quizSubmission.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
