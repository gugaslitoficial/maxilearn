import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderDto } from './dto/reorder.dto';

@Controller('courses/:courseId/modules/:moduleId/lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.lessons.findAll(courseId, moduleId, user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.PROFESSOR)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.lessons.create(courseId, moduleId, user, dto);
  }

  @Patch('reorder')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  reorder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: ReorderDto,
  ) {
    return this.lessons.reorder(courseId, moduleId, user, dto);
  }

  @Patch(':lessonId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.lessons.update(courseId, moduleId, lessonId, user, dto);
  }

  @Delete(':lessonId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.lessons.remove(courseId, moduleId, lessonId, user);
  }
}
