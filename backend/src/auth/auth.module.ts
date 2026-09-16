import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { DeskGuard } from './desk.guard.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, DeskGuard],
  exports: [AuthService, DeskGuard],
})
export class AuthModule {}
