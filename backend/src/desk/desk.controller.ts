import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from '../appointments/appointments.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { DeskGuard } from '../auth/desk.guard.js';
import {
  createTimeOffSchema,
  insightsQuerySchema,
  listAppointmentsQuerySchema,
  patchBarberSchema,
  patchServiceSchema,
  patchShopSchema,
  reorderSchema,
  replaceHoursSchema,
  updateAppointmentSchema,
  upsertBarberSchema,
  upsertServiceSchema,
  walkInSchema,
  type CreateTimeOffBody,
  type ListAppointmentsQuery,
  type PatchBarberBody,
  type PatchServiceBody,
  type PatchShopBody,
  type ReorderBody,
  type ReplaceHoursBody,
  type UpdateAppointmentBody,
  type UpsertBarberBody,
  type UpsertServiceBody,
  type WalkInBody,
} from './desk.schemas.js';
import { DeskService } from './desk.service.js';
import type { DeskAuthedRequest } from './desk.types.js';

@Controller('desk')
@UseGuards(DeskGuard)
export class DeskController {
  constructor(
    private readonly appointments: AppointmentsService,
    private readonly desk: DeskService,
  ) {}

  @Get('appointments')
  listAppointments(
    @Req() request: DeskAuthedRequest,
    @Query(new ZodValidationPipe(listAppointmentsQuerySchema))
    query: ListAppointmentsQuery,
  ) {
    return this.appointments.listForShop(request.desk.shopId, query);
  }

  @Get('appointments/:id')
  getAppointment(
    @Req() request: DeskAuthedRequest,
    @Param('id') id: string,
  ) {
    return this.appointments.getForShop(request.desk.shopId, id);
  }

  @Patch('appointments/:id')
  updateAppointment(
    @Req() request: DeskAuthedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAppointmentSchema))
    body: UpdateAppointmentBody,
  ) {
    return this.appointments.updateForShop(request.desk.shopId, id, body);
  }

  @Post('appointments/walk-in')
  walkIn(
    @Req() request: DeskAuthedRequest,
    @Body(new ZodValidationPipe(walkInSchema)) body: WalkInBody,
  ) {
    return this.appointments.createWalkIn(request.desk.shopId, body);
  }

  @Get('barbers')
  listBarbers(@Req() request: DeskAuthedRequest) {
    return this.desk.listBarbers(request.desk.shopId);
  }

  @Post('barbers')
  createBarber(
    @Req() request: DeskAuthedRequest,
    @Body(new ZodValidationPipe(upsertBarberSchema)) body: UpsertBarberBody,
  ) {
    return this.desk.createBarber(request.desk.shopId, body);
  }

  @Post('barbers/reorder')
  reorderBarbers(
    @Req() request: DeskAuthedRequest,
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderBody,
  ) {
    return this.desk.reorderBarbers(request.desk.shopId, body.ids);
  }

  @Patch('barbers/:id')
  updateBarber(
    @Req() request: DeskAuthedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(patchBarberSchema)) body: PatchBarberBody,
  ) {
    return this.desk.updateBarber(request.desk.shopId, id, body);
  }

  @Get('barbers/:id/time-off')
  listTimeOff(
    @Req() request: DeskAuthedRequest,
    @Param('id') id: string,
  ) {
    return this.desk.listTimeOff(request.desk.shopId, id);
  }

  @Post('barbers/:id/time-off')
  createTimeOff(
    @Req() request: DeskAuthedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createTimeOffSchema)) body: CreateTimeOffBody,
  ) {
    return this.desk.createTimeOff(request.desk.shopId, id, body);
  }

  @Delete('time-off/:id')
  deleteTimeOff(
    @Req() request: DeskAuthedRequest,
    @Param('id') id: string,
  ) {
    return this.desk.deleteTimeOff(request.desk.shopId, id);
  }

  @Get('services')
  listServices(@Req() request: DeskAuthedRequest) {
    return this.desk.listServices(request.desk.shopId);
  }

  @Post('services')
  createService(
    @Req() request: DeskAuthedRequest,
    @Body(new ZodValidationPipe(upsertServiceSchema)) body: UpsertServiceBody,
  ) {
    return this.desk.createService(request.desk.shopId, body);
  }

  @Post('services/reorder')
  reorderServices(
    @Req() request: DeskAuthedRequest,
    @Body(new ZodValidationPipe(reorderSchema)) body: ReorderBody,
  ) {
    return this.desk.reorderServices(request.desk.shopId, body.ids);
  }

  @Patch('services/:id')
  updateService(
    @Req() request: DeskAuthedRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(patchServiceSchema)) body: PatchServiceBody,
  ) {
    return this.desk.updateService(request.desk.shopId, id, body);
  }

  @Get('hours')
  getHours(@Req() request: DeskAuthedRequest) {
    return this.desk.getHours(request.desk.shopId);
  }

  @Put('hours')
  replaceHours(
    @Req() request: DeskAuthedRequest,
    @Body(new ZodValidationPipe(replaceHoursSchema)) body: ReplaceHoursBody,
  ) {
    return this.desk.replaceHours(request.desk.shopId, body);
  }

  @Get('shop')
  getShop(@Req() request: DeskAuthedRequest) {
    return this.desk.getShop(request.desk.shopId);
  }

  @Patch('shop')
  updateShop(
    @Req() request: DeskAuthedRequest,
    @Body(new ZodValidationPipe(patchShopSchema)) body: PatchShopBody,
  ) {
    return this.desk.updateShop(request.desk.shopId, body);
  }

  @Get('payouts')
  payouts(@Req() request: DeskAuthedRequest) {
    return this.desk.payouts(request.desk.shopId);
  }

  @Get('insights')
  insights(
    @Req() request: DeskAuthedRequest,
    @Query(new ZodValidationPipe(insightsQuerySchema)) _query: { range?: '7d' },
  ) {
    return this.desk.insights(request.desk.shopId);
  }
}
