import { Body, Controller, Get, UseInterceptors } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto'; 
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('search')
@UseInterceptors(CacheInterceptor)
// Conscious decision not to require login. I'd be unwilling to use a service that requires me to log in to search.
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @ApiOperation({ summary: 'Retrieve all rooms' })
  @ApiBody({ type: SearchQueryDto })
  @ApiOperation({summary: "Retrieve all rooms that pass the search query"})
  @ApiResponse({
    status: 200,
    description: 'List of all rooms that fit criteria',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Deluxe Room 201' },
              description: { type: 'string', example: 'Deluxe room with city view' },
              capacity: { type: 'number', example: 2 },
              price_per_night: { type: 'number', example: 2800 },
              image_url: { type: 'string', example: '/images/room201.jpg' },
              is_active: { type: 'boolean', example: true },
              created_at: { type: 'string', example: '2026-03-20T01:02:55.000Z' },
              updated_at: { type: 'string', example: '2026-03-20T01:02:55.000Z' },
            },
          },
        },
        total: { type: 'number', example: 5 },
        limit: { type: 'number', example: 10 },
        offset: { type: 'number', example: 0 },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @Get()
  async get(@Body() dto: SearchQueryDto) {
    return await this.search.search(dto)
  }
}
