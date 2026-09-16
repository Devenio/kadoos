import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { env } from '../common/config/env.js';
import { AppointmentsService } from '../appointments/appointments.service.js';
import type { AppointmentDto } from '../appointments/appointments.types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { isValidIban, normalizeIban } from './iban.js';
import { assertShopWage, splitAmount, WageError } from './money.js';
import type {
  PaymentRequestDto,
  PaymentVerifyDto,
} from './payments.types.js';
import type { RequestPaymentBody } from './payments.schemas.js';
import { ZARINPAL_GATEWAY, type ZarinPalGateway } from './zarinpal.gateway.js';
import {
  mapZarinpalError,
  ZarinPalApiError,
} from './zarinpal.errors.js';

const DESCRIPTION_MAX = 500;
const WAGE_DESCRIPTION_MAX = 255;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly appointments: AppointmentsService,
    @Inject(ZARINPAL_GATEWAY) private readonly zarinpal: ZarinPalGateway,
  ) {}

  async request(input: RequestPaymentBody): Promise<PaymentRequestDto> {
    if (!env.ZARINPAL_MERCHANT_ID) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Payment is not configured yet',
        code: 'ZARINPAL_NOT_CONFIGURED',
      });
    }

    await this.appointments.expireStaleHolds();

    const shop = await this.prisma.shop.findFirst({
      where: { slug: input.slug, published: true },
      select: {
        slug: true,
        nameEn: true,
        iban: true,
        payoutReady: true,
        services: {
          where: { id: input.serviceId },
          select: { id: true, nameEn: true, priceToman: true },
        },
      },
    });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    const service = shop.services[0];
    if (!service) {
      throw new BadRequestException('Unknown service');
    }

    if (!shop.payoutReady || !isValidIban(shop.iban)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'This shop cannot take paid bookings yet',
        code: 'SHOP_IBAN_REQUIRED',
      });
    }

    const amount = service.priceToman;
    let shares;
    try {
      shares = splitAmount(amount, env.KADOOS_FEE_PERCENT);
      assertShopWage(amount, shares);
    } catch (error) {
      if (error instanceof WageError) {
        throw new BadRequestException({
          statusCode: 400,
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }

    const appointment = await this.appointments.holdChair(input.slug, input);

    const payment = await this.prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        amount,
        shopShare: shares.shopShare,
        platformShare: shares.platformShare,
        status: 'requested',
      },
    });

    const description = (
      `Kadoos booking ${appointment.code} — ${shop.nameEn} / ${service.nameEn}`
    ).slice(0, DESCRIPTION_MAX);

    try {
      const created = await this.zarinpal.createPayment({
        amount,
        callback_url: callbackUrl(input.locale),
        description,
        mobile: appointment.customerPhone,
        currency: 'IRT',
        wages: [
          {
            iban: normalizeIban(shop.iban),
            amount: shares.shopShare,
            description: `Shop share ${shop.slug}`.slice(0, WAGE_DESCRIPTION_MAX),
          },
        ],
      });

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { authority: created.authority },
      });

      return {
        redirectUrl: this.zarinpal.getRedirectUrl(created.authority),
        authority: created.authority,
        appointmentCode: appointment.code,
      };
    } catch (error) {
      await this.appointments.releaseHold(appointment.id, 'failed');
      throw toHttpError(error);
    }
  }

  async verify(status: string, authority: string): Promise<PaymentVerifyDto> {
    await this.appointments.expireStaleHolds();

    const payment = await this.prisma.payment.findUnique({
      where: { authority },
      include: {
        appointment: {
          include: {
            shop: true,
            barber: true,
            service: true,
            payment: true,
          },
        },
      },
    });
    if (!payment) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'This payment could not be found',
        code: 'ZARINPAL_-54',
      });
    }

    const shopSlug = payment.appointment.shop.slug;

    if (status !== 'OK') {
      if (payment.status === 'paid') {
        return success(this.appointments.toPublicDto(payment.appointment));
      }
      if (payment.status === 'requested') {
        await this.appointments.releaseHold(payment.appointmentId, 'cancelled');
      }
      return {
        ok: false,
        reason: 'cancelled',
        shopSlug,
      };
    }

    if (payment.status === 'paid') {
      return success(this.appointments.toPublicDto(payment.appointment));
    }

    if (payment.status !== 'requested') {
      return {
        ok: false,
        reason: 'failed',
        shopSlug,
      };
    }

    let result;
    try {
      result = await this.zarinpal.verify({
        amount: payment.amount,
        authority,
      });
    } catch (error) {
      await this.appointments.releaseHold(payment.appointmentId, 'failed');
      throw toHttpError(error);
    }

    if (result.code !== 100 && result.code !== 101) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          rawVerify: asJson(result.raw),
        },
      });
      await this.appointments.releaseHold(payment.appointmentId, 'failed');
      const mapped = mapZarinpalError(result.code);
      throw new BadRequestException({
        statusCode: 400,
        message: mapped.message,
        code: mapped.code,
      });
    }

    const updated = await this.appointments.confirmPaid(payment.appointmentId, {
      refId: result.ref_id === undefined ? null : String(result.ref_id),
      cardPan: result.card_pan ?? null,
      fee: result.fee ?? null,
      feeType: result.fee_type ?? null,
      rawVerify: asJson(result.raw),
    });

    if (result.code === 101) {
      this.logger.log(`ZarinPal already verified ${authority}`);
    }

    return success(updated);
  }
}

function callbackUrl(locale: 'en' | 'fa'): string {
  const template = env.ZARINPAL_CALLBACK_URL;
  if (template.includes('{locale}')) {
    return template.replaceAll('{locale}', locale);
  }
  return template.replace(/\/(en|fa)(?=\/|$)/, `/${locale}`);
}

function success(appointment: AppointmentDto): PaymentVerifyDto {
  return {
    ok: true,
    shopSlug: appointment.shop.slug,
    appointment,
    payment: appointment.payment ?? undefined,
  };
}

function toHttpError(error: unknown): never {
  if (error instanceof BadRequestException || error instanceof NotFoundException) {
    throw error;
  }
  if (error instanceof ZarinPalApiError) {
    const mapped = mapZarinpalError(error.zarinpalCode);
    throw new BadRequestException({
      statusCode: 400,
      message: mapped.message,
      code: mapped.code,
    });
  }
  throw error;
}

function asJson(value: unknown) {
  if (value === undefined) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(value)) as object;
}

// TODO: refunds need zarinpal.refunds.create with an accessToken (ZARINPAL_ACCESS_TOKEN).
// TODO: collect IBAN during future shop self-serve onboarding.
