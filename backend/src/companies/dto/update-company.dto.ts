import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  cnpj?: string;

  @IsString()
  @IsOptional()
  segment?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  site?: string;

  @IsBoolean()
  @IsOptional()
  notifNewUser?: boolean;

  @IsBoolean()
  @IsOptional()
  notifCourseDone?: boolean;

  @IsBoolean()
  @IsOptional()
  notifInactiveAlert?: boolean;

  @IsBoolean()
  @IsOptional()
  secTwoFactor?: boolean;

  @IsBoolean()
  @IsOptional()
  secStrongPassword?: boolean;

  @IsNumber()
  @Min(0)
  @Max(168)
  @IsOptional()
  secSessionHours?: number;
}
