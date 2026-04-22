import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto'; 

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchQueryDto) {
    const rooms = await this.prisma.rooms.findMany(
      {
        where: {
          AND: [
            { capacity: {gte: dto.min_capacity} },
            { capacity: {lte: dto.max_capacity} },
            { price_per_night: {gte: dto.max_price_per_night} },
            { price_per_night: {lte: dto.min_price_per_night} },
          ]
        }
      }
    )
    return rooms.filter(
      room => {
        if (room.name && dto.name &&
          !room.name.toLowerCase().includes(dto.name.toLowerCase())) return false
        if (room.description && dto.description &&
          !room.description.toLowerCase().includes(dto.description.toLowerCase())) return false

        return room.is_active
      }
    ).filter(
      async room => {
        // Check if room is booked in that date range.
        // Just findFirst our start < start < our end | start < our end < end and return true if it doesn't exist.
        if (await this.prisma.bookings.findFirst(
          {
            select: {room_id: true},
            where: {
              AND: [
                {room_id: room.id},
                {OR: [
                  { AND: [
                      { start_date: { lte: dto.end_date } },
                      { end_date: { gte: dto.end_date } }
                    ]
                  },
                  { AND: [
                      { start_date: { gte: dto.start_date } },
                      { start_date: { lte: dto.end_date } }
                    ]
                  }
                ]}
              ]
            }
          }
        )) return false
        else return true
      }
    )
  }
}
