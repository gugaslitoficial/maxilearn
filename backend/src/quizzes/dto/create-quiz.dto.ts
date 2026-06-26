import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuizStatus } from '@prisma/client';
import { CreateQuestionDto } from './create-question.dto';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsOptional()
  lessonId?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  minPassingScore?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxAttempts?: number | null;

  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean;

  @IsBoolean()
  @IsOptional()
  showAnswersAfter?: boolean;

  @IsEnum(QuizStatus)
  @IsOptional()
  status?: QuizStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsOptional()
  questions?: CreateQuestionDto[];
}
