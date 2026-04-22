import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { BadRequestException, NotFoundException} from '@nestjs/common';

const mockPrismaService = {
  rooms: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
};

describe('RoomsService', () => {
  let service: RoomsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsService,
      {provide: PrismaService, useValue: mockPrismaService },
    ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  // Test Suite for creating a room
  // Verifies that:
  // 1. The service transforms DTO string dates into Date objects.
  // 2. It calls Prisma with the correct data structure.
  describe('create', () => {
    it('should create a room with successfully', async () => {
      const dto: CreateRoomDto = {
        name: 'Deluxe Room',
        capacity: 2,
        price_per_night: 2800,
        description: 'Sea view',
        image_url: '/images/room201.jpg',
        is_active: true,
      };

      const result = { id: 1, ...dto, created_at: new Date(), updated_at: new Date() };
      mockPrismaService.rooms.create.mockResolvedValue(result);

      expect(await service.create(dto)).toEqual(result);
      expect(prisma.rooms.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
            name: dto.name,
            capacity: dto.capacity,
            price_per_night: dto.price_per_night,
        }),
      });
    });
    it('should throw BadRequestException if room name already exists', async () => {
      const dto = { name: 'Deluxe Room', capacity: 2, price_per_night: 2800 };
      mockPrismaService.rooms.create.mockRejectedValue(
        new Error('unique constraint failed'),
      );
 
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });
  });


  // Test Suite for retrieving all roomss
  // Verifies that the service simply delegates to prisma.rooms.findMany.
  describe('findAll', () => {
  it('should return all of rooms', async () => {
    const rooms = [
      { id: 1, name: 'Standard Room', capacity: 2, price_per_night: 1800, is_active: true },
      { id: 2, name: 'Deluxe Room', capacity: 2, price_per_night: 2800, is_active: true },
    ];

    // Mock prisma to return the array directly
    mockPrismaService.rooms.findMany.mockResolvedValue(rooms);

    const result = await service.findAll();
    expect(result).toEqual(rooms); 
    expect(prisma.rooms.findMany).toHaveBeenCalled();
  });
});
  // describe('findAll', () => {
  //   it('should return all of roomss', async () => {
  //     const rooms = [
  //       { id: 1, name: 'Standard Room', capacity: 2, price_per_night: 1800, is_active: true },
  //       { id: 2, name: 'Deluxe Room', capacity: 2, price_per_night: 2800, is_active: true },
  //     ];
  //     mockPrismaService.rooms.findMany.mockResolvedValue(rooms);
  //     mockPrismaService.rooms.count.mockResolvedValue(2);
      
  //     const result = await service.findAll();
  //     expect(result.data).toEqual(rooms);
  //     expect(result.total).toBe(2);
  //     expect(result.limit).toBe(10);
  //     expect(result.offset).toBe(0);
  //   });
  //    it('should filter by is_active', async () => {
  //     const activeRooms = [
  //       { id: 1, name: 'Standard Room', is_active: true },
  //     ];
  //     mockPrismaService.rooms.findMany.mockResolvedValue(activeRooms);
  //     mockPrismaService.rooms.count.mockResolvedValue(1);
 
  //     const result = await service.findAll({ is_active: true });
  //     expect(result.data).toEqual(activeRooms);
  //     expect(prisma.rooms.findMany).toHaveBeenCalledWith(
  //       expect.objectContaining({ where: { is_active: true } }),
  //     );
  //   });
 
  //   it('should filter by price range', async () => {
  //     mockPrismaService.rooms.findMany.mockResolvedValue([]);
  //     mockPrismaService.rooms.count.mockResolvedValue(0);
 
  //     await service.findAll({ min_price: 1000, max_price: 3000 });
  //     expect(prisma.rooms.findMany).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         where: { price_per_night: { gte: 1000, lte: 3000 } },
  //       }),
  //     );
  //   });
  // });

  // Test Suite for retrieving a single rooms
  // Verifies:
  // 1. Success: Returns the rooms when found.
  // 2. Failure: Returns null when the ID does not exist.
  describe('findARoom', () => {
    it('should return a single room', async () => {
        const result = { id: 1, name: 'Standard Room'};
        mockPrismaService.rooms.findUnique.mockResolvedValue(result);
  
        expect(await service.findARoom(1)).toBe(result);
        expect(prisma.rooms.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if room not found', async () => {
      mockPrismaService.rooms.findUnique.mockResolvedValue(null);

      await expect(service.findARoom(999)).rejects.toThrow(NotFoundException);
});
  });

  // Test Suite for updating a rooms
  // Verifies:
  // 1. Success: Calls prisma.update with correct ID and data.
  // 2. Failure: Throws an error if the record is not found (simulated rejection).
  describe('update', () => {
    it('should update a rooms', async () => {
      const existing = { id: 1, name: 'Old Name', capacity: 2, price_per_night: 1800 };
      const dto: UpdateRoomDto = { name: 'Updated Name' };
      const result = { ...existing, name: 'Updated Name' };
      
      mockPrismaService.rooms.findUnique.mockResolvedValue(existing);
      mockPrismaService.rooms.update.mockResolvedValue(result);

      expect(await service.update(1, dto)).toBe(result);
      expect(prisma.rooms.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ name: dto.name }),
      });
    });
    it('should throw NotFoundException if room not found', async () => {
      const dto: UpdateRoomDto = { name: 'Updated Name' };
      mockPrismaService.rooms.update.mockRejectedValue(new Error('Record to update not found.'));

      await expect(service.update(999, dto)).rejects.toThrow('Record to update not found.');
    });
  });
  
  // Test Suite for deleting a rooms
  // Verifies:
  // 1. Success: Calls prisma.delete with correct ID.
  // 2. Failure: Throws an error if the record is not found (simulated rejection).
  describe('remove', () => {
      it('should delete a rooms', async () => {
          const room = { id: 1, name: 'Standard Room' };
    mockPrismaService.rooms.findUnique.mockResolvedValue(room);
    mockPrismaService.rooms.delete.mockResolvedValue(room);
    expect(await service.remove(1)).toEqual({ message: 'Room 1 deleted successfully' });
});
    it('should throw if rooms not found', async () => {
        mockPrismaService.rooms.delete.mockRejectedValue(new Error('Record to delete not found.'));

        await expect(service.remove(999)).rejects.toThrow('Record to delete not found.');
    });
  });
});



