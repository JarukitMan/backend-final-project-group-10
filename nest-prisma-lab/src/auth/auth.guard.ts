import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const auth = request.headers['authorization']

    if (!auth) return false
    const [, token] = auth.split(' ')
    // try {
      // FIXME: Typing the secret again outside the module feels *wrong*.
      const payload = await this.jwt.verifyAsync(token, {secret: "ICT88@MU"})
      const user = await this.prisma.users.findFirst({where: {id: parseInt(payload.sub)}})
      if (!user) return false
      request.user = user
      return true
    // } catch (_) { return false }
  }
}
