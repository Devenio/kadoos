import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { isOpenNow, nextOpenDay, tehranClock } from './shop-hours.js';
import type {
  ShopDetailDto,
  ShopHoursDto,
  ShopSummaryDto,
} from './shops.types.js';

const shopInclude = {
  barbers: { orderBy: { sortOrder: 'asc' as const } },
  services: { orderBy: { sortOrder: 'asc' as const } },
  hours: { orderBy: { weekday: 'asc' as const } },
};

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<ShopSummaryDto[]> {
    const shops = await this.prisma.shop.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
      include: shopInclude,
    });

    const clock = tehranClock();
    return shops.map((shop) => toSummary(shop, clock));
  }

  async getBySlug(slug: string): Promise<ShopDetailDto> {
    const shop = await this.prisma.shop.findFirst({
      where: { slug, published: true },
      include: shopInclude,
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const clock = tehranClock();
    const summary = toSummary(shop, clock);

    return {
      ...summary,
      description: { en: shop.descriptionEn, fa: shop.descriptionFa },
      barbers: shop.barbers.map((barber) => ({
        id: barber.id,
        name: { en: barber.nameEn, fa: barber.nameFa },
        title: { en: barber.titleEn, fa: barber.titleFa },
        bio: { en: barber.bioEn, fa: barber.bioFa },
      })),
      services: shop.services.map((service) => ({
        id: service.id,
        name: { en: service.nameEn, fa: service.nameFa },
        durationMin: service.durationMin,
        priceToman: service.priceToman,
      })),
      hours: shop.hours.map(toHoursDto),
    };
  }
}

type ShopRecord = {
  slug: string;
  nameEn: string;
  nameFa: string;
  taglineEn: string;
  taglineFa: string;
  neighborhoodEn: string;
  neighborhoodFa: string;
  cityEn: string;
  cityFa: string;
  barbers: { id: string }[];
  services: { priceToman: number }[];
  hours: {
    weekday: number;
    closed: boolean;
    opensAt: string | null;
    closesAt: string | null;
  }[];
};

function toSummary(
  shop: ShopRecord,
  clock: ReturnType<typeof tehranClock>,
): ShopSummaryDto {
  const hours = shop.hours.map(toHoursDto);
  const hoursToday =
    hours.find((item) => item.weekday === clock.weekday) ??
    ({
      weekday: clock.weekday,
      closed: true,
      opensAt: null,
      closesAt: null,
    } satisfies ShopHoursDto);

  return {
    slug: shop.slug,
    name: { en: shop.nameEn, fa: shop.nameFa },
    tagline: { en: shop.taglineEn, fa: shop.taglineFa },
    neighborhood: { en: shop.neighborhoodEn, fa: shop.neighborhoodFa },
    city: { en: shop.cityEn, fa: shop.cityFa },
    openNow: isOpenNow(hoursToday, clock),
    hoursToday,
    nextOpen: hoursToday.closed || !isOpenNow(hoursToday, clock)
      ? nextOpenFrom(hours, hoursToday, clock)
      : null,
    barberCount: shop.barbers.length,
    serviceFromToman:
      shop.services.length > 0
        ? Math.min(...shop.services.map((service) => service.priceToman))
        : null,
  };
}

function nextOpenFrom(
  hours: ShopHoursDto[],
  hoursToday: ShopHoursDto,
  clock: ReturnType<typeof tehranClock>,
): ShopHoursDto | null {
  if (!hoursToday.closed) {
    const opens = hoursToday.opensAt;
    const opensMinutes = opens
      ? Number(opens.slice(0, 2)) * 60 + Number(opens.slice(3, 5))
      : null;
    if (opensMinutes !== null && clock.minutes < opensMinutes) {
      return hoursToday;
    }
  }

  return nextOpenDay(hours, clock);
}

function toHoursDto(hours: {
  weekday: number;
  closed: boolean;
  opensAt: string | null;
  closesAt: string | null;
}): ShopHoursDto {
  return {
    weekday: hours.weekday,
    closed: hours.closed,
    opensAt: hours.opensAt,
    closesAt: hours.closesAt,
  };
}
