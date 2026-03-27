import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Role, Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.User)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  @Throttle({ default: { limit: 20, ttl: 60 * 1000 } })
  findMine(@Req() req: { user: { id: number } }, @Query() query: NotificationQueryDto) {
    return this.notificationsService.findMine(
      req.user.id,
      query.page,
      query.limit,
      query.unreadOnly,
    );
  }

  @Patch(':id/read')
  @Throttle({ default: { limit: 20, ttl: 60 * 1000 } })
  markAsRead(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @Throttle({ default: { limit: 5, ttl: 60 * 1000 } })
  markAllAsRead(@Req() req: { user: { id: number } }) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Get('me/unread-count')
  @Throttle({ default: { limit: 20, ttl: 60 * 1000 } })
  unreadCount(@Req() req: { user: { id: number } }) {
    return this.notificationsService.unreadCount(req.user.id);
  }
}
