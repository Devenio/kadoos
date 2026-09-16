import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  addDaysYmd,
  clockFromMinutes,
  tehranClock,
  tehranLocalToUtc,
  weekdayFromYmd,
} from '../shops/shop-hours.js';
import { isBarberFree, startTimesForDay, type BusyRange } from './availability.js';
import { normalizePhone } from './phone.js';
import type {
  AppointmentDto,
  AvailabilityDayDto,
  CreateAppointmentInput,
  ListShopAppointmentsQuery,
  PaymentSummaryDto,
} from './appointments.types.js';
import type { Prisma } from '../generated/prisma/client.js';
import { NOTIFIER, type Notifier } from '../notifications/notifier.js';
import type {
  UpdateAppointmentBody,
  WalkInBody,
} from '../desk/desk.schemas.js';

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
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFIER) private readonly notifier: Notifier,
  ) {}

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
    const busy = await this.busyRanges(
      shop.id,
      barbers.map((item) => item.id),
      rangeStart,
      rangeEnd,
    );

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

      const busy = await this.busyRanges(
        shop.id,
        candidates.map((item) => item.id),
        start,
        end,
        tx,
      );

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
          source: 'online',
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

    this.notifier.newBooking({
      shopId: updated.shopId,
      code: updated.code,
      customerName: updated.customerName,
      source: 'online',
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
    query: ListShopAppointmentsQuery,
  ): Promise<AppointmentDto[]> {
    await this.expireStaleHolds();
    const clock = tehranClock();
    const from = query.from ?? query.date ?? clock.ymd;
    const toExclusive = query.to
      ? addDaysYmd(query.to, 1)
      : addDaysYmd(query.date ?? from, 1);
    const rangeStart = tehranLocalToUtc(from, '00:00');
    const rangeEnd = tehranLocalToUtc(toExclusive, '00:00');

    let phoneFilter: string | undefined;
    if (query.phone) {
      phoneFilter = parsePhone(query.phone);
    }

    const search = query.q?.trim();
    const searchOr: Prisma.AppointmentWhereInput[] = [];
    if (search) {
      searchOr.push(
        { customerName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search.toUpperCase(), mode: 'insensitive' } },
      );
      try {
        searchOr.push({ customerPhone: { contains: parsePhone(search) } });
      } catch {
        searchOr.push({ customerPhone: { contains: search } });
      }
    }

    const rows = await this.prisma.appointment.findMany({
      where: {
        shopId,
        startsAt: { gte: rangeStart, lt: rangeEnd },
        ...(query.barberId ? { barberId: query.barberId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(phoneFilter ? { customerPhone: phoneFilter } : {}),
        ...(searchOr.length > 0 ? { OR: searchOr } : {}),
      },
      orderBy: { startsAt: 'asc' },
      include: appointmentInclude,
    });
    return rows.map(toDto);
  }

  async getForShop(shopId: string, id: string): Promise<AppointmentDto> {
    const row = await this.prisma.appointment.findFirst({
      where: { id, shopId },
      include: appointmentInclude,
    });
    if (!row) {
      throw new NotFoundException('Booking not found');
    }
    return toDto(row);
  }

  async updateForShop(
    shopId: string,
    id: string,
    body: UpdateAppointmentBody,
  ): Promise<AppointmentDto> {
    const existing = await this.prisma.appointment.findFirst({
      where: { id, shopId },
      include: { payment: true },
    });
    if (!existing) {
      throw new NotFoundException('Booking not found');
    }

    const status = body.status;
    if (status === 'completed') {
      const paid = existing.payment?.status === 'paid';
      const walkIn = existing.source === 'walk_in';
      if (existing.status !== 'booked' || (!paid && !walkIn)) {
        throw new BadRequestException('Only a booked visit can be marked done');
      }
    }

    if (status === 'no_show' && existing.status !== 'booked') {
      throw new BadRequestException('Only a booked visit can be a no-show');
    }

    if (status === 'booked' && existing.status !== 'booked') {
      if (existing.status === 'pending_payment') {
        throw new BadRequestException(
          'Payment is required to confirm this chair',
        );
      }
      if (
        existing.status !== 'completed' &&
        existing.status !== 'cancelled' &&
        existing.status !== 'no_show'
      ) {
        throw new BadRequestException('This visit cannot be restored');
      }
      if (
        existing.status === 'cancelled' &&
        existing.source === 'online' &&
        existing.payment?.status !== 'paid'
      ) {
        throw new BadRequestException('This unpaid hold cannot be restored');
      }
      const busy = await this.busyRanges(
        shopId,
        [existing.barberId],
        existing.startsAt,
        existing.endsAt,
      );
      const others = busy.filter(
        (item) =>
          !(
            item.barberId === existing.barberId &&
            item.startsAt.getTime() === existing.startsAt.getTime() &&
            item.endsAt.getTime() === existing.endsAt.getTime()
          ),
      );
      if (
        !isBarberFree(
          existing.barberId,
          existing.startsAt,
          existing.endsAt,
          others,
        )
      ) {
        throw new ConflictException('That chair is no longer free');
      }
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
        data: {
          ...(status ? { status } : {}),
          ...(body.notes !== undefined ? { notes: body.notes } : {}),
        },
        include: appointmentInclude,
      });
    });
    return toDto(updated);
  }

  async createWalkIn(shopId: string, input: WalkInBody): Promise<AppointmentDto> {
    await this.expireStaleHolds();
    const shop = await this.prisma.shop.findFirst({
      where: { id: shopId },
      include: {
        barbers: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
        },
        services: { where: { active: true } },
        hours: true,
      },
    });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const service = shop.services.find((item) => item.id === input.serviceId);
    if (!service) {
      throw new BadRequestException('Unknown service');
    }
    const barber = shop.barbers.find((item) => item.id === input.barberId);
    if (!barber) {
      throw new BadRequestException('Unknown barber');
    }

    const slot = await this.resolveWalkInSlot(
      shop,
      barber.id,
      service.durationMin,
      input,
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const busy = await this.busyRanges(
        shop.id,
        [barber.id],
        slot.start,
        slot.end,
        tx,
      );
      if (!isBarberFree(barber.id, slot.start, slot.end, busy)) {
        throw new ConflictException('That chair is no longer free');
      }

      const code = await allocateCode(tx);
      return tx.appointment.create({
        data: {
          code,
          shopId: shop.id,
          barberId: barber.id,
          serviceId: service.id,
          customerName: input.customerName.trim(),
          customerPhone: parsePhone(input.customerPhone),
          startsAt: slot.start,
          endsAt: slot.end,
          status: 'booked',
          source: 'walk_in',
          notes: input.notes?.trim() || null,
        },
        include: appointmentInclude,
      });
    });

    this.notifier.newBooking({
      shopId: created.shopId,
      code: created.code,
      customerName: created.customerName,
      source: 'walk_in',
    });
    return toDto(created);
  }

  private async resolveWalkInSlot(
    shop: {
      id: string;
      hours: {
        weekday: number;
        closed: boolean;
        opensAt: string | null;
        closesAt: string | null;
      }[];
    },
    barberId: string,
    durationMin: number,
    input: WalkInBody,
  ): Promise<{ start: Date; end: Date }> {
    if (
      input.date &&
      input.time &&
      input.when !== 'now' &&
      input.when !== 'next'
    ) {
      const start = tehranLocalToUtc(input.date, input.time);
      return {
        start,
        end: new Date(start.getTime() + durationMin * 60_000),
      };
    }

    const clock = tehranClock();
    if (input.when === 'now' || !input.when) {
      const rounded = roundUpMinutes(clock.minutes, 5);
      const ymd = rounded >= 24 * 60 ? addDaysYmd(clock.ymd, 1) : clock.ymd;
      const minutes = rounded >= 24 * 60 ? rounded - 24 * 60 : rounded;
      const start = tehranLocalToUtc(ymd, clockFromMinutes(minutes));
      return {
        start,
        end: new Date(start.getTime() + durationMin * 60_000),
      };
    }

    const rangeStart = tehranLocalToUtc(clock.ymd, '00:00');
    const rangeEnd = tehranLocalToUtc(addDaysYmd(clock.ymd, 8), '00:00');
    const busy = await this.busyRanges(shop.id, [barberId], rangeStart, rangeEnd);

    for (let offset = 0; offset < 7; offset += 1) {
      const ymd = addDaysYmd(clock.ymd, offset);
      const weekday = weekdayFromYmd(ymd);
      const hours = shop.hours.find((item) => item.weekday === weekday);
      const starts = hours ? startTimesForDay(hours, durationMin) : [];
      for (const hhmm of starts) {
        if (offset === 0) {
          const startMinutes =
            Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
          if (startMinutes <= clock.minutes) {
            continue;
          }
        }
        const start = tehranLocalToUtc(ymd, hhmm);
        const end = new Date(start.getTime() + durationMin * 60_000);
        if (isBarberFree(barberId, start, end, busy)) {
          return { start, end };
        }
      }
    }

    throw new ConflictException('No free chair in the next week');
  }

  private async shopOrThrow(slug: string) {
    const shop = await this.prisma.shop.findFirst({
      where: { slug, published: true },
      include: {
        barbers: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
        services: { where: { active: true } },
        hours: true,
      },
    });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    return shop;
  }

  private async busyRanges(
    shopId: string,
    barberIds: string[],
    rangeStart: Date,
    rangeEnd: Date,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<BusyRange[]> {
    const [appointments, timeOff] = await Promise.all([
      tx.appointment.findMany({
        where: {
          shopId,
          status: { in: [...HELD_STATUSES] },
          startsAt: { lt: rangeEnd },
          endsAt: { gt: rangeStart },
          barberId: { in: barberIds },
        },
        select: { barberId: true, startsAt: true, endsAt: true },
      }),
      tx.barberTimeOff.findMany({
        where: {
          barberId: { in: barberIds },
          startsAt: { lt: rangeEnd },
          endsAt: { gt: rangeStart },
        },
        select: { barberId: true, startsAt: true, endsAt: true },
      }),
    ]);
    return [...appointments, ...timeOff];
  }
}

function toDto(row: AppointmentRecord): AppointmentDto {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    source: row.source,
    notes: row.notes,
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
    barber: {
      id: row.barber.id,
      name: { en: row.barber.nameEn, fa: row.barber.nameFa },
    },
    service: {
      id: row.service.id,
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

function roundUpMinutes(minutes: number, step: number): number {
  const rem = minutes % step;
  return rem === 0 ? minutes : minutes + (step - rem);
}

async function allocateCode(tx: Prisma.TransactionClient): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const next = randomBytes(3).toString('hex').toUpperCase();
    const exists = await tx.appointment.findUnique({ where: { code: next } });
    if (!exists) {
      return next;
    }
  }
  throw new Error('Could not allocate a booking code');
}
