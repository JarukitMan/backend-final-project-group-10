import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('BookingController', () => {
  let controller: BookingController;

  const mockBookingService = {
    book: jest.fn(),
    unbook: jest.fn(),
    my_bookings: jest.fn(),
    all_bookings: jest.fn(),
    edit_booking: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        { provide: BookingService, useValue: mockBookingService },
        { provide: PrismaService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: 'CACHE_MANAGER', useValue: {} },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
