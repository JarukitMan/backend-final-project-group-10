import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './roles.decorator'
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger('RoomsService')
  constructor(private reflector: Reflector, private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  async canActivate( context: ExecutionContext, ): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride(
        ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
        ]
      )
    if (!requiredRoles || requiredRoles.length === 0) return true
    
    const request = context.switchToHttp().getRequest()
    const auth = request.headers['authorization']

    if (!auth) return false
    const [, token] = auth.split(' ')
    // FIXME: Typing the secret again outside the module feels *wrong*.
    const payload = await this.jwt.verifyAsync(token, {secret: "ICT88@MU"})
    const user = await this.prisma.users.findFirst({where: {id: parseInt(payload.sub)}})
    this.logger.log("Role guard: "+ requiredRoles + " User role: " + user?.role )
    return requiredRoles.some((role: Role) => user?.role?.includes(role))
  }
}
