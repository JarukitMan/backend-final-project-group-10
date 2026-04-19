import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRoomDto {
  // id: number;              // Room ID
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Room name or number (String not empty)',
    example: 'Simple Room'
  })
  name: string;            // Room name or number
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Room description (String optional)',
    example: 'Simple room with only basic amenities.'
  })
  description: string;     // Room description
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Maximum guests (Number not empty)',
    example: '1'
  })
  capacity: number;        // Maximum guests
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Price per night (Number not empty)',
    example: '1'
  })
  price_per_night: number; // Price per night
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Image URL or path (String optional)',
    example: '/room_2.png'
  })
  image_url: string;       // Image URL or path
  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Availability status (Boolean optional)',
    example: 'true'
  })
  is_active?: boolean;     // Availability status
}
