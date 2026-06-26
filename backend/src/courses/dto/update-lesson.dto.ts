import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['video', 'quiz', 'file'])
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @IsArray()
  @IsOptional()
  materials?: unknown[];
}
