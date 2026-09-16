import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AppointmentsService } from '../appointments/appointments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DeskGuard } from '../auth/desk.guard.js';
import { DeskService } from './desk.service.js';
import { NOTIFIER } from '../notifications/notifier.js';

describe('Desk shop isolation', () => {
  it('DeskGuard rejects a request without a cookie', () => {
    const guard = new DeskGuard();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ cookies: {} }),
      }),
    };

    expect(() =>
      guard.canActivate(context as never),
    ).toThrow(UnauthorizedException);
  });

  it('does not load another shop’s appointment', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: NOTIFIER, useValue: { newBooking: vi.fn() } },
        {
          provide: PrismaService,
          useValue: {
            appointment: { findFirst },
          },
        },
      ],
    }).compile();

    const service = module.get(AppointmentsService);

    await expect(
      service.getForShop('shop-farhad', 'appt-from-siah'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'appt-from-siah', shopId: 'shop-farhad' },
      }),
    );
  });

  it('lists appointments only for the signed-in shop', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: NOTIFIER, useValue: { newBooking: vi.fn() } },
        {
          provide: PrismaService,
          useValue: {
            appointment: {
              findMany,
            },
          },
        },
      ],
    }).compile();

    const service = module.get(AppointmentsService);
    await service.listForShop('shop-farhad', { date: '2026-09-16' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ shopId: 'shop-farhad' }),
      }),
    );
    const shopScoped = findMany.mock.calls.find(
      (call) => call[0]?.where?.shopId === 'shop-farhad',
    );
    expect(shopScoped).toBeTruthy();
    expect(shopScoped?.[0].where.shopId).toBe('shop-farhad');
  });

  it('does not patch another shop’s barber', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const update = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeskService,
        {
          provide: PrismaService,
          useValue: {
            barber: { findFirst, update },
          },
        },
      ],
    }).compile();

    const desk = module.get(DeskService);
    await expect(
      desk.updateBarber('shop-farhad', 'barber-siah', { nameEn: 'Nope' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'barber-siah', shopId: 'shop-farhad' },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('does not delete another shop’s time off', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const del = vi.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeskService,
        {
          provide: PrismaService,
          useValue: {
            barberTimeOff: { findFirst, delete: del },
          },
        },
      ],
    }).compile();

    const desk = module.get(DeskService);
    await expect(
      desk.deleteTimeOff('shop-farhad', 'timeoff-siah'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'timeoff-siah', barber: { shopId: 'shop-farhad' } },
    });
    expect(del).not.toHaveBeenCalled();
  });
});
