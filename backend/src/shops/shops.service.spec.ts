import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ShopsService } from './shops.service.js';

const farhadHours = [
  { weekday: 0, closed: true, opensAt: null, closesAt: null },
  { weekday: 1, closed: false, opensAt: '10:00', closesAt: '20:00' },
  { weekday: 2, closed: false, opensAt: '10:00', closesAt: '20:00' },
  { weekday: 3, closed: false, opensAt: '10:00', closesAt: '20:00' },
  { weekday: 4, closed: false, opensAt: '10:00', closesAt: '20:00' },
  { weekday: 5, closed: true, opensAt: null, closesAt: null },
  { weekday: 6, closed: false, opensAt: '10:00', closesAt: '20:00' },
];

const shop = {
  slug: 'farhad',
  nameEn: 'Farhad',
  nameFa: 'فرهاد',
  taglineEn: 'A quiet chair in Vanak.',
  taglineFa: 'صندلی آرام در ونک',
  neighborhoodEn: 'Vanak',
  neighborhoodFa: 'ونک',
  cityEn: 'Tehran',
  cityFa: 'تهران',
  descriptionEn: 'Classic cuts.',
  descriptionFa: 'کات کلاسیک',
  barbers: [
    {
      id: 'barber-1',
      nameEn: 'Farhad',
      nameFa: 'فرهاد',
      titleEn: 'Master barber',
      titleFa: 'استاد آرایشگر',
      bioEn: 'Twenty years on the chair.',
      bioFa: 'بیست سال روی صندلی',
    },
  ],
  services: [{ id: 'cut', nameEn: 'Classic cut', nameFa: 'کات کلاسیک', durationMin: 45, priceToman: 850000 }],
  hours: farhadHours,
};

describe('ShopsService', () => {
  let service: ShopsService;
  let findMany: ReturnType<typeof vi.fn>;
  let findFirst: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    findMany = vi.fn();
    findFirst = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopsService,
        {
          provide: PrismaService,
          useValue: {
            shop: {
              findMany,
              findFirst,
            },
          },
        },
      ],
    }).compile();

    service = module.get(ShopsService);
  });

  it('lists published shops with a starting price', async () => {
    findMany.mockResolvedValue([shop]);

    const [summary] = await service.list();

    expect(summary.slug).toBe('farhad');
    expect(summary.barberCount).toBe(1);
    expect(summary.serviceFromToman).toBe(850000);
    expect(summary.name.fa).toBe('فرهاد');
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { published: true },
      }),
    );
  });

  it('returns a shop by slug', async () => {
    findFirst.mockResolvedValue(shop);

    const detail = await service.getBySlug('farhad');

    expect(detail.services).toHaveLength(1);
    expect(detail.barbers[0]?.name.en).toBe('Farhad');
    expect(detail.hours).toHaveLength(7);
  });

  it('throws when the shop is missing', async () => {
    findFirst.mockResolvedValue(null);

    await expect(service.getBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
