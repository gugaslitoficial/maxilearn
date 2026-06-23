import { IsArray, IsString } from 'class-validator';

export class BulkApproveDto {
  @IsArray()
  @IsString({ each: true })
  enrollmentIds: string[];
}
