import { Module } from '@nestjs/common';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { AuthModule } from './auth/auth.module';
import { StatusModule } from './status/status.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import KeyvRedis from '@keyv/redis';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { SearchModule } from './search/search.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    PrismaModule,
    RoomsModule,
    AuthModule,
    StatusModule,
    NotificationsModule,
    BookingModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 15 * 1000 * 60,
      stores: [
        new KeyvRedis('redis://redis:6379')
      ],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        { ttl: 60 * 1000, limit: 30 }
      ]
    }),
    SearchModule,
    BookingModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
