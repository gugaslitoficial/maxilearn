import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ReorderDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  ids: string[];
}
