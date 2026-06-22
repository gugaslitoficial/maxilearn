import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail },
    });
    if (exists) throw new BadRequestException('E-mail já cadastrado.');

    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    const { company, user } = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: dto.companyName, cnpj: dto.companyCnpj },
      });
      const user = await tx.user.create({
        data: {
          name: dto.adminName,
          email: dto.adminEmail,
          passwordHash,
          role: Role.ADMIN,
          companyId: company.id,
        },
      });
      return { company, user };
    });

    return {
      user: this.sanitize(user),
      company,
      accessToken: this.signToken(user.id, user.role, user.companyId),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    const valid =
      user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!valid) throw new UnauthorizedException('Credenciais inválidas.');

    return {
      user: this.sanitize(user),
      accessToken: this.signToken(user.id, user.role, user.companyId),
    };
  }

  private signToken(userId: string, role: Role, companyId: string) {
    return this.jwt.sign({ sub: userId, role, companyId });
  }

  private sanitize({ passwordHash: _hash, ...safe }: User): Omit<User, 'passwordHash'> {
    return safe;
  }
}
