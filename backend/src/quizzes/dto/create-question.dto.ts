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

export class CreateQuestionDto {
  @IsString()
  statement: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}
