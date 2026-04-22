import { Body, Controller, Get, Post, Req, UseGuards, UseInterceptors, HttpCode } from '@nestjs/common';
import { Role, Roles } from '../roles/roles.decorator';
import { BookDto } from './dto/book.dto';
import { BookingService } from './booking.service';
// Err, I did it this way because of the linter.
import * as e from 'express';
import { UnbookDto } from './dto/unbook.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { EditBookingDto } from './dto/edit-booking.dto';

@Controller('booking')
@UseInterceptors(CacheInterceptor)
@ApiTags('booking')
export class BookingController {
  constructor(private service: BookingService) {}
  
  @ApiBearerAuth('access-token')
  @ApiOperation({summary: "Create a new booking"})
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
    type: BookDto,
    schema: {type: "object", properties: {success: { type: "boolean", example: true }}}
  })
  @ApiResponse({
    status: 406,
    description: 'This booking overlaps with a pre-existing booking.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Post('book')
  book(@Req() req: e.Request, @Body() dto: BookDto) {
    return this.service.book(req, dto)
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({summary: "Deletes a booking the user created"})
  @ApiResponse({
    status: 201,
    description: 'Booking deleted successfully',
    type: UnbookDto,
    schema: {type: "object", properties: {success: { type: "boolean", example: true }}}
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('unbook')
  @HttpCode(200)
  @Roles(Role.User, Role.Admin)
  unbook(@Req() req: e.Request, @Body() dto: UnbookDto) {
    return this.service.unbook(req, dto)
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({summary: "Get all bookings the user created"})
  @ApiResponse({
    status: 201,
    description: 'Your bookings',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {type: 'Int', example: '1'},
          user_id: {type: 'Int', example: '1'},
          room_id: {type: 'Int', example: '1'},
          start_date: {type: 'DateTime', example: '2026-03-20T01:02:55.000Z'},
          end_date: {type: 'DateTime', example: '2026-03-20T01:02:55.000Z'},
          status: {type: 'BookingStatus', example: 'PENDING'}
        }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden resource',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User, Role.Admin)
  @Get('my-bookings')
  my_bookings(@Req() req: e.Request) {
    return this.service.my_bookings(req)
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({summary: "Get all bookings (Admin only)"})
  @ApiResponse({
    status: 201,
    description: 'All bookings',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {type: 'Int', example: '1'},
          user_id: {type: 'Int', example: '1'},
          room_id: {type: 'Int', example: '1'},
          start_date: {type: 'DateTime', example: '2026-03-20T01:02:55.000Z'},
          end_date: {type: 'DateTime', example: '2026-03-20T01:02:55.000Z'},
          status: {type: 'BookingStatus', example: 'PENDING'}
        }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden resource',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('all-bookings')
  all_bookings() {
    return this.service.all_bookings()
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({summary: "Edit a booking (Admin only)"})
  @ApiResponse({
    status: 201,
    description: 'Booking edited successfully',
    type: EditBookingDto,
    schema: {type: "object", properties: {success: { type: "boolean", example: true }}}
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden resource',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('edit-booking')
  @HttpCode(200)
  edit_booking(@Body() dto: EditBookingDto) {
    return this.service.edit_booking(dto)
  }
}

/*
- Logged-in users can create and manage their own bookings with validation of dates and prevention of double booking.
- Booking statuses: Pending (default), Approved, Cancelled, Paid, with Admin ability to view and update any booking.
*/
