import { Decimal } from "@prisma/client/runtime/index-browser";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SearchQueryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Partial or full name of the room',
    example: 'simple'
  })
  name?: string;
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Partial or full description of the room',
    example: 'amenities'
  })
  description?: string;
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Minimum acceptable capacity the room should have',
    example: 1
  })
  min_capacity?: number;
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Maximum acceptable capacity the room should have',
    example: 10
  })
  max_capacity?: number;
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Minimum acceptable price of the room',
    example: 0
  })
  min_price_per_night?: Decimal;
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Maximum acceptable price of the room',
    example: 10000
  })
  max_price_per_night?: Decimal;
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Start of the date range the room needs to be available.',
    example: '2027-12-23T00:00:00.000Z'
  })
  start_date: Date;
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    description: 'End of the date range the room needs to be available.',
    example: '2028-01-01T08:00:00.000Z'
  })
  end_date: Date;
}
