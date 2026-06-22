import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CourseStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('search') search?: string,
    @Query('status') status?: CourseStatus,
    @Query('category') category?: string,
  ) {
    return this.courses.findAll(user, { page, perPage, search, status, category });
  }

  @Post()
  @Roles(Role.ADMIN, Role.PROFESSOR)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCourseDto) {
    return this.courses.create(user, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.courses.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courses.update(id, user, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.courses.updateStatus(id, user, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.courses.remove(id, user);
  }

  @Get(':id/progress')
  @Roles(Role.STUDENT)
  getProgress(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.courses.getProgress(id, user);
  }

  @Post(':id/enrollments')
  createEnrollment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.courses.createEnrollment(id, user, dto);
  }
}
