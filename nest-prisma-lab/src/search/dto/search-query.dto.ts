import { Decimal } from "@prisma/client/runtime/index-browser";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class SearchQueryDto {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsNumber()
  @IsOptional()
  min_capacity?: number;
  @IsNumber()
  @IsOptional()
  max_capacity?: number;
  @IsNumber()
  @IsOptional()
  min_price_per_night?: Decimal;
  @IsNumber()
  @IsOptional()
  max_price_per_night?: Decimal;
  @IsDate()
  @IsNotEmpty()
  start_date: Date;
  @IsDate()
  @IsNotEmpty()
  end_date: Date;
}
