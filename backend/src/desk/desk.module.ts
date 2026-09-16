import { Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { DeskController } from './desk.controller.js';
import { DeskService } from './desk.service.js';

@Module({
  imports: [AppointmentsModule, AuthModule],
  controllers: [DeskController],
  providers: [DeskService],
})
export class DeskModule {}
