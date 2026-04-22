import { ApiProperty } from "@nestjs/swagger"
import { IsDate, IsNotEmpty, IsNumber } from "class-validator"

export class BookDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the room to book',
    example: '1'
  })
  room_id: number // Room ID
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The start date of the booking',
    example: '2027-12-24T00:00:00.000Z'
  })
  start_date: Date // Start of the stay (inclusive)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The end date of the booking',
    example: '2028-11-24T00:00:00.000Z'
  })
  end_date: Date // End of the stay (inclusive)
  // @IsNumber()
  // @IsNotEmpty()
  // guest_count: number // The minimum capacity needed for the stay
}
