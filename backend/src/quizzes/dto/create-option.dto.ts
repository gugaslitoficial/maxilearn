import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateOptionDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}
