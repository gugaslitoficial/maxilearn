import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  jobTitle: true,
  bio: true,
  avatarUrl: true,
  lastAccessAt: true,
  createdAt: true,
  companyId: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    companyId: string,
    query: { page?: number; perPage?: number; search?: string; role?: Role; isActive?: boolean },
  ) {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;
    const skip = (page - 1) * perPage;

    const where: Record<string, unknown> = { companyId };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          ...USER_SELECT,
          _count: { select: { courses: true, enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = users.map(({ _count, ...u }) => ({
      ...u,
      courseCount:
        u.role === Role.PROFESSOR ? _count.courses
        : u.role === Role.STUDENT  ? _count.enrollments
        : 0,
    }));

    return { data, total, page, perPage };
  }

  async findOne(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async create(companyId: string, dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('E-mail já cadastrado.');

    const password = dto.password ?? this.generateTempPassword();
    const passwordHash = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: { name: dto.name, email: dto.email, role: dto.role, companyId, passwordHash },
      select: USER_SELECT,
    });
  }

  async update(id: string, companyId: string, dto: UpdateUserDto) {
    await this.findOne(id, companyId);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    });
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: USER_SELECT,
    });
  }

  async updateMyPassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Senha atual incorreta.');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { message: 'Senha atualizada com sucesso.' };
  }

  async resetPassword(id: string, companyId: string, newPassword: string) {
    await this.findOne(id, companyId);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { message: 'Senha redefinida com sucesso.' };
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return { message: 'Usuário desativado.' };
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-10) + 'A1!';
  }
}
