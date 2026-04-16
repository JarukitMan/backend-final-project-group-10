import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const prisma = {
    notifications: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsService(prisma);
  });

  it('creates notification event', async () => {
    prisma.notifications.create.mockResolvedValue({ id: 1 });

    const result = await service.createEvent({
      userId: 10,
      bookingId: 22,
      type: 'CREATED',
      title: 'Booking created',
      message: 'Booking #22 created',
    });

    expect(result).toEqual({ id: 1 });
    expect(prisma.notifications.create).toHaveBeenCalled();
  });

  it('throws when marking unknown notification as read', async () => {
    prisma.notifications.findFirst.mockResolvedValue(null);

    await expect(service.markAsRead(999, 1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns unread count', async () => {
    prisma.notifications.count.mockResolvedValue(3);

    const result = await service.unreadCount(2);

    expect(result).toEqual({ unreadCount: 3 });
  });
});
