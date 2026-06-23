import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';

export class QuestionOrderItemDto {
  @IsString()
  questionId: string;

  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOrderItemDto)
  questions: QuestionOrderItemDto[];
}
