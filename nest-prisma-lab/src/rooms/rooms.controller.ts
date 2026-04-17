import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards, Delete, UseInterceptors } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Role, Roles } from 'src/roles/roles.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('rooms')
@UseInterceptors(CacheInterceptor)
@ApiTags('Rooms')
@ApiBearerAuth('bearer')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  @ApiOperation({ summary: 'Create a new room (admin only)' })
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  async findAll() {
    return this.roomsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Get(':id')
  @ApiOperation({ summary: 'Get room by id' })
  @ApiParam({ name: 'id', description: 'Room id', example: 1 })
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findARoom(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch(':id/disable')
  @ApiOperation({ summary: 'Disable a room (admin only)' })
  @ApiParam({ name: 'id', description: 'Room id', example: 1 })
  @Throttle({ default: { limit: 1, ttl: 60 * 1000 } })
  update(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.disable(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch(':id/enable')
  @ApiOperation({ summary: 'Enable a room (admin only)' })
  @ApiParam({ name: 'id', description: 'Room id', example: 1 })
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  enable(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.enable(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room (admin only)' })
  @ApiParam({ name: 'id', description: 'Room id', example: 1 })
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(+id);
  }
}
