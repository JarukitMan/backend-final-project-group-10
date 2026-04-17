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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin, Role.User)
@ApiTags('Notifications')
@ApiBearerAuth('bearer')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'unreadOnly', required: false, example: false })
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
  @ApiOperation({ summary: 'Mark one notification as read' })
  @ApiParam({ name: 'id', description: 'Notification id', example: 5 })
  @Throttle({ default: { limit: 20, ttl: 60 * 1000 } })
  markAsRead(
    @Req() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @Throttle({ default: { limit: 5, ttl: 60 * 1000 } })
  markAllAsRead(@Req() req: { user: { id: number } }) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Get('me/unread-count')
  @ApiOperation({ summary: 'Get unread notifications count for current user' })
  @Throttle({ default: { limit: 20, ttl: 60 * 1000 } })
  unreadCount(@Req() req: { user: { id: number } }) {
    return this.notificationsService.unreadCount(req.user.id);
  }
}
