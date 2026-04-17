import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Username used for login', example: 'john_doe' })
  username!: string;

  @ApiProperty({ description: 'Password used for login', example: 'P@ssw0rd123' })
  password!: string;
}
