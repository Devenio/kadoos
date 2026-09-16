import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { verifyToken } from './auth.service.js';

export const DESK_COOKIE = 'kadoos-desk';

@Injectable()
export class DeskGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { desk?: { sub: string; shopId: string } }>();
    const token = request.cookies?.[DESK_COOKIE];
    try {
      request.desk = verifyToken(token);
      return true;
    } catch {
      throw new UnauthorizedException('Please sign in');
    }
  }
}
