import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  // id: number;              // Room ID
  @ApiProperty({ description: 'Room name or room number', example: 'Deluxe 101' })
  @IsString()
  @IsNotEmpty()
  name!: string;            // Room name or number

  @ApiPropertyOptional({ description: 'Room details', example: 'Sea view, king-size bed' })
  @IsString()
  @IsOptional()
  description!: string;     // Room description

  @ApiProperty({ description: 'Maximum number of guests', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  capacity!: number;        // Maximum guests

  @ApiProperty({ description: 'Price per night', example: 1999 })
  @IsNumber()
  @IsNotEmpty()
  price_per_night!: number; // Price per night

  @ApiPropertyOptional({ description: 'Room image URL', example: 'https://example.com/room.jpg' })
  @IsString()
  @IsOptional()
  image_url!: string;       // Image URL or path

  @ApiPropertyOptional({ description: 'Room active status', example: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;     // Availability status
}
