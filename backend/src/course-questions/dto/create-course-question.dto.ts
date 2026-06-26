import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCourseQuestionDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  question: string;
}
