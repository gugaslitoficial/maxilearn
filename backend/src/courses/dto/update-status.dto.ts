import { IsEnum, IsNotEmpty } from 'class-validator';
import { CourseStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(CourseStatus)
  @IsNotEmpty()
  status: CourseStatus;
}
