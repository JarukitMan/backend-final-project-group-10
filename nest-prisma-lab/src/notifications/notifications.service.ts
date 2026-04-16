import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationListResponseDto,
  NotificationTypeDto,
} from './dto/notification-query.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(params: {
    userId: number;
    bookingId?: number;
    type: NotificationTypeDto;
    title: string;
    message: string;
  }) {
    return this.prisma.notifications.create({
      data: {
        user_id: params.userId,
        booking_id: params.bookingId,
        type: params.type,
        title: params.title,
        message: params.message,
      },
    });
  }

  async findMine(
    userId: number,
    page = 1,
    limit = 10,
    unreadOnly = false,
  ): Promise<NotificationListResponseDto> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where = unreadOnly
      ? { user_id: userId, is_read: false }
      : { user_id: userId };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notifications.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: safeLimit,
      }),
      this.prisma.notifications.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async markAsRead(notificationId: number, userId: number) {
    const found = await this.prisma.notifications.findFirst({
      where: { id: notificationId, user_id: userId },
    });

    if (!found) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notifications.update({
      where: { id: notificationId },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  async markAllAsRead(userId: number) {
    const result = await this.prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return result;
  }

  async unreadCount(userId: number) {
    const unreadCount = await this.prisma.notifications.count({
      where: { user_id: userId, is_read: false },
    });

    return { unreadCount };
  }
}
