import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto'; 

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchQueryDto) {
    const all_rooms = await this.prisma.rooms.findMany()
    return all_rooms.filter(
      room => {
        if (room.name && dto.name &&
          !room.name.includes(dto.name)) return false
        if (room.description && dto.description &&
          !room.description.includes(dto.description)) return false

        if (room.capacity && dto.min_capacity &&
          room.capacity < dto.min_capacity) return false
        if (room.capacity && dto.max_capacity &&
          room.capacity > dto.max_capacity) return false

        if (room.price_per_night && dto.min_price_per_night &&
          room.price_per_night < dto.min_price_per_night) return false
        if (room.price_per_night && dto.max_price_per_night &&
          room.price_per_night > dto.max_price_per_night) return false
        // TODO: Might need to add date range.

        return room.is_active
      }
    )
  }
}
