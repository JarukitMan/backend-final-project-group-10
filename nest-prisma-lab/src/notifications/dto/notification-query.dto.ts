import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class NotificationQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  unreadOnly?: boolean = false;
}

export type NotificationTypeDto = 'CREATED' | 'CANCELLED';

export type NotificationItemDto = {
  id: number;
  user_id: number;
  booking_id: number | null;
  type: NotificationTypeDto;
  title: string;
  message: string;
  is_read: boolean;
  read_at: Date | null;
  created_at: Date;
};

export type NotificationPaginationDto = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type NotificationListResponseDto = {
  data: NotificationItemDto[];
  pagination: NotificationPaginationDto;
};
