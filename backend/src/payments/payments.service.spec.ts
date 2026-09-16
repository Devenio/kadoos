import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from '../appointments/appointments.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaymentsService } from './payments.service.js';
import { ZARINPAL_GATEWAY, type ZarinPalGateway } from './zarinpal.gateway.js';

const appointment = {
  id: 'appt-1',
  code: 'ABC123',
  status: 'pending_payment' as const,
  customerName: 'Nima',
  customerPhone: '09121234567',
  startsAt: new Date().toISOString(),
  endsAt: new Date().toISOString(),
  payment: {
    status: 'requested' as const,
    amount: 850000,
    refId: null,
  },
  shop: {
    slug: 'farhad',
    name: { en: 'Farhad', fa: 'فرهاد' },
    address: { en: '', fa: '' },
    neighborhood: { en: '', fa: '' },
    city: { en: '', fa: '' },
    lat: 0,
    lng: 0,
  },
  barber: { name: { en: 'Farhad', fa: 'فرهاد' } },
  service: {
    name: { en: 'Classic cut', fa: 'کات کلاسیک' },
    durationMin: 45,
    priceToman: 850000,
  },
};

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: {
    shop: { findFirst: ReturnType<typeof vi.fn> };
    payment: {
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };
  let appointments: {
    expireStaleHolds: ReturnType<typeof vi.fn>;
    holdChair: ReturnType<typeof vi.fn>;
    releaseHold: ReturnType<typeof vi.fn>;
    confirmPaid: ReturnType<typeof vi.fn>;
    toPublicDto: ReturnType<typeof vi.fn>;
  };
  let zarinpal: ZarinPalGateway;

  beforeEach(async () => {
    prisma = {
      shop: { findFirst: vi.fn() },
      payment: {
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
      },
    };
    appointments = {
      expireStaleHolds: vi.fn().mockResolvedValue(0),
      holdChair: vi.fn().mockResolvedValue(appointment),
      releaseHold: vi.fn().mockResolvedValue(undefined),
      confirmPaid: vi.fn(),
      toPublicDto: vi.fn(),
    };
    zarinpal = {
      createPayment: vi.fn().mockResolvedValue({ authority: 'A'.padEnd(36, '0') }),
      getRedirectUrl: vi.fn().mockReturnValue('https://sandbox.zarinpal.com/pg/StartPay/A'),
      verify: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AppointmentsService, useValue: appointments },
        { provide: ZARINPAL_GATEWAY, useValue: zarinpal },
      ],
    }).compile();

    service = module.get(PaymentsService);
  });

  it('refuses a shop without a valid IBAN', async () => {
    prisma.shop.findFirst.mockResolvedValue({
      slug: 'farhad',
      nameEn: 'Farhad',
      iban: null,
      payoutReady: false,
      services: [{ id: 'cut', nameEn: 'Classic cut', priceToman: 850000 }],
    });

    await expect(
      service.request({
        slug: 'farhad',
        serviceId: 'cut',
        date: '2026-09-17',
        time: '11:00',
        customerName: 'Nima',
        customerPhone: '09121234567',
        locale: 'en',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(appointments.holdChair).not.toHaveBeenCalled();
  });

  it('creates a pending hold and returns the ZarinPal URL', async () => {
    prisma.shop.findFirst.mockResolvedValue({
      slug: 'farhad',
      nameEn: 'Farhad',
      iban: 'IR130570028780010957775103',
      payoutReady: true,
      services: [{ id: 'cut', nameEn: 'Classic cut', priceToman: 850000 }],
    });
    prisma.payment.create.mockResolvedValue({ id: 'pay-1' });
    prisma.payment.update.mockResolvedValue({});

    const result = await service.request({
      slug: 'farhad',
      serviceId: 'cut',
      date: '2026-09-17',
      time: '11:00',
      customerName: 'Nima',
      customerPhone: '09121234567',
      locale: 'en',
    });

    expect(result.appointmentCode).toBe('ABC123');
    expect(result.redirectUrl).toContain('zarinpal');
    expect(zarinpal.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 850000,
        currency: 'IRT',
        wages: [
          expect.objectContaining({
            iban: 'IR130570028780010957775103',
            amount: 765000,
          }),
        ],
      }),
    );
  });

  it('confirms the chair when ZarinPal returns 100', async () => {
    const booked = {
      ...appointment,
      status: 'booked' as const,
      payment: { status: 'paid' as const, amount: 850000, refId: '999' },
    };
    prisma.payment.findUnique.mockResolvedValue({
      id: 'pay-1',
      appointmentId: 'appt-1',
      amount: 850000,
      status: 'requested',
      appointment: {
        ...appointment,
        shop: { slug: 'farhad' },
      },
    });
    vi.mocked(zarinpal.verify).mockResolvedValue({
      code: 100,
      ref_id: 999,
      card_pan: '502229******5995',
      fee: 0,
      fee_type: 'Merchant',
      raw: { data: { code: 100 } },
    });
    appointments.confirmPaid.mockResolvedValue(booked);

    const result = await service.verify('OK', 'A'.padEnd(36, '0'));

    expect(result.ok).toBe(true);
    expect(result.appointment?.status).toBe('booked');
    expect(appointments.confirmPaid).toHaveBeenCalledOnce();
  });

  it('does not confirm twice when ZarinPal returns 101', async () => {
    const booked = {
      ...appointment,
      status: 'booked' as const,
      payment: { status: 'paid' as const, amount: 850000, refId: '999' },
    };
    prisma.payment.findUnique.mockResolvedValue({
      id: 'pay-1',
      appointmentId: 'appt-1',
      amount: 850000,
      status: 'paid',
      appointment: {
        shop: { slug: 'farhad' },
        ...booked,
      },
    });
    appointments.toPublicDto.mockReturnValue(booked);

    const result = await service.verify('OK', 'A'.padEnd(36, '0'));

    expect(result.ok).toBe(true);
    expect(zarinpal.verify).not.toHaveBeenCalled();
    expect(appointments.confirmPaid).not.toHaveBeenCalled();
  });

  it('releases the hold when the guest cancels at the gateway', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: 'pay-1',
      appointmentId: 'appt-1',
      amount: 850000,
      status: 'requested',
      appointment: {
        shop: { slug: 'farhad' },
      },
    });

    const result = await service.verify('NOK', 'A'.padEnd(36, '0'));

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('cancelled');
    expect(appointments.releaseHold).toHaveBeenCalledWith('appt-1', 'cancelled');
  });
});
