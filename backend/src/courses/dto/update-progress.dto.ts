import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateProgressDto {
  @IsBoolean()
  @IsNotEmpty()
  completed: boolean;
}
