import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ModulesService } from './modules.service';
import { LessonsService } from './lessons.service';
import { CoursesController } from './courses.controller';
import { ModulesController } from './modules.controller';
import { LessonsController } from './lessons.controller';
import { ProgressController } from './progress.controller';

@Module({
  providers: [CoursesService, ModulesService, LessonsService],
  controllers: [CoursesController, ModulesController, LessonsController, ProgressController],
  exports: [CoursesService],
})
export class CoursesModule {}
