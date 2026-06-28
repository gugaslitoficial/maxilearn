import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { RequestsService } from './requests.service';

class SubmitCertRequestDto {
  courseId!: string;
}

class SubmitRetryRequestDto {
  quizId!: string;
}

class ReviewDto {
  action!: 'approve' | 'reject';
}

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private readonly service: RequestsService) {}

  // ── Certificate requests ───────────────────────────────────────────────────

  @Post('certificate')
  @Roles(Role.STUDENT)
  submitCertificate(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitCertRequestDto) {
    return this.service.submitCertificateRequest(user, dto.courseId);
  }

  @Get('certificate')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  listCertificates(@CurrentUser() user: AuthenticatedUser) {
    return this.service.listCertificateRequests(user);
  }

  @Patch('certificate/:id/review')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  reviewCertificate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ReviewDto,
  ) {
    return this.service.reviewCertificateRequest(user, id, dto.action);
  }

  // ── Quiz retry requests ────────────────────────────────────────────────────

  @Post('quiz-retry')
  @Roles(Role.STUDENT)
  submitRetry(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitRetryRequestDto) {
    return this.service.submitQuizRetryRequest(user, dto.quizId);
  }

  @Get('quiz-retry')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  listRetries(@CurrentUser() user: AuthenticatedUser) {
    return this.service.listQuizRetryRequests(user);
  }

  @Patch('quiz-retry/:id/review')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  reviewRetry(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ReviewDto,
  ) {
    return this.service.reviewQuizRetryRequest(user, id, dto.action);
  }
}
