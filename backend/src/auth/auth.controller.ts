import { Body, Controller, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../common/config/env.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { AuthService } from './auth.service.js';
import { DESK_COOKIE, DeskGuard } from './desk.guard.js';
import {
  changePasswordSchema,
  type ChangePasswordBody,
} from '../desk/desk.schemas.js';
import type { DeskAuthedRequest } from '../desk/desk.types.js';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: z.infer<typeof loginSchema>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, user } = await this.auth.login(body.email, body.password);
    response.cookie(DESK_COOKIE, token, cookieOptions());
    return user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(DESK_COOKIE, cookieOptions());
    return { ok: true };
  }

  @Get('me')
  me(@Req() request: Request) {
    return this.auth.me(request.cookies?.[DESK_COOKIE]);
  }

  @Patch('password')
  @UseGuards(DeskGuard)
  changePassword(
    @Req() request: DeskAuthedRequest,
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordBody,
  ) {
    return this.auth.changePassword(
      request.desk.sub,
      body.currentPassword,
      body.newPassword,
    );
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
