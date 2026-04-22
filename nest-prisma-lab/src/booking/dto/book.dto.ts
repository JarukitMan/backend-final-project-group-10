import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class BookDto {
  @IsNumber()
  @IsNotEmpty()
  room_id: number // Room ID
  @IsDate()
  @IsNotEmpty()
  start_date: Date // Start of the stay (inclusive)
  @IsDate()
  @IsNotEmpty()
  end_date: Date // End of the stay (inclusive)
  // @IsNumber()
  // @IsNotEmpty()
  // guest_count: number // The minimum capacity needed for the stay
}
