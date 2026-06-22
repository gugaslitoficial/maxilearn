import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { LessonsService } from './lessons.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class ProgressController {
  constructor(private readonly lessons: LessonsService) {}

  @Patch(':lessonId/progress')
  updateProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.lessons.updateProgress(lessonId, user, dto);
  }
}
