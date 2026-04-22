import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export enum BookingStatus {
  Pending = "PENDING",
  Approved = "APPROVED",
  Cancelled = "CANCELLED",
  Paid = "PAID"
}

export class EditBookingDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'The ID of the booking to edit',
    example: '1'
  })
  id: number // booking ID
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The status to change the booking to',
    example: BookingStatus.Approved
  })
  status: BookingStatus // new status of the booking
}
