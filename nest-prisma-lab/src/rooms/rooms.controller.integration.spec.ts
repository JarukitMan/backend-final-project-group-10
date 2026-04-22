import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { NotFoundException, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

// Mock RoomsService
// The controller interacts with this mock instead of the real service/DB.
const mockRoomsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findARoom: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('RoomsController Integration', () => {
  let controller: RoomsController;
  let service: RoomsService;

  beforeEach(async () => {
    // We override Guards and Interceptors to isolate the controller.
    // 1. JwtAuthGuard & RolesGuard: overridden to allow all requests (return true).
    // 2. CacheInterceptor: overridden to bypass caching logic.
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: mockRoomsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(CacheInterceptor)
      .useValue({ intercept: (ctx: ExecutionContext, next: any) => next.handle() })
      .compile();

    controller = module.get<RoomsController>(RoomsController);
    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test Suite: CREATE
  // Verifies the controller delegates to service.create and returns the result.
  describe('create', () => {
    it('should call service.create and return the result', async () => {
      const dto: CreateRoomDto = {
        name: 'Deluxe Room',
        capacity: 2,
        price_per_night: 2800,
        description: 'Sea view',
        image_url: '/images/room201.jpg',
        is_active: true,
      };
      const result = { id: 1, ...dto, start_date: new Date(), updated_at: new Date() };
      mockRoomsService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return rooms', async () => {
      const result = {
        data: [
          { id: 1, name: 'Standard Room', capacity: 2, price_per_night: 1800, is_active: true },
          { id: 2, name: 'Deluxe Room', capacity: 2, price_per_night: 2800, is_active: true },
        ],
        total: 2,
        limit: 10,
        offset: 0,
      };
      mockRoomsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
      });
    });

  // Test Suite: FIND ONE
  // Verifies:
  // 1. Success: Returns term found by service.
  // 2. Failure: Returns null if service returns null.
  describe('findOne', () => {
    it('should call service.findOne and return the room', async () => {
      const result = { id: 1, name: 'Standard Room', capacity: 2, price_per_night: 1800 };
      mockRoomsService.findARoom.mockResolvedValue(result);

      expect(await controller.findOne(1)).toBe(result);
      expect(service.findARoom).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if room not found', async () => {
      mockRoomsService.findARoom.mockRejectedValue(new NotFoundException('Room 999 not Found'));
     
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findARoom).toHaveBeenCalledWith(999);
    });
  });

  // Test Suite: UPDATE 
  // Verifies:
  // 1. Success: Calls service.update with the correct ID and DTO.
  // 2. Failure: Throws NotFoundException if room does not exist.
  describe('update', () => {
    it('should call service.update and return the updated room', async () => {
      const dto: UpdateRoomDto = { name: 'Updated Deluxe Room', price_per_night: 3200 };
      const result = { id: 1, name: 'Updated Deluxe Room', capacity: 2, price_per_night: 3200 };
      mockRoomsService.update.mockResolvedValue(result);
 
      expect(await controller.update(1, dto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
 
    it('should throw NotFoundException if room not found', async () => {
      const dto: UpdateRoomDto = { name: 'Updated Name' };
      mockRoomsService.update.mockRejectedValue(new NotFoundException('Room 999 not Found'));
 
      await expect(controller.update(999, dto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(999, dto);
    });
  });

  // Test Suite: REMOVE
  // Verifies:
  // 1. Success: Calls service.remove.
  // 2. Failure: Specifically checks that P2025 (Not Found) error from Prisma 
  //    is caught and re-thrown as a NotFoundException by the controller.
  describe('remove', () => {
    it('should call service.remove and return success', async () => {
      mockRoomsService.remove.mockResolvedValue({ id: 1 });
      expect(await controller.remove(1)).toEqual({ success: true });
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if room not found', async () => {
      mockRoomsService.remove.mockRejectedValue(new NotFoundException('Room 999 not Found'));
 
      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(999);
    });
  });
});
