import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class EditBookingDto {
  @IsNotEmpty()
  @IsNumber()
  id: number // booking ID
  @IsNotEmpty()
  @IsString()
  status: BookingStatus // new status of the booking
}

export enum BookingStatus {
  Pending = "PENDING",
  Approved = "APPROVED",
  Cancelled = "CANCELLED",
  Paid = "PAID"
}
