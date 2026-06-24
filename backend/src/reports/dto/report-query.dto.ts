import { IsOptional, IsIn, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ReportQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsIn([7, 30, 90])
  period?: number = 30;
}

export class ProfessorStudentsQueryDto {
  @IsOptional()
  @IsString()
  courseId?: string;
}
