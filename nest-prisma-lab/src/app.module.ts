import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { AuthModule } from './auth/auth.module';
import { StatusModule } from './status/status.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import KeyvRedis from '@keyv/redis';
import { APP_GUARD } from '@nestjs/core';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    PrismaModule,
    RoomsModule,
    AuthModule,
    StatusModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 15 * 1000 * 60,
      stores: [
        new KeyvRedis('redis://localhost:6379')
      ],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        { ttl: 60 * 1000, limit: 30 }
      ]
    }),
    SearchModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
