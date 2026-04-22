import { Body, Controller, Get, UseInterceptors } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto'; 
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('search')
@UseInterceptors(CacheInterceptor)
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  async get(@Body() dto: SearchQueryDto) {
    return await this.search.search(dto)
  }
}
