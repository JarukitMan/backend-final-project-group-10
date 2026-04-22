import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    notifications: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

describe('findMine (Pagination & Filtering)', () => {
    it('should return paginated notifications with correct metadata', async () => {
      const mockData = [{ id: 1, title: 'Test' }];
      const mockTotal = 1;
      
      // Mocking the $transaction return [data, total]
      mockPrisma.$transaction.mockResolvedValue([mockData, mockTotal]);

      const result = await service.findMine(1, 1, 10, false);

      expect(result.data).toEqual(mockData);
      expect(result.pagination.totalPages).toBe(1);
      expect(mockPrisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 })
      );
    });

    it('should apply unreadOnly filter when requested', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.findMine(1, 1, 10, true);

      expect(mockPrisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 1, is_read: false }
        })
      );
    });
  });

  describe('markAsRead (Security & Updates)', () => {
    it('should update a notification if it belongs to the user', async () => {
      mockPrisma.notifications.findFirst.mockResolvedValue({ id: 5, user_id: 1 });
      mockPrisma.notifications.update.mockResolvedValue({ id: 5, is_read: true });

      const result = await service.markAsRead(5, 1);

      expect(result.is_read).toBe(true);
      expect(mockPrisma.notifications.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 5 } })
      );
    });

    it('should throw NotFoundException if notification belongs to someone else', async () => {
      // Notification exists but belongs to user 99
      mockPrisma.notifications.findFirst.mockResolvedValue(null);

      await expect(service.markAsRead(5, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should call updateMany for the specific user only', async () => {
      mockPrisma.notifications.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead(1);

      expect(result.count).toBe(5);
      expect(mockPrisma.notifications.updateMany).toHaveBeenCalledWith({
        where: { user_id: 1, is_read: false },
        data: expect.objectContaining({ is_read: true })
      });
    });
  });
});
