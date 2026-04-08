import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport'

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  handleRequest<TUser = unknown>(error: unknown, user: TUser): TUser {
    if (error || !user) {
      throw new UnauthorizedException('Unauthorized')
    }

    return user
  }
}
