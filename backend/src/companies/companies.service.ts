import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateBrandingDto } from './dto/update-branding.dto';

const COMPANY_SELECT = {
  id: true,
  name: true,
  cnpj: true,
  segment: true,
  contactEmail: true,
  phone: true,
  site: true,
  platformName: true,
  primaryColor: true,
  secondaryColor: true,
  logoUrl: true,
  loginBackgroundUrl: true,
  faviconUrl: true,
  notifNewUser: true,
  notifCourseDone: true,
  notifInactiveAlert: true,
  secTwoFactor: true,
  secStrongPassword: true,
  secSessionHours: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findMe(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: COMPANY_SELECT,
    });
    if (!company) throw new NotFoundException('Empresa não encontrada.');
    return company;
  }

  async update(companyId: string, dto: UpdateCompanyDto) {
    await this.findMe(companyId);
    return this.prisma.company.update({
      where: { id: companyId },
      data: dto,
      select: COMPANY_SELECT,
    });
  }

  async updateBranding(companyId: string, dto: UpdateBrandingDto) {
    await this.findMe(companyId);
    return this.prisma.company.update({
      where: { id: companyId },
      data: dto,
      select: COMPANY_SELECT,
    });
  }
}
