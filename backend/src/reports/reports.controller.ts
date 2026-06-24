import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import { ProfessorStudentsQueryDto, ReportQueryDto } from './dto/report-query.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  // ── Admin ─────────────────────────────────────────────────────────────────────

  @Get('admin/overview')
  @Roles(Role.ADMIN)
  adminOverview(@CurrentUser() user: AuthenticatedUser, @Query() q: ReportQueryDto) {
    return this.reports.adminOverview(user, q.period ?? 30);
  }

  @Get('admin/users')
  @Roles(Role.ADMIN)
  adminUsers(@CurrentUser() user: AuthenticatedUser, @Query() q: ReportQueryDto) {
    return this.reports.adminUsers(user, q.period ?? 30);
  }

  @Get('admin/courses')
  @Roles(Role.ADMIN)
  adminCourses(@CurrentUser() user: AuthenticatedUser, @Query() q: ReportQueryDto) {
    return this.reports.adminCourses(user, q.period ?? 30);
  }

  @Get('admin/export')
  @Roles(Role.ADMIN)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="relatorio.csv"')
  adminExport(@CurrentUser() user: AuthenticatedUser, @Query() q: ReportQueryDto) {
    return this.reports.adminExport(user, q.period ?? 30);
  }

  // ── Professor ─────────────────────────────────────────────────────────────────

  @Get('professor/overview')
  @Roles(Role.PROFESSOR)
  professorOverview(@CurrentUser() user: AuthenticatedUser) {
    return this.reports.professorOverview(user);
  }

  @Get('professor/students')
  @Roles(Role.PROFESSOR)
  professorStudents(
    @CurrentUser() user: AuthenticatedUser,
    @Query() q: ProfessorStudentsQueryDto,
  ) {
    return this.reports.professorStudents(user, q.courseId);
  }

  // ── Student ───────────────────────────────────────────────────────────────────

  @Get('student/overview')
  @Roles(Role.STUDENT)
  studentOverview(@CurrentUser() user: AuthenticatedUser) {
    return this.reports.studentOverview(user);
  }
}
