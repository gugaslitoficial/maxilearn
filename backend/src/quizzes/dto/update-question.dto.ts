import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @IsOptional()
  options?: CreateOptionDto[];
}
