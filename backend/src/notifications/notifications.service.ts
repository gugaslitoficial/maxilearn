import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthenticatedUser) {
    return this.prisma.notification.findMany({
      where: { userId: user.userId, companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, user: AuthenticatedUser) {
    return this.prisma.notification.updateMany({
      where: { id, userId: user.userId },
      data: { read: true },
    });
  }

  async markAllAsRead(user: AuthenticatedUser) {
    return this.prisma.notification.updateMany({
      where: { userId: user.userId, read: false },
      data: { read: true },
    });
  }

  async create(data: {
    userId: string;
    companyId: string;
    type: string;
    title: string;
    body?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        companyId: data.companyId,
        type: data.type,
        title: data.title,
        body: data.body,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
      },
    });
  }
}
