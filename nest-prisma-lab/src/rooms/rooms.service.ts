import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { CreateRoomDto } from './dto/create-room.dto'
import { UpdateRoomDto } from './dto/update-room.dto'
// import 'dotenv/config'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class RoomsService {

  private readonly logger = new Logger('RoomsService')
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoomDto) {
    this.logger.log(`executing create()`);
    try {
      return await this.prisma.rooms.create({
        data: {
          name: dto.name,
          description: dto.description,
          capacity: dto.capacity,
          price_per_night: dto.price_per_night,
          image_url: dto.image_url,
          is_active: dto.is_active ?? true,
        },
      });
    } catch (e: any) {
      if(typeof e?.message === 'string' &&
        e.message.toLowerCase().includes('unique'))
      {
              this.logger.error(`Oh no! cannot create room. Room with name ${dto.name} already exists`);
        throw new BadRequestException('Room with this name already exists');
      }
        throw new BadRequestException(e?.message ?? 'Create failed');
    }
  }

findAll() {
  this.logger.log("Find all rooms (naive)");
  return this.prisma.rooms.findMany();
}

  async findARoom(id: number) {
    this.logger.log("Find one")
    const room = await this.prisma.rooms.findUnique({where: {id}})
    if (room) return room
    else {
      this.logger.log("Find one: Invalid Room ID")
      throw new NotFoundException(`Room with id ${id} not found`)
    }
  }

  async disable(id: number) {
    this.logger.log("Disable")
    try {
      if (await this.findARoom(id))
      return this.prisma.rooms.update({where: {id}, data: {is_active: false}})
    } catch (e) { this.logger.error(e); throw e }
    
  }

  async enable(id: number) {
    this.logger.log("Enable")
    try {
      if (await this.findARoom(id))
      return this.prisma.rooms.update({where: {id}, data: {is_active: true}})
    } catch (e) { this.logger.error(e); throw e }
    
  }

async update(id: number, dto: UpdateRoomDto) {
    this.logger.log(`executing update()`);
    try {
      await this.findARoom(id);
      return await this.prisma.rooms.update({
        where: {id},
        data: {
          ...(dto.name           && { name: dto.name }),
          ...(dto.description    !== undefined && { description: dto.description }),
          ...(dto.capacity       && { capacity: dto.capacity }),
          ...(dto.price_per_night && { price_per_night: dto.price_per_night }),
          ...(dto.image_url      !== undefined && { image_url: dto.image_url }),
          ...(dto.is_active      !== undefined && { is_active: dto.is_active }),
          updated_at: new Date(),
        },
      });
    } catch (e: any) {
      this.logger.error(`Failed to update room ${id}: ${e?.message ?? e}`);
      throw e;
    }
  }

  async remove(id: number) {
    this.logger.log(`executing remove()`);
    try {
      await this.findARoom(id); 
      await this.prisma.rooms.delete({ where: { id } });
      return { message: `Room ${id} deleted successfully` };
    } catch (e: any) {
      this.logger.error(`Failed to delete room ${id}: ${e?.message ?? e}`);
      throw e;
    }
  }
}
