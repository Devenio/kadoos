import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AppointmentsService } from '../appointments/appointments.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  updateAppointmentSchema,
  type UpdateAppointmentBody,
} from '../appointments/appointments.schemas.js';
import { DeskGuard } from '../auth/desk.guard.js';
import { tehranClock } from '../shops/shop-hours.js';

@Controller('desk')
@UseGuards(DeskGuard)
export class DeskController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Get('appointments')
  list(
    @Req() request: Request & { desk: { shopId: string } },
    @Query('date') date?: string,
    @Query('phone') phone?: string,
  ) {
    const day = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : tehranClock().ymd;
    return this.appointments.listForShop(request.desk.shopId, day, phone);
  }

  @Patch('appointments/:id')
  update(
    @Req() request: Request & { desk: { shopId: string } },
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAppointmentSchema))
    body: UpdateAppointmentBody,
  ) {
    return this.appointments.updateStatus(request.desk.shopId, id, body.status);
  }
}
