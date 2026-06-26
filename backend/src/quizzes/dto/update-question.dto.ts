import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '@prisma/client';
import { CreateOptionDto } from './create-option.dto';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  statement?: string;

  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @IsInt()
  @Min(2)
  @IsOptional()
  displayCount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @IsOptional()
  options?: CreateOptionDto[];
}
