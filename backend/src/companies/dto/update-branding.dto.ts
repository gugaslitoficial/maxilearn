import { IsOptional, IsString, Matches } from 'class-validator';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export class UpdateBrandingDto {
  @IsString()
  @IsOptional()
  platformName?: string;

  @Matches(HEX_COLOR, { message: 'primaryColor deve ser um hex válido (#RRGGBB)' })
  @IsOptional()
  primaryColor?: string;

  @Matches(HEX_COLOR, { message: 'secondaryColor deve ser um hex válido (#RRGGBB)' })
  @IsOptional()
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  loginBackgroundUrl?: string;

  @IsString()
  @IsOptional()
  faviconUrl?: string;
}
