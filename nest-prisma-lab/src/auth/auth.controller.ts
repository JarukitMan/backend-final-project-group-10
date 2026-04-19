import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiOperation({summary: "Create a new account"})
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    type: RegisterDto,
    schema: {type: "object", properties: {success: { type: "boolean", example: true }}}
  })
  @ApiResponse({
    status: 406,
    description: 'Duplicate Account',
  })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.auth.register(dto)
  }

  @ApiOperation({summary: "Log into an account and receive an access token"})
  @ApiResponse({
    status: 201,
    description: 'Your token',
    type: RegisterDto,
    schema: {type: "object", properties: {success: { type: "string", example: "oerjgoerijgioergjoiergjoerigjreigioOIJERIOGJERIOGJEROJGSFDJGLKerjogirjgj==" }}}
  })
  @ApiResponse({
    status: 404,
    description: 'User Not Found',
  })
  @ApiResponse({
    status: 401,
    description: 'Incorrect Password',
  })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.auth.login(dto)
  }
}
