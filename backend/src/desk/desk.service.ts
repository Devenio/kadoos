import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { env } from '../common/config/env.js';
import { isValidIban, normalizeIban } from '../payments/iban.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  addDaysYmd,
  isOpenNow,
  tehranClock,
  tehranLocalToUtc,
} from '../shops/shop-hours.js';
import type {
  CreateTimeOffBody,
  PatchBarberBody,
  PatchServiceBody,
  PatchShopBody,
  ReplaceHoursBody,
  UpsertBarberBody,
  UpsertServiceBody,
} from './desk.schemas.js';
import type {
  DeskBarberDto,
  DeskHoursPreviewDto,
  DeskInsightsDto,
  DeskPayoutsDto,
  DeskServiceDto,
  DeskShopDto,
  DeskTimeOffDto,
} from './desk.types.js';

@Injectable()
export class DeskService {
  constructor(private readonly prisma: PrismaService) {}

  async listBarbers(shopId: string): Promise<DeskBarberDto[]> {
    const rows = await this.prisma.barber.findMany({
      where: { shopId },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toBarberDto);
  }

  async createBarber(
    shopId: string,
    body: UpsertBarberBody,
  ): Promise<DeskBarberDto> {
    const sortOrder =
      body.sortOrder ??
      (await nextSortOrder(this.prisma.barber, shopId));
    const row = await this.prisma.barber.create({
      data: {
        shopId,
        nameEn: body.nameEn,
        nameFa: body.nameFa,
        titleEn: body.titleEn,
        titleFa: body.titleFa,
        bioEn: body.bioEn,
        bioFa: body.bioFa,
        sortOrder,
        active: body.active ?? true,
      },
    });
    return toBarberDto(row);
  }

  async updateBarber(
    shopId: string,
    id: string,
    body: PatchBarberBody,
  ): Promise<DeskBarberDto> {
    await this.barberOrThrow(shopId, id);
    const row = await this.prisma.barber.update({
      where: { id },
      data: body,
    });
    return toBarberDto(row);
  }

  async reorderBarbers(
    shopId: string,
    ids: string[],
  ): Promise<DeskBarberDto[]> {
    const existing = await this.prisma.barber.findMany({
      where: { shopId },
      select: { id: true },
    });
    assertReorder(ids, existing.map((row) => row.id), 'barber');
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.barber.update({
          where: { id },
          data: { sortOrder: index + 1 },
        }),
      ),
    );
    return this.listBarbers(shopId);
  }

  async listServices(shopId: string): Promise<DeskServiceDto[]> {
    const rows = await this.prisma.service.findMany({
      where: { shopId },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toServiceDto);
  }

  async createService(
    shopId: string,
    body: UpsertServiceBody,
  ): Promise<DeskServiceDto> {
    const sortOrder =
      body.sortOrder ??
      (await nextSortOrder(this.prisma.service, shopId));
    const row = await this.prisma.service.create({
      data: {
        shopId,
        nameEn: body.nameEn,
        nameFa: body.nameFa,
        durationMin: body.durationMin,
        priceToman: body.priceToman,
        sortOrder,
        active: body.active ?? true,
      },
    });
    return toServiceDto(row);
  }

  async updateService(
    shopId: string,
    id: string,
    body: PatchServiceBody,
  ): Promise<DeskServiceDto> {
    await this.serviceOrThrow(shopId, id);
    const row = await this.prisma.service.update({
      where: { id },
      data: body,
    });
    return toServiceDto(row);
  }

  async reorderServices(
    shopId: string,
    ids: string[],
  ): Promise<DeskServiceDto[]> {
    const existing = await this.prisma.service.findMany({
      where: { shopId },
      select: { id: true },
    });
    assertReorder(ids, existing.map((row) => row.id), 'service');
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.service.update({
          where: { id },
          data: { sortOrder: index + 1 },
        }),
      ),
    );
    return this.listServices(shopId);
  }

  async getHours(shopId: string): Promise<DeskHoursPreviewDto> {
    const hours = await this.prisma.shopHours.findMany({
      where: { shopId },
      orderBy: { weekday: 'asc' },
    });
    const clock = tehranClock();
    const today =
      hours.find((item) => item.weekday === clock.weekday) ?? null;
    return {
      hours: hours.map((item) => ({
        weekday: item.weekday,
        closed: item.closed,
        opensAt: item.opensAt,
        closesAt: item.closesAt,
      })),
      openNow: today
        ? isOpenNow(today, clock)
        : false,
      weekday: clock.weekday,
    };
  }

  async replaceHours(
    shopId: string,
    body: ReplaceHoursBody,
  ): Promise<DeskHoursPreviewDto> {
    await this.prisma.$transaction(
      body.days.map((day) =>
        this.prisma.shopHours.upsert({
          where: {
            shopId_weekday: { shopId, weekday: day.weekday },
          },
          create: {
            shopId,
            weekday: day.weekday,
            closed: day.closed,
            opensAt: day.closed ? null : day.opensAt,
            closesAt: day.closed ? null : day.closesAt,
          },
          update: {
            closed: day.closed,
            opensAt: day.closed ? null : day.opensAt,
            closesAt: day.closed ? null : day.closesAt,
          },
        }),
      ),
    );
    return this.getHours(shopId);
  }

  async getShop(shopId: string): Promise<DeskShopDto> {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }
    return toShopDto(shop);
  }

  async updateShop(shopId: string, body: PatchShopBody): Promise<DeskShopDto> {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const iban =
      body.iban === undefined
        ? undefined
        : body.iban === null
          ? null
          : normalizeIban(body.iban);

    const row = await this.prisma.shop.update({
      where: { id: shopId },
      data: {
        published: body.published,
        nameEn: body.nameEn,
        nameFa: body.nameFa,
        taglineEn: body.taglineEn,
        taglineFa: body.taglineFa,
        descriptionEn: body.descriptionEn,
        descriptionFa: body.descriptionFa,
        neighborhoodEn: body.neighborhoodEn,
        neighborhoodFa: body.neighborhoodFa,
        cityEn: body.cityEn,
        cityFa: body.cityFa,
        addressEn: body.addressEn,
        addressFa: body.addressFa,
        lat: body.lat,
        lng: body.lng,
        photoUrl: body.photoUrl,
        iban,
        payoutReady:
          iban === undefined ? undefined : isValidIban(iban),
      },
    });
    return toShopDto(row);
  }

  async listTimeOff(
    shopId: string,
    barberId: string,
  ): Promise<DeskTimeOffDto[]> {
    await this.barberOrThrow(shopId, barberId);
    const from = tehranLocalToUtc(addDaysYmd(tehranClock().ymd, -1), '00:00');
    const rows = await this.prisma.barberTimeOff.findMany({
      where: {
        barberId,
        endsAt: { gt: from },
      },
      orderBy: { startsAt: 'asc' },
    });
    return rows.map(toTimeOffDto);
  }

  async createTimeOff(
    shopId: string,
    barberId: string,
    body: CreateTimeOffBody,
  ): Promise<DeskTimeOffDto> {
    await this.barberOrThrow(shopId, barberId);
    const startsAt = new Date(body.startsAt);
    const endsAt = new Date(body.endsAt);
    const row = await this.prisma.barberTimeOff.create({
      data: {
        barberId,
        startsAt,
        endsAt,
        reason: body.reason ?? null,
      },
    });
    return toTimeOffDto(row);
  }

  async deleteTimeOff(shopId: string, id: string): Promise<{ ok: true }> {
    const row = await this.prisma.barberTimeOff.findFirst({
      where: { id, barber: { shopId } },
    });
    if (!row) {
      throw new NotFoundException('Time off not found');
    }
    await this.prisma.barberTimeOff.delete({ where: { id } });
    return { ok: true };
  }

  async payouts(shopId: string): Promise<DeskPayoutsDto> {
    const shop = await this.prisma.shop.findUnique({
      where: { id: shopId },
      select: { iban: true, payoutReady: true },
    });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const recent = await this.prisma.payment.findMany({
      where: {
        status: 'paid',
        appointment: { shopId },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        appointment: {
          select: { id: true, code: true, customerName: true },
        },
      },
    });

    return {
      iban: shop.iban,
      payoutReady: shop.payoutReady && isValidIban(shop.iban),
      feePercent: env.KADOOS_FEE_PERCENT,
      recent: recent.map((row) => ({
        id: row.id,
        appointmentId: row.appointment.id,
        code: row.appointment.code,
        customerName: row.appointment.customerName,
        amount: row.amount,
        shopShare: row.shopShare,
        refId: row.refId,
        paidAt: row.updatedAt.toISOString(),
      })),
    };
  }

  async insights(shopId: string): Promise<DeskInsightsDto> {
    const clock = tehranClock();
    const todayStart = tehranLocalToUtc(clock.ymd, '00:00');
    const todayEnd = tehranLocalToUtc(addDaysYmd(clock.ymd, 1), '00:00');
    const weekStart = tehranLocalToUtc(addDaysYmd(clock.ymd, -6), '00:00');

    const [todayRows, weekRows, paidWeek, latest] = await Promise.all([
      this.prisma.appointment.groupBy({
        by: ['status'],
        where: {
          shopId,
          startsAt: { gte: todayStart, lt: todayEnd },
        },
        _count: { _all: true },
      }),
      this.prisma.appointment.findMany({
        where: {
          shopId,
          status: { not: 'pending_payment' },
          startsAt: { gte: weekStart, lt: todayEnd },
        },
        select: {
          status: true,
          serviceId: true,
          service: { select: { nameEn: true, nameFa: true } },
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: 'paid',
          updatedAt: { gte: weekStart, lt: todayEnd },
          appointment: { shopId },
        },
        _sum: { shopShare: true },
      }),
      this.prisma.appointment.findFirst({
        where: { shopId, status: { not: 'pending_payment' } },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const todayCount = (status: string) =>
      todayRows.find((row) => row.status === status)?._count._all ?? 0;

    const weekCount = weekRows.length;
    const completed = weekRows.filter((row) => row.status === 'completed').length;
    const serviceCounts = new Map<
      string,
      { nameEn: string; nameFa: string; count: number }
    >();
    for (const row of weekRows) {
      const current = serviceCounts.get(row.serviceId);
      if (current) {
        current.count += 1;
      } else {
        serviceCounts.set(row.serviceId, {
          nameEn: row.service.nameEn,
          nameFa: row.service.nameFa,
          count: 1,
        });
      }
    }
    const top = [...serviceCounts.values()].sort((a, b) => b.count - a.count)[0];

    return {
      today: {
        booked: todayCount('booked'),
        completed: todayCount('completed'),
        cancelled: todayCount('cancelled'),
        noShow: todayCount('no_show'),
        pendingPayment: todayCount('pending_payment'),
      },
      last7Days: {
        count: weekCount,
        completedRate: weekCount === 0 ? 0 : completed / weekCount,
        shopShareToman: paidWeek._sum.shopShare ?? 0,
        topService: top
          ? {
              name: { en: top.nameEn, fa: top.nameFa },
              count: top.count,
            }
          : null,
      },
      latestCreatedAt: latest?.createdAt.toISOString() ?? null,
    };
  }

  private async barberOrThrow(shopId: string, id: string) {
    const row = await this.prisma.barber.findFirst({ where: { id, shopId } });
    if (!row) {
      throw new NotFoundException('Barber not found');
    }
    return row;
  }

  private async serviceOrThrow(shopId: string, id: string) {
    const row = await this.prisma.service.findFirst({ where: { id, shopId } });
    if (!row) {
      throw new NotFoundException('Service not found');
    }
    return row;
  }
}

function toBarberDto(row: {
  id: string;
  nameEn: string;
  nameFa: string;
  titleEn: string;
  titleFa: string;
  bioEn: string;
  bioFa: string;
  sortOrder: number;
  active: boolean;
}): DeskBarberDto {
  return {
    id: row.id,
    name: { en: row.nameEn, fa: row.nameFa },
    title: { en: row.titleEn, fa: row.titleFa },
    bio: { en: row.bioEn, fa: row.bioFa },
    sortOrder: row.sortOrder,
    active: row.active,
  };
}

function toServiceDto(row: {
  id: string;
  nameEn: string;
  nameFa: string;
  durationMin: number;
  priceToman: number;
  sortOrder: number;
  active: boolean;
}): DeskServiceDto {
  return {
    id: row.id,
    name: { en: row.nameEn, fa: row.nameFa },
    durationMin: row.durationMin,
    priceToman: row.priceToman,
    sortOrder: row.sortOrder,
    active: row.active,
  };
}

function toShopDto(shop: {
  id: string;
  slug: string;
  published: boolean;
  iban: string | null;
  payoutReady: boolean;
  nameEn: string;
  nameFa: string;
  taglineEn: string;
  taglineFa: string;
  descriptionEn: string;
  descriptionFa: string;
  neighborhoodEn: string;
  neighborhoodFa: string;
  cityEn: string;
  cityFa: string;
  addressEn: string;
  addressFa: string;
  lat: number;
  lng: number;
  photoUrl: string;
}): DeskShopDto {
  return {
    id: shop.id,
    slug: shop.slug,
    published: shop.published,
    iban: shop.iban,
    payoutReady: shop.payoutReady && isValidIban(shop.iban),
    feePercent: env.KADOOS_FEE_PERCENT,
    name: { en: shop.nameEn, fa: shop.nameFa },
    tagline: { en: shop.taglineEn, fa: shop.taglineFa },
    description: { en: shop.descriptionEn, fa: shop.descriptionFa },
    neighborhood: { en: shop.neighborhoodEn, fa: shop.neighborhoodFa },
    city: { en: shop.cityEn, fa: shop.cityFa },
    address: { en: shop.addressEn, fa: shop.addressFa },
    lat: shop.lat,
    lng: shop.lng,
    photoUrl: shop.photoUrl,
  };
}

function toTimeOffDto(row: {
  id: string;
  barberId: string;
  startsAt: Date;
  endsAt: Date;
  reason: string | null;
}): DeskTimeOffDto {
  return {
    id: row.id,
    barberId: row.barberId,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    reason: row.reason,
  };
}

async function nextSortOrder(
  model: { aggregate: (args: { where: { shopId: string }; _max: { sortOrder: true } }) => Promise<{ _max: { sortOrder: number | null } }> },
  shopId: string,
): Promise<number> {
  const result = await model.aggregate({
    where: { shopId },
    _max: { sortOrder: true },
  });
  return (result._max.sortOrder ?? 0) + 1;
}

function assertReorder(ids: string[], existing: string[], kind: string): void {
  if (ids.length !== existing.length) {
    throw new BadRequestException(`Send every ${kind} id, once`);
  }
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    throw new BadRequestException(`Send every ${kind} id, once`);
  }
  for (const id of ids) {
    if (!existing.includes(id)) {
      throw new BadRequestException(`Unknown ${kind}`);
    }
  }
}
