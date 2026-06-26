import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { CertificatesModule } from './certificates/certificates.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CourseQuestionsModule } from './course-questions/course-questions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    CoursesModule,
    EnrollmentsModule,
    CertificatesModule,
    QuizzesModule,
    ReportsModule,
    NotificationsModule,
    CourseQuestionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
