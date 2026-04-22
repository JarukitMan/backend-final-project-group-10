import { Injectable, Logger, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { BookDto } from './dto/book.dto';
import { UnbookDto } from './dto/unbook.dto';
import { Request } from 'express';
import { EditBookingDto } from './dto/edit-booking.dto';

@Injectable()
export class BookingService {
  private readonly logger = new Logger('RoomsService')
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async book(req: Request, dto: BookDto) {
    this.logger.log('book')
    const user_id = this.get_user_id(req)
    const {room_id, start_date, end_date} = dto
    // Just findFirst our start < start < our end | start < our end < end and create a booking if it doesn't exist.
    if (!await this.prisma.bookings.findFirst({
        where: {
          AND: [
            { start_date: { lte: dto.end_date } },
            { end_date: { gte: dto.start_date } }
          ]
        }
      }
    )) {
      const booking = await this.prisma.bookings.create({data: {user_id, room_id, start_date, end_date}})
      this.prisma.notifications.create({data: {user_id, booking_id: booking.id, type: 'CREATED', title: `Booking created for room ${booking.room_id}`, message: `Booking created for room ${booking.room_id} from ${booking.start_date} to ${booking.end_date}!`}})
    } else throw new NotAcceptableException('This booking overlaps with a pre-existing booking.')
  }

  async unbook(req: Request, dto: UnbookDto) {
    this.logger.log('unbook')
    const user_id = this.get_user_id(req)
    const room_id = dto.room_id
    // If it's not there, punch the user and steal their riches.
    const booking = await this.prisma.bookings.findFirst({where: {room_id, user_id}})
    if (!booking)
    throw new NotFoundException('Booking Not Found')

    this.prisma.notifications.create({data: {user_id, booking_id: booking.id, type: 'CANCELLED', title: `Booking cancelled for room ${booking.room_id}!`, message: `Booking for room ${booking.room_id} from ${booking.start_date} to ${booking.end_date} cancelled!`}})
    return this.prisma.bookings.delete({where: {id: booking.id}})
  }

  my_bookings(req: Request) {
    this.logger.log('my_bookings')
    const user_id = this.get_user_id(req)
    return this.prisma.bookings.findMany({where: {user_id}})
  }

  all_bookings() {
    this.logger.log('all_bookings')
    return this.prisma.bookings.findMany()
  }

  get_user_id(req: Request): number {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token not provided');
    }
    const token = authHeader.split(' ')[1];
  
    // Duplicated ID extraction
    try {
      const payload = this.jwt.verify(token, {secret: process.env["JWT_SECRET"]})
      return payload.sub
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  edit_booking(dto: EditBookingDto) {
    // The spec does not require notifications for this kind of action.
    return this.prisma.bookings.update({data: {status: dto.status}, where: {id: dto.id}})
  }
}
