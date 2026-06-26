import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CourseQuestionsService } from './course-questions.service';
import { CreateCourseQuestionDto } from './dto/create-course-question.dto';
import { CreateReplyDto } from './dto/create-reply.dto';

@Controller('course-questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseQuestionsController {
  constructor(private readonly service: CourseQuestionsService) {}

  @Get()
  findByLesson(
    @CurrentUser() user: AuthenticatedUser,
    @Query('lessonId') lessonId: string,
  ) {
    return this.service.findByLesson(lessonId, user);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCourseQuestionDto) {
    return this.service.create(user, dto);
  }

  @Post(':id/reply')
  reply(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReplyDto,
  ) {
    return this.service.reply(id, user, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user);
  }
}
