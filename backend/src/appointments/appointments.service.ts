import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  addDaysYmd,
  tehranClock,
  tehranLocalToUtc,
  weekdayFromYmd,
} from '../shops/shop-hours.js';
import { isBarberFree, startTimesForDay } from './availability.js';
import { normalizePhone } from './phone.js';
import type {
  AppointmentDto,
  AvailabilityDayDto,
  CreateAppointmentInput,
  PaymentSummaryDto,
} from './appointments.types.js';
import type { Prisma } from '../generated/prisma/client.js';

const HOLD_TTL_MS = 20 * 60 * 1000;
const HELD_STATUSES = ['booked', 'pending_payment'] as const;

const appointmentInclude = {
  shop: true,
  barber: true,
  service: true,
  payment: true,
} as const;

type AppointmentRecord = Prisma.AppointmentGetPayload<{
  include: typeof appointmentInclude;
}>;

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async expireStaleHolds(): Promise<number> {
    const cutoff = new Date(Date.now() - HOLD_TTL_MS);
    const stale = await this.prisma.appointment.findMany({
      where: {
        status: 'pending_payment',
        createdAt: { lt: cutoff },
      },
      select: { id: true },
    });
    if (stale.length === 0) {
      return 0;
    }
    const ids = stale.map((row) => row.id);
    await this.prisma.$transaction([
      this.prisma.appointment.updateMany({
        where: { id: { in: ids } },
        data: { status: 'cancelled' },
      }),
      this.prisma.payment.updateMany({
        where: { appointmentId: { in: ids }, status: 'requested' },
        data: { status: 'cancelled' },
      }),
    ]);
    return ids.length;
  }

  async availability(
    slug: string,
    serviceId: string,
    barberId?: string,
  ): Promise<AvailabilityDayDto[]> {
    await this.expireStaleHolds();
    const shop = await this.shopOrThrow(slug);
    const service = shop.services.find((item) => item.id === serviceId);
    if (!service) {
      throw new BadRequestException('Unknown service');
    }

    const barbers = barberId
      ? shop.barbers.filter((item) => item.id === barberId)
      : shop.barbers;
    if (barbers.length === 0) {
      throw new BadRequestException('Unknown barber');
    }

    const clock = tehranClock();
    const rangeStart = tehranLocalToUtc(clock.ymd, '00:00');
    const rangeEnd = tehranLocalToUtc(addDaysYmd(clock.ymd, 8), '00:00');
    const busy = await this.prisma.appointment.findMany({
      where: {
        shopId: shop.id,
        status: { in: [...HELD_STATUSES] },
        startsAt: { lt: rangeEnd },
        endsAt: { gt: rangeStart },
        barberId: { in: barbers.map((item) => item.id) },
      },
      select: { barberId: true, startsAt: true, endsAt: true },
    });

    const days: AvailabilityDayDto[] = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const ymd = addDaysYmd(clock.ymd, offset);
      const weekday = weekdayFromYmd(ymd);
      const hours = shop.hours.find((item) => item.weekday === weekday);
      const starts = hours ? startTimesForDay(hours, service.durationMin) : [];
      const slots = starts.filter((hhmm) => {
        if (offset === 0) {
          const startMinutes =
            Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
          if (startMinutes <= clock.minutes) {
            return false;
          }
        }
        const start = tehranLocalToUtc(ymd, hhmm);
        const end = new Date(start.getTime() + service.durationMin * 60_000);
        return barbers.some((barber) =>
          isBarberFree(barber.id, start, end, busy),
        );
      });
      days.push({ date: ymd, weekday, slots });
    }

    return days;
  }

  async holdChair(
    slug: string,
    input: CreateAppointmentInput,
  ): Promise<AppointmentDto> {
    const shop = await this.shopOrThrow(slug);
    const service = shop.services.find((item) => item.id === input.serviceId);
    if (!service) {
      throw new BadRequestException('Unknown service');
    }

    const start = tehranLocalToUtc(input.date, input.time);
    const end = new Date(start.getTime() + service.durationMin * 60_000);
    if (start.getTime() <= Date.now()) {
      throw new BadRequestException('That time has already passed');
    }

    const clock = tehranClock();
    const lastDate = addDaysYmd(clock.ymd, 6);
    if (input.date < clock.ymd || input.date > lastDate) {
      throw new BadRequestException('Pick a day in the next week');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const candidates = input.barberId
        ? shop.barbers.filter((item) => item.id === input.barberId)
        : shop.barbers;
      if (candidates.length === 0) {
        throw new BadRequestException('Unknown barber');
      }

      const busy = await tx.appointment.findMany({
        where: {
          shopId: shop.id,
          status: { in: [...HELD_STATUSES] },
          startsAt: { lt: end },
          endsAt: { gt: start },
          barberId: { in: candidates.map((item) => item.id) },
        },
        select: { barberId: true, startsAt: true, endsAt: true },
      });

      const barber = candidates.find((item) =>
        isBarberFree(item.id, start, end, busy),
      );
      if (!barber) {
        throw new ConflictException('That chair is no longer free');
      }

      let code = '';
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const next = randomBytes(3).toString('hex').toUpperCase();
        const exists = await tx.appointment.findUnique({
          where: { code: next },
        });
        if (!exists) {
          code = next;
          break;
        }
      }
      if (!code) {
        throw new Error('Could not allocate a booking code');
      }

      return tx.appointment.create({
        data: {
          code,
          shopId: shop.id,
          barberId: barber.id,
          serviceId: service.id,
          customerName: input.customerName.trim(),
          customerPhone: parsePhone(input.customerPhone),
          startsAt: start,
          endsAt: end,
          status: 'pending_payment',
        },
        include: appointmentInclude,
      });
    });

    return toDto(created);
  }

  async confirmPaid(
    appointmentId: string,
    details: {
      refId: string | null;
      cardPan: string | null;
      fee: number | null;
      feeType: string | null;
      rawVerify?: Prisma.InputJsonValue;
    },
  ): Promise<AppointmentDto> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: { payment: true },
      });
      if (!existing?.payment) {
        throw new NotFoundException('Booking not found');
      }
      if (existing.payment.status === 'paid' && existing.status === 'booked') {
        return tx.appointment.findUniqueOrThrow({
          where: { id: appointmentId },
          include: appointmentInclude,
        });
      }

      await tx.payment.update({
        where: { id: existing.payment.id },
        data: {
          status: 'paid',
          refId: details.refId,
          cardPan: details.cardPan,
          fee: details.fee,
          feeType: details.feeType,
          rawVerify: details.rawVerify,
        },
      });

      return tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'booked' },
        include: appointmentInclude,
      });
    });

    return toDto(updated);
  }

  async releaseHold(
    appointmentId: string,
    paymentStatus: 'failed' | 'cancelled',
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.appointment.updateMany({
        where: { id: appointmentId, status: 'pending_payment' },
        data: { status: 'cancelled' },
      }),
      this.prisma.payment.updateMany({
        where: { appointmentId, status: 'requested' },
        data: { status: paymentStatus },
      }),
    ]);
  }

  toPublicDto(row: AppointmentRecord): AppointmentDto {
    return toDto(row);
  }

  async lookup(code: string, phone: string): Promise<AppointmentDto> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        customerPhone: parsePhone(phone),
        status: { not: 'pending_payment' },
      },
      include: appointmentInclude,
    });
    if (!appointment) {
      throw new NotFoundException('Booking not found');
    }
    return toDto(appointment);
  }

  async listByPhone(phone: string): Promise<AppointmentDto[]> {
    const rows = await this.prisma.appointment.findMany({
      where: {
        customerPhone: parsePhone(phone),
        status: 'booked',
        startsAt: { gt: new Date() },
      },
      orderBy: { startsAt: 'asc' },
      take: 5,
      include: appointmentInclude,
    });
    if (rows.length === 0) {
      throw new NotFoundException('Booking not found');
    }
    return rows.map(toDto);
  }

  async cancelByGuest(code: string, phone: string): Promise<AppointmentDto> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        customerPhone: parsePhone(phone),
        status: 'booked',
      },
    });
    if (!appointment) {
      throw new NotFoundException('Booking not found');
    }
    if (appointment.startsAt.getTime() <= Date.now()) {
      throw new BadRequestException(
        'This booking can no longer be cancelled here',
      );
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'cancelled' },
      include: appointmentInclude,
    });
    return toDto(updated);
  }

  async listForShop(
    shopId: string,
    date: string,
    phone?: string,
  ): Promise<AppointmentDto[]> {
    await this.expireStaleHolds();
    const dayStart = tehranLocalToUtc(date, '00:00');
    const dayEnd = tehranLocalToUtc(addDaysYmd(date, 1), '00:00');
    const rows = await this.prisma.appointment.findMany({
      where: {
        shopId,
        ...(phone ? { customerPhone: parsePhone(phone) } : {}),
        startsAt: { gte: dayStart, lt: dayEnd },
      },
      orderBy: { startsAt: 'asc' },
      include: appointmentInclude,
    });
    return rows.map(toDto);
  }

  async updateStatus(
    shopId: string,
    id: string,
    status: 'booked' | 'completed' | 'cancelled',
  ): Promise<AppointmentDto> {
    const existing = await this.prisma.appointment.findFirst({
      where: { id, shopId },
      include: { payment: true },
    });
    if (!existing) {
      throw new NotFoundException('Booking not found');
    }

    if (status === 'completed') {
      if (
        existing.status !== 'booked' ||
        existing.payment?.status !== 'paid'
      ) {
        throw new BadRequestException(
          'Only a paid booking can be marked done',
        );
      }
    }

    if (status === 'booked' && existing.status !== 'booked') {
      throw new BadRequestException('Payment is required to confirm this chair');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (status === 'cancelled' && existing.payment?.status === 'requested') {
        await tx.payment.update({
          where: { id: existing.payment.id },
          data: { status: 'cancelled' },
        });
      }
      return tx.appointment.update({
        where: { id },
        data: { status },
        include: appointmentInclude,
      });
    });
    return toDto(updated);
  }

  private async shopOrThrow(slug: string) {
    const shop = await this.prisma.shop.findFirst({
      where: { slug, published: true },
      include: {
        barbers: { orderBy: { sortOrder: 'asc' } },
        services: true,
        hours: true,
      },
    });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    return shop;
  }
}

function toDto(row: AppointmentRecord): AppointmentDto {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    payment: toPaymentDto(row.payment),
    shop: {
      slug: row.shop.slug,
      name: { en: row.shop.nameEn, fa: row.shop.nameFa },
      address: { en: row.shop.addressEn, fa: row.shop.addressFa },
      neighborhood: { en: row.shop.neighborhoodEn, fa: row.shop.neighborhoodFa },
      city: { en: row.shop.cityEn, fa: row.shop.cityFa },
      lat: row.shop.lat,
      lng: row.shop.lng,
    },
    barber: { name: { en: row.barber.nameEn, fa: row.barber.nameFa } },
    service: {
      name: { en: row.service.nameEn, fa: row.service.nameFa },
      durationMin: row.service.durationMin,
      priceToman: row.service.priceToman,
    },
  };
}

function toPaymentDto(
  payment: AppointmentRecord['payment'],
): PaymentSummaryDto | null {
  if (!payment) {
    return null;
  }
  return {
    status: payment.status,
    amount: payment.amount,
    refId: payment.refId,
  };
}

function parsePhone(value: string): string {
  try {
    return normalizePhone(value);
  } catch {
    throw new BadRequestException('Enter a mobile number like 09121234567');
  }
}
