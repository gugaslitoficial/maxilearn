import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ReorderDto } from './dto/reorder.dto';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertModuleAccess(courseId: string, moduleId: string, user: AuthenticatedUser) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.companyId !== user.companyId) throw new NotFoundException('Course not found');
    if (user.role === Role.PROFESSOR && course.teacherId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }
    const mod = await this.prisma.module.findFirst({ where: { id: moduleId, courseId } });
    if (!mod) throw new NotFoundException('Module not found');
    return mod;
  }

  async findAll(courseId: string, moduleId: string, user: AuthenticatedUser) {
    await this.assertModuleAccess(courseId, moduleId, user);
    return this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    });
  }

  async create(courseId: string, moduleId: string, user: AuthenticatedUser, dto: CreateLessonDto) {
    await this.assertModuleAccess(courseId, moduleId, user);

    const last = await this.prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return this.prisma.lesson.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type ?? 'video',
        videoUrl: dto.videoUrl,
        durationMinutes: dto.durationMinutes,
        isFree: dto.isFree ?? false,
        moduleId,
        order: (last?.order ?? 0) + 1,
      },
    });
  }

  async update(
    courseId: string,
    moduleId: string,
    lessonId: string,
    user: AuthenticatedUser,
    dto: UpdateLessonDto,
  ) {
    await this.assertModuleAccess(courseId, moduleId, user);
    const lesson = await this.prisma.lesson.findFirst({ where: { id: lessonId, moduleId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return this.prisma.lesson.update({ where: { id: lessonId }, data: dto });
  }

  async reorder(courseId: string, moduleId: string, user: AuthenticatedUser, dto: ReorderDto) {
    await this.assertModuleAccess(courseId, moduleId, user);
    await this.prisma.$transaction(
      dto.ids.map((id, index) => this.prisma.lesson.update({ where: { id }, data: { order: index + 1 } })),
    );
    return { message: 'Reordered' };
  }

  async remove(courseId: string, moduleId: string, lessonId: string, user: AuthenticatedUser) {
    await this.assertModuleAccess(courseId, moduleId, user);
    const lesson = await this.prisma.lesson.findFirst({ where: { id: lessonId, moduleId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { message: 'Lesson deleted' };
  }

  async updateProgress(lessonId: string, user: AuthenticatedUser, dto: UpdateProgressDto) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    return this.prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId: user.userId, lessonId } },
      create: {
        studentId: user.userId,
        lessonId,
        completed: dto.completed,
        completedAt: dto.completed ? new Date() : null,
      },
      update: {
        completed: dto.completed,
        completedAt: dto.completed ? new Date() : null,
      },
    });
  }
}
