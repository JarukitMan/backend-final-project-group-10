import { Injectable, Logger, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as b from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService')
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async register(dto: RegisterDto) {
    this.logger.log("Register")
    try {
      if (await this.prisma.users.findFirst({where: {name: dto.username}}) !== null)
      throw new NotAcceptableException(`Duplicate username`)
      const hashed_password = await this.hash(dto.password)
      return await this.prisma.users.create({data: {name: dto.username, password: hashed_password, role: dto.role}})
    } catch (error) { this.logger.error(error); this.logger.debug(dto); throw error }
  }

  async login(dto: LoginDto) {
    try {
      this.logger.log("Login")
      const user = await this.prisma.users.findFirst({where: {name: dto.username}})
      if (!user) throw new NotFoundException(`User Not Found`)
      const payload = {sub: user.id, username: user.name}
      if (await b.compare(dto.password, user.password || "")) {
        // FIX: Return an object with the key 'access_token'
        const token = this.jwt.sign(payload);
        return { access_token: token };}
      else throw new UnauthorizedException(`Incorrect Password`)
    } catch (error) { this.logger.error(error); this.logger.debug(dto); throw error }
  }

  async hash(password: string): Promise<string> {
  const saltRounds = 12;
  return await b.hash(password, saltRounds);
}
}
