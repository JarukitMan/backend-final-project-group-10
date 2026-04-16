import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Username used to create an account', example: 'john_doe' })
  username!: string;

  @ApiProperty({ description: 'User password', example: 'P@ssw0rd123' })
  password!: string;

  @ApiProperty({ description: 'User role (admin or user)', example: 'user' })
  role!: string;
}
