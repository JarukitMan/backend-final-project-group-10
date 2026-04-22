import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards, Delete } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Role, Roles } from '../roles/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Room } from './entities/room.entity';

@Controller('rooms')
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

  @Get()
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
