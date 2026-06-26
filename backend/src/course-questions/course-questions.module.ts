import { Module } from '@nestjs/common';
import { CourseQuestionsController } from './course-questions.controller';
import { CourseQuestionsService } from './course-questions.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CourseQuestionsController],
  providers: [CourseQuestionsService],
})
export class CourseQuestionsModule {}
