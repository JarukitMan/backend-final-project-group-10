import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService, JwtService, Reflector],
  exports: [NotificationsService],
})
export class NotificationsModule {}
