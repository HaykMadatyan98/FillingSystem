import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from '../interfaces/request.interface';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      return false; // No token provided, deny access
    }

    const refreshToken = authHeader.replace('Bearer ', '').trim();

    try {
      const user = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET, // Replace with your refresh token secret
      });
      // Attach the user and refresh token to the request for further processing
      request.user = { ...user, refreshToken };
      return true;
    } catch (err) {
      console.log(err);
      return false; // Token invalid or expired
    }
  }
}
