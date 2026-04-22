import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards, Delete, UseInterceptors, Query } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Role, Roles } from '../roles/roles.decorator';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Room } from './entities/room.entity';

@Controller('rooms')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Throttle({ default: { ttl: 60000, limit: 10 } })
@ApiTags('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({summary: "Create a new room"})
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    type: CreateRoomDto,
    schema: {type: "object", properties: {success: { type: "boolean", example: true }}}
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden resource',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  // public
  // @ApiBearerAuth('access-token')
  // @CacheTTL(30000) 
  // @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin, Role.User)
  // @Get()
  // @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })

  // @ApiOperation({ summary: 'Retrieve all rooms' })
  // @ApiQuery({ name: 'is_active', required: false, type: Boolean, description: 'Filter by active status', example: true })
  // @ApiQuery({ name: 'min_price', required: false, type: Number, description: 'Minimum price per night', example: 1000 })
  // @ApiQuery({ name: 'max_price', required: false, type: Number, description: 'Maximum price per night', example: 5000 })
  // @ApiQuery({ name: 'min_capacity', required: false, type: Number, description: 'Minimum room capacity', example: 2 })
  // @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of results per page', example: 10 })
  // @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of results to skip', example: 0 })
  // @ApiOperation({summary: "Retrieve all rooms"})
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of all rooms',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       data: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             id: { type: 'number', example: 1 },
  //             name: { type: 'string', example: 'Deluxe Room 201' },
  //             description: { type: 'string', example: 'Deluxe room with city view' },
  //             capacity: { type: 'number', example: 2 },
  //             price_per_night: { type: 'number', example: 2800 },
  //             image_url: { type: 'string', example: '/images/room201.jpg' },
  //             is_active: { type: 'boolean', example: true },
  //             created_at: { type: 'string', example: '2026-03-20T01:02:55.000Z' },
  //             updated_at: { type: 'string', example: '2026-03-20T01:02:55.000Z' },
  //           },
  //         },
  //       },
  //       total: { type: 'number', example: 5 },
  //       limit: { type: 'number', example: 10 },
  //       offset: { type: 'number', example: 0 },
  //     },
  //   },
  // })
  // @ApiResponse({ status: 429, description: 'Too Many Requests' })
  // findAll(
  //   @Query('is_active') is_active?: string,
  //   @Query('min_price') min_price?: string,
  //   @Query('max_price') max_price?: string,
  //   @Query('min_capacity') min_capacity?: string,
  //   @Query('limit') limit?: string,
  //   @Query('offset') offset?: string,) {

  //   return this.roomsService.findAll({
  //     is_active: is_active !== undefined ? is_active === 'true' : undefined,
  //     min_price: min_price ? Number(min_price) : undefined,
  //     max_price: max_price ? Number(max_price) : undefined,
  //     min_capacity: min_capacity ? Number(min_capacity) : undefined,
  //     limit: limit ? Number(limit) : undefined,
  //     offset: offset ? Number(offset) : undefined,
  //   });
  // }

@Get()
@ApiBearerAuth('access-token')
@ApiOperation({ summary: 'Get all rooms' })
@ApiResponse({ status: 200, description: 'Return all rooms' })
findAll() {
  // Simply call the naive service method
  return this.roomsService.findAll();
}

  @ApiBearerAuth('access-token')
  @ApiOperation({summary: "Retrieve one room"})
  @ApiResponse({
    status: 200,
    description: "Details of the room",
    type: Array<Room>
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden resource',
  })
  @ApiParam({name: 'id', description: 'Room ID', type: Number})
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Get(':id')
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findARoom(+id);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({summary: "Disable a room"})
  @ApiResponse({
    status: 201,
    description: "Room disabled",
    type: Boolean
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden resource',
  })
  @ApiParam({name: 'id', description: 'Room ID', type: Number})
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch(':id/disable')
  @Throttle({ default: { limit: 1, ttl: 60 * 1000 } })
  disable(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.disable(+id);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({summary: "Enable a room"})
  @ApiResponse({
    status: 201,
    description: "Room enabled",
    type: Boolean
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden resource',
  })
  @ApiParam({name: 'id', description: 'Room ID', type: Number})
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch(':id/enable')
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  enable(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.enable(+id);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({summary: "Remove a room"})
  @ApiResponse({
    status: 201,
    description: "Room removed",
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden resource',
  })
  @ApiParam({name: 'id', description: 'Room ID', type: Number})
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  async remove(@Param('id', ParseIntPipe) id: number) {
  await this.roomsService.remove(id); 
  return { success: true };
}

  @ApiBearerAuth('access-token')
  @Patch(':id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a room' })
  @ApiParam({ name: 'id', description: 'room ID', type: Number })
  @ApiResponse({ status: 200, description: 'Room updated successfully', type: CreateRoomDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto   
  ) {
    return await this.roomsService.update(id, updateRoomDto);
  }
}



