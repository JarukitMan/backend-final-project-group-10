import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotAcceptableException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { BookDto } from './dto/book.dto';

describe('BookingService', () => {
  let service: BookingService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrisma = {
    bookings: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  describe('book', () => {
    it('should create a booking when no overlapping booking exists', async () => {
      const dto: BookDto = { room_id: 1, start_date: new Date('2026-06-01'), end_date: new Date('2026-06-05') };
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      mockJwt.verify.mockReturnValue({ sub: 1 });
      mockPrisma.bookings.findFirst.mockResolvedValue(null);
      mockPrisma.bookings.create.mockResolvedValue({ id: 1, user_id: 1, room_id: 1, start_date: dto.start_date, end_date: dto.end_date });

      const result = await service.book(mockReq as any, dto);

      expect(mockPrisma.bookings.findFirst).toHaveBeenCalled();
      expect(mockPrisma.bookings.create).toHaveBeenCalledWith({
        data: { user_id: 1, room_id: 1, start_date: dto.start_date, end_date: dto.end_date }
      });
      expect(result).toEqual({ id: 1, user_id: 1, room_id: 1, start_date: dto.start_date, end_date: dto.end_date });
    });

    it('should throw NotAcceptableException if booking overlaps with existing booking', async () => {
      const dto: BookDto = { room_id: 1, start_date: new Date('2026-06-01'), end_date: new Date('2026-06-05') };
      const mockReq = {
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      mockJwt.verify.mockReturnValue({ sub: 1 });
      mockPrisma.bookings.findFirst.mockResolvedValue({ id: 99 });

      await expect(service.book(mockReq as any, dto)).rejects.toThrow(NotAcceptableException);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const dto: BookDto = { room_id: 1, start_date: new Date(), end_date: new Date() };
      const mockReq = { headers: { authorization: 'Bearer bad-token' } };

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.book(mockReq as any, dto)).rejects.toThrow(UnauthorizedException);
    });

    describe('unbook', () => {
      it('should throw NotFoundException if trying to delete someone else\'s booking', async () => {
        const dto = { room_id: 99 }; 
        const mockReq = { headers: { authorization: 'Bearer user-1' } };

        mockJwt.verify.mockReturnValue({ sub: 1 });
        // Simulate finding NO booking for this user_id + booking_id combo
        mockPrisma.bookings.findFirst.mockResolvedValue(null);

        await expect(service.unbook(mockReq as any, dto as any)).rejects.toThrow(NotFoundException);
      });
    });

  });
});