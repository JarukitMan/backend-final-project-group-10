import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Username of the account to be created',
    example: 'dr_w'
  })
  username: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Password of the account to be created',
    example: 'Why don\'t you just put README_instructions.md in README.md?'
  })
  password: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Role of the registered user. Only used internally as external users obviously cannot register as an admin. Can either be "ADMIN" or "USER"',
    example: 'ADMIN'
  })
  role: string;
}
