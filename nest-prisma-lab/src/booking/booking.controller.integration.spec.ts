import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookDto } from './dto/book.dto';
import { UnbookDto } from './dto/unbook.dto';
import { EditBookingDto, BookingStatus } from './dto/edit-booking.dto';
import { NotAcceptableException, NotFoundException, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

// Mock BookingService
const mockBookingService = {
  book: jest.fn(),
  unbook: jest.fn(),
  my_bookings: jest.fn(),
  all_bookings: jest.fn(),
  edit_booking: jest.fn(),
};

describe('BookingController Integration', () => {
  let controller: BookingController;
  let service: BookingService;

  beforeEach(async () => {
    // Override Guards and Interceptors to isolate the controller
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
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

    controller = module.get<BookingController>(BookingController);
    service = module.get<BookingService>(BookingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test Suite: BOOK
  describe('book', () => {
    it('should call service.book and return the result', async () => {
      const dto: BookDto = {
        room_id: 1,
        start_date: new Date('2026-06-01'),
        end_date: new Date('2026-06-05'),
      };
      const mockReq = { headers: { authorization: 'Bearer token' } };
      const result = {
        id: 1,
        user_id: 1,
        room_id: 1,
        start_date: dto.start_date,
        end_date: dto.end_date,
        status: BookingStatus.Pending,
      };

      mockBookingService.book.mockResolvedValue(result);

      expect(await controller.book(mockReq as any, dto)).toBe(result);
      expect(service.book).toHaveBeenCalledWith(mockReq, dto);
    });

    it('should throw NotAcceptableException when booking overlaps', async () => {
      const dto: BookDto = {
        room_id: 1,
        start_date: new Date('2026-06-01'),
        end_date: new Date('2026-06-05'),
      };
      const mockReq = { headers: { authorization: 'Bearer token' } };

      mockBookingService.book.mockRejectedValue(
        new NotAcceptableException('This booking overlaps with a pre-existing booking.')
      );

      await expect(controller.book(mockReq as any, dto)).rejects.toThrow(NotAcceptableException);
      expect(service.book).toHaveBeenCalledWith(mockReq, dto);
    });
  });

  // Test Suite: UNBOOK
  describe('unbook', () => {
    it('should call service.unbook and return the result', async () => {
      const dto: UnbookDto = {
        room_id: 1,
      };
      const mockReq = { headers: { authorization: 'Bearer token' } };
      const result = {
        id: 1,
        user_id: 1,
        room_id: 1,
        start_date: new Date('2026-06-01'),
        end_date: new Date('2026-06-05'),
        status: BookingStatus.Cancelled,
      };

      mockBookingService.unbook.mockResolvedValue(result);

      expect(await controller.unbook(mockReq as any, dto)).toBe(result);
      expect(service.unbook).toHaveBeenCalledWith(mockReq, dto);
    });

    it('should throw NotFoundException when booking not found', async () => {
      const dto: UnbookDto = {
        room_id: 999,
      };
      const mockReq = { headers: { authorization: 'Bearer token' } };

      mockBookingService.unbook.mockRejectedValue(
        new NotFoundException('Booking Not Found')
      );

      await expect(controller.unbook(mockReq as any, dto)).rejects.toThrow(NotFoundException);
      expect(service.unbook).toHaveBeenCalledWith(mockReq, dto);
    });
  });

  // Test Suite: MY BOOKINGS
  describe('my_bookings', () => {
    it('should call service.my_bookings and return user bookings', async () => {
      const mockReq = { headers: { authorization: 'Bearer token' } };
      const result = [
        {
          id: 1,
          user_id: 1,
          room_id: 1,
          start_date: new Date('2026-06-01'),
          end_date: new Date('2026-06-05'),
          status: BookingStatus.Approved,
        },
        {
          id: 2,
          user_id: 1,
          room_id: 2,
          start_date: new Date('2026-07-01'),
          end_date: new Date('2026-07-03'),
          status: BookingStatus.Pending,
        },
      ];

      mockBookingService.my_bookings.mockResolvedValue(result);

      expect(await controller.my_bookings(mockReq as any)).toBe(result);
      expect(service.my_bookings).toHaveBeenCalledWith(mockReq);
    });

    it('should return empty array when user has no bookings', async () => {
      const mockReq = { headers: { authorization: 'Bearer token' } };
      const result: any[] = [];

      mockBookingService.my_bookings.mockResolvedValue(result);

      expect(await controller.my_bookings(mockReq as any)).toEqual([]);
      expect(service.my_bookings).toHaveBeenCalledWith(mockReq);
    });
  });

  // Test Suite: ALL BOOKINGS (Admin only)
  describe('all_bookings', () => {
    it('should call service.all_bookings and return all bookings', async () => {
      const result = [
        {
          id: 1,
          user_id: 1,
          room_id: 1,
          start_date: new Date('2026-06-01'),
          end_date: new Date('2026-06-05'),
          status: BookingStatus.Approved,
        },
        {
          id: 2,
          user_id: 2,
          room_id: 3,
          start_date: new Date('2026-07-01'),
          end_date: new Date('2026-07-03'),
          status: BookingStatus.Pending,
        },
      ];

      mockBookingService.all_bookings.mockResolvedValue(result);

      expect(await controller.all_bookings()).toBe(result);
      expect(service.all_bookings).toHaveBeenCalled();
    });
  });

  // Test Suite: EDIT BOOKING (Admin only)
  describe('edit_booking', () => {
    it('should call service.edit_booking and return updated booking', async () => {
      const dto: EditBookingDto = {
        id: 1,
        status: BookingStatus.Approved,
      };
      const result = {
        id: 1,
        user_id: 1,
        room_id: 1,
        start_date: new Date('2026-06-01'),
        end_date: new Date('2026-06-05'),
        status: BookingStatus.Approved,
      };

      mockBookingService.edit_booking.mockResolvedValue(result);

      expect(await controller.edit_booking(dto)).toBe(result);
      expect(service.edit_booking).toHaveBeenCalledWith(dto);
    });

    it('should update booking status to cancelled', async () => {
      const dto: EditBookingDto = {
        id: 2,
        status: BookingStatus.Cancelled,
      };
      const result = {
        id: 2,
        user_id: 1,
        room_id: 2,
        start_date: new Date('2026-07-01'),
        end_date: new Date('2026-07-03'),
        status: BookingStatus.Cancelled,
      };

      mockBookingService.edit_booking.mockResolvedValue(result);

      expect(await controller.edit_booking(dto)).toBe(result);
      expect(service.edit_booking).toHaveBeenCalledWith(dto);
    });
  });
});