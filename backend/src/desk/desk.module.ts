import { Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { DeskController } from './desk.controller.js';

@Module({
  imports: [AppointmentsModule, AuthModule],
  controllers: [DeskController],
})
export class DeskModule {}
