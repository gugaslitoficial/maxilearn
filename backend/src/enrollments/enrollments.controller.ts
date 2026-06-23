import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { ListEnrollmentsDto } from './dto/list-enrollments.dto';
import { BulkApproveDto } from './dto/bulk-approve.dto';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollments: EnrollmentsService) {}

  @Post()
  @Roles(Role.STUDENT)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateEnrollmentDto) {
    return this.enrollments.create(user, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: ListEnrollmentsDto) {
    return this.enrollments.findAll(user, query);
  }

  // Static routes must be declared before parametric ones
  @Get('pending')
  @Roles(Role.PROFESSOR, Role.ADMIN)
  getPending(@CurrentUser() user: AuthenticatedUser) {
    return this.enrollments.getPending(user);
  }

  @Patch('approve-bulk')
  @Roles(Role.PROFESSOR, Role.ADMIN)
  bulkApprove(@CurrentUser() user: AuthenticatedUser, @Body() dto: BulkApproveDto) {
    return this.enrollments.bulkApprove(user, dto);
  }

  @Patch(':id/approve')
  @Roles(Role.PROFESSOR, Role.ADMIN)
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.enrollments.approve(id, user);
  }

  @Patch(':id/revoke')
  @Roles(Role.PROFESSOR, Role.ADMIN)
  revoke(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.enrollments.revoke(id, user);
  }

  @Patch(':id/reject')
  @Roles(Role.PROFESSOR, Role.ADMIN)
  reject(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.enrollments.reject(id, user);
  }
}
