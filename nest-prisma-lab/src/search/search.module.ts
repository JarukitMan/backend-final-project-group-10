import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';
import { SearchController } from './search.controller';

@Module({  
  controllers: [SearchController],
  providers: [SearchService, PrismaService]
})
export class SearchModule {}