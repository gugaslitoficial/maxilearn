import { IsOptional, IsString } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  studentId: string;

  @IsString()
  courseId: string;

  @IsString()
  @IsOptional()
  courseDuration?: string;
}
