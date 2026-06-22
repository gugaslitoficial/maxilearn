import { IsOptional, IsString } from 'class-validator';

export class UpdateModuleDto {
  @IsString()
  @IsOptional()
  title?: string;
}
