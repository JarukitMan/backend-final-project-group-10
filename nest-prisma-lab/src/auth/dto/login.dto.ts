import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Username of the account used to log in',
    example: 'dr_p'
  })
  username: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Password of the account used to log in',
    example: 'sn@k3_g4me'
  })
  password: string;
}
