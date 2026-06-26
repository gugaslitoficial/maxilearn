import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CreateCourseQuestionDto } from './dto/create-course-question.dto';
import { CreateReplyDto } from './dto/create-reply.dto';

@Injectable()
export class CourseQuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async findByLesson(lessonId: string, user: AuthenticatedUser) {
    return this.prisma.courseQuestion.findMany({
      where: { lessonId, companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, role: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, avatarUrl: true, role: true } },
          },
        },
      },
    });
  }

  async create(user: AuthenticatedUser, dto: CreateCourseQuestionDto) {
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, companyId: user.companyId },
      select: { id: true, teacherId: true, title: true },
    });
    if (!course) throw new NotFoundException('Course not found');

    const question = await this.prisma.courseQuestion.create({
      data: {
        courseId: dto.courseId,
        lessonId: dto.lessonId,
        authorId: user.userId,
        companyId: user.companyId,
        question: dto.question,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, role: true } },
        replies: {
          include: { author: { select: { id: true, name: true, avatarUrl: true, role: true } } },
        },
      },
    });

    // Notify professor if student asks
    if (user.role === Role.STUDENT && course.teacherId !== user.userId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: dto.lessonId },
        select: { title: true },
      });
      await this.notifications.create({
        userId: course.teacherId,
        companyId: user.companyId,
        type: 'NEW_QUESTION',
        title: 'Nova dúvida no curso',
        body: `${user.userId} perguntou na aula "${lesson?.title ?? dto.lessonId}"`,
        metadata: { courseId: dto.courseId, lessonId: dto.lessonId, questionId: question.id },
      }).catch(() => {});
    }

    return question;
  }

  async reply(questionId: string, user: AuthenticatedUser, dto: CreateReplyDto) {
    const question = await this.prisma.courseQuestion.findFirst({
      where: { id: questionId, companyId: user.companyId },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!question) throw new NotFoundException('Question not found');

    const reply = await this.prisma.courseQuestionReply.create({
      data: {
        questionId,
        authorId: user.userId,
        body: dto.body,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, role: true } },
      },
    });

    // Notify original question author if someone else replies
    if (question.authorId !== user.userId) {
      await this.notifications.create({
        userId: question.authorId,
        companyId: user.companyId,
        type: 'QUESTION_ANSWERED',
        title: 'Sua dúvida foi respondida',
        body: dto.body.slice(0, 120),
        metadata: { questionId, courseId: question.courseId, lessonId: question.lessonId },
      }).catch(() => {});
    }

    return reply;
  }

  async remove(questionId: string, user: AuthenticatedUser) {
    const question = await this.prisma.courseQuestion.findFirst({
      where: { id: questionId, companyId: user.companyId },
    });
    if (!question) throw new NotFoundException('Question not found');

    if (question.authorId !== user.userId && user.role === Role.STUDENT) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.courseQuestion.delete({ where: { id: questionId } });
    return { message: 'Question deleted' };
  }
}
