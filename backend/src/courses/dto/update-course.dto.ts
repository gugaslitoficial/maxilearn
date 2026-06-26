import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CourseLevel } from '@prisma/client';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  teacherId?: string;

  @IsBoolean()
  @IsOptional()
  allowDownload?: boolean;

  @IsBoolean()
  @IsOptional()
  issueCertificate?: boolean;

  @IsString()
  @IsOptional()
  certificateType?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  minPassingScore?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  minApprovalScore?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  estimatedDurationMinutes?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  objectives?: string[];

  @IsBoolean()
  @IsOptional()
  isRestricted?: boolean;
}
