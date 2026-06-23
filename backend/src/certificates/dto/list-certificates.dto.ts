import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCertificatesDto {
  @IsString()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  perPage?: number;
}
