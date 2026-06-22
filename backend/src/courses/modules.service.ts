import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ReorderDto } from './dto/reorder.dto';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCourseAccess(courseId: string, user: AuthenticatedUser) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.companyId !== user.companyId) throw new NotFoundException('Course not found');
    if (user.role === Role.PROFESSOR && course.teacherId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }
    return course;
  }

  async findAll(courseId: string, user: AuthenticatedUser) {
    await this.assertCourseAccess(courseId, user);
    return this.prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        order: true,
        _count: { select: { lessons: true } },
      },
    });
  }

  async create(courseId: string, user: AuthenticatedUser, dto: CreateModuleDto) {
    await this.assertCourseAccess(courseId, user);

    const last = await this.prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return this.prisma.module.create({
      data: { title: dto.title, courseId, order: (last?.order ?? 0) + 1 },
    });
  }

  async update(courseId: string, moduleId: string, user: AuthenticatedUser, dto: UpdateModuleDto) {
    await this.assertCourseAccess(courseId, user);
    const mod = await this.prisma.module.findFirst({ where: { id: moduleId, courseId } });
    if (!mod) throw new NotFoundException('Module not found');
    return this.prisma.module.update({ where: { id: moduleId }, data: dto });
  }

  async reorder(courseId: string, user: AuthenticatedUser, dto: ReorderDto) {
    await this.assertCourseAccess(courseId, user);
    await this.prisma.$transaction(
      dto.ids.map((id, index) => this.prisma.module.update({ where: { id }, data: { order: index + 1 } })),
    );
    return { message: 'Reordered' };
  }

  async remove(courseId: string, moduleId: string, user: AuthenticatedUser) {
    await this.assertCourseAccess(courseId, user);
    const mod = await this.prisma.module.findFirst({ where: { id: moduleId, courseId } });
    if (!mod) throw new NotFoundException('Module not found');
    await this.prisma.module.delete({ where: { id: moduleId } });
    return { message: 'Module deleted' };
  }
}
