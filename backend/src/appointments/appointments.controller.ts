import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { AppointmentsService } from './appointments.service.js';
import {
  cancelBookingSchema,
  createAppointmentSchema,
  type CancelBookingInput,
  type CreateAppointmentBody,
} from './appointments.schemas.js';

@Controller()
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Get('shops/:slug/availability')
  availability(
    @Param('slug') slug: string,
    @Query('serviceId') serviceId: string,
    @Query('barberId') barberId?: string,
  ) {
    if (!serviceId) {
      return [];
    }
    return this.appointments.availability(slug, serviceId, barberId || undefined);
  }

  @Post('shops/:slug/appointments')
  create(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(createAppointmentSchema))
    body: CreateAppointmentBody,
  ) {
    return this.appointments.create(slug, body);
  }

  @Get('bookings')
  lookup(@Query('code') code: string, @Query('phone') phone: string) {
    if (!phone) {
      return [];
    }
    if (!code) {
      return this.appointments.listByPhone(phone);
    }
    return this.appointments.lookup(code, phone);
  }

  @Post('bookings/cancel')
  cancel(
    @Body(new ZodValidationPipe(cancelBookingSchema)) body: CancelBookingInput,
  ) {
    return this.appointments.cancelByGuest(body.code, body.phone);
  }
}
