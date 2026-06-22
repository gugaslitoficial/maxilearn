import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { CourseLevel } from '@prisma/client';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsBoolean()
  @IsOptional()
  allowDownload?: boolean;

  @IsBoolean()
  @IsOptional()
  issueCertificate?: boolean;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  minPassingScore?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  objectives?: string[];

  @IsBoolean()
  @IsOptional()
  isRestricted?: boolean;
}
