import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';

describe('NotificationsController Integration', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotificationsService = {
    findMine: jest.fn(),
    markAsRead: jest.fn(),
    unreadCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    })
      // We override guards to simulate an authenticated user context
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('findMine', () => {
    it('should pass query parameters and user ID to the service', async () => {
      const mockReq = { user: { id: 10 } };
      const mockQuery = { page: 2, limit: 5, unreadOnly: true };
      
      await controller.findMine(mockReq as any, mockQuery as any);

      expect(service.findMine).toHaveBeenCalledWith(
        10, // userId from req
        2,  // page from query
        5,  // limit from query
        true // unreadOnly from query
      );
    });
  });

  describe('markAsRead', () => {
    it('should call service with numeric ID from params', async () => {
      const mockReq = { user: { id: 10 } };
      const notificationId = 99;

      await controller.markAsRead(mockReq as any, notificationId);

      expect(service.markAsRead).toHaveBeenCalledWith(99, 10);
    });
  });

  describe('unreadCount', () => {
    it('should return unread count for the authenticated user', async () => {
      const mockReq = { user: { id: 10 } };
      mockNotificationsService.unreadCount.mockResolvedValue({ unreadCount: 3 });

      const result = await controller.unreadCount(mockReq as any);

      expect(result).toEqual({ unreadCount: 3 });
      expect(service.unreadCount).toHaveBeenCalledWith(10);
    });
  });
});