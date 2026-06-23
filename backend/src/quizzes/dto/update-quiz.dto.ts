import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { QuizStatus } from '@prisma/client';

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  title?: string;

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
}
