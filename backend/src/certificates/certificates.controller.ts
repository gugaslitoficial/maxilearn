import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CertificatesService } from './certificates.service';
import { ListCertificatesDto } from './dto/list-certificates.dto';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@Controller('certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: ListCertificatesDto) {
    return this.certificates.findAll(user, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.certificates.findOne(id, user);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCertificateDto) {
    return this.certificates.create(user, dto);
  }
}
