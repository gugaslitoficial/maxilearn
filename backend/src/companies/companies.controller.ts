import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Get('me')
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.companies.findMe(user.companyId);
  }

  @Patch('me')
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateCompanyDto) {
    return this.companies.update(user.companyId, dto);
  }

  @Patch('me/branding')
  updateBranding(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateBrandingDto) {
    return this.companies.updateBranding(user.companyId, dto);
  }
}
