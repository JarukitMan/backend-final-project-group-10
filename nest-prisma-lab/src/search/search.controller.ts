import { Body, Controller, Get } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto'; 

@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  async get(@Body() dto: SearchQueryDto) {
    return await this.search.search(dto)
  }
}
