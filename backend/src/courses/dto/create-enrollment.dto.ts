import { IsOptional, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  @IsOptional()
  studentId?: string;
}
