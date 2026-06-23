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
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ReorderQuestionsDto } from './dto/reorder-questions.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { ListQuizzesDto } from './dto/list-quizzes.dto';

@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: ListQuizzesDto) {
    return this.quizzes.findAll(user, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.quizzes.findOne(id, user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.PROFESSOR)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateQuizDto) {
    return this.quizzes.create(user, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizzes.update(id, user, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.quizzes.remove(id, user);
  }

  // ─── Questions ─────────────────────────────────────────────────────────────

  // Static route must come before :questionId to avoid ambiguity
  @Patch(':id/questions/reorder')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  reorderQuestions(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderQuestionsDto,
  ) {
    return this.quizzes.reorderQuestions(id, user, dto);
  }

  @Post(':id/questions')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  addQuestion(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizzes.addQuestion(id, user, dto);
  }

  @Patch(':id/questions/:questionId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  updateQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.quizzes.updateQuestion(id, questionId, user, dto);
  }

  @Delete(':id/questions/:questionId')
  @Roles(Role.ADMIN, Role.PROFESSOR)
  removeQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.quizzes.removeQuestion(id, questionId, user);
  }

  // ─── Submissions ───────────────────────────────────────────────────────────

  @Post(':id/submit')
  @Roles(Role.STUDENT)
  submit(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitQuizDto,
  ) {
    return this.quizzes.submit(id, user, dto);
  }

  @Get(':id/submissions')
  getSubmissions(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.quizzes.getSubmissions(id, user);
  }
}
