import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['video', 'quiz', 'file'])
  @IsOptional()
  type?: string;

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;
}
