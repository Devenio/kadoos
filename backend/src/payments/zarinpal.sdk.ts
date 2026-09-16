import { createRequire } from 'node:module';
import { Injectable } from '@nestjs/common';
import { env } from '../common/config/env.js';
import type {
  ZarinPalCreateInput,
  ZarinPalGateway,
  ZarinPalVerifyResult,
} from './zarinpal.gateway.js';
import {
  axiosResponseData,
  readZarinpalCode,
  readZarinpalMessage,
  ZarinPalApiError,
} from './zarinpal.errors.js';

type SdkClient = {
  payments: {
    create: (data: Record<string, unknown>) => Promise<unknown>;
    getRedirectUrl: (authority: string) => string;
  };
  verifications: {
    verify: (data: { amount: number; authority: string }) => Promise<unknown>;
  };
};

const require = createRequire(import.meta.url);
const loaded = require('zarinpal-node-sdk') as {
  ZarinPal?: new (config: { merchantId: string; sandbox: boolean }) => SdkClient;
} & (new (config: { merchantId: string; sandbox: boolean }) => SdkClient);
const ZarinPal = loaded.ZarinPal ?? loaded;

@Injectable()
export class ZarinPalSdkGateway implements ZarinPalGateway {
  private readonly client: SdkClient;

  constructor() {
    this.client = new ZarinPal({
      merchantId: env.ZARINPAL_MERCHANT_ID,
      sandbox: env.ZARINPAL_SANDBOX,
    }) as unknown as SdkClient;
  }

  async createPayment(
    input: ZarinPalCreateInput,
  ): Promise<{ authority: string }> {
    let response: unknown;
    try {
      response = await this.client.payments.create({
        amount: input.amount,
        callback_url: input.callback_url,
        description: input.description,
        mobile: input.mobile,
        currency: input.currency,
        wages: input.wages,
      });
    } catch (error) {
      throw toApiError(error);
    }

    const authority = readAuthority(response);
    const code = readZarinpalCode(response);
    if (!authority || (code !== undefined && code !== 100)) {
      throw new ZarinPalApiError(
        code,
        readZarinpalMessage(response) ?? 'The payment could not be started',
        response,
      );
    }
    return { authority };
  }

  getRedirectUrl(authority: string): string {
    return this.client.payments.getRedirectUrl(authority);
  }

  async verify(input: {
    amount: number;
    authority: string;
  }): Promise<ZarinPalVerifyResult> {
    let response: unknown;
    try {
      response = await this.client.verifications.verify({
        amount: input.amount,
        authority: input.authority,
      });
    } catch (error) {
      throw toApiError(error);
    }

    const data = readData(response);
    const code = typeof data?.code === 'number' ? data.code : readZarinpalCode(response);
    if (code === undefined) {
      throw new ZarinPalApiError(
        undefined,
        readZarinpalMessage(response) ?? 'The payment could not be confirmed',
        response,
      );
    }

    return {
      code,
      ref_id: asId(data?.ref_id),
      card_pan: typeof data?.card_pan === 'string' ? data.card_pan : undefined,
      fee: typeof data?.fee === 'number' ? data.fee : undefined,
      fee_type: typeof data?.fee_type === 'string' ? data.fee_type : undefined,
      raw: response,
    };
  }
}

function toApiError(error: unknown): ZarinPalApiError {
  if (error instanceof ZarinPalApiError) {
    return error;
  }
  const payload = axiosResponseData(error);
  const code = readZarinpalCode(payload);
  const message =
    readZarinpalMessage(payload) ??
    (error instanceof Error ? error.message : 'The payment could not be started');
  return new ZarinPalApiError(code, message, payload ?? error);
}

function readData(payload: unknown): Record<string, unknown> | undefined {
  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    return undefined;
  }
  const data = (payload as { data?: unknown }).data;
  return data && typeof data === 'object'
    ? (data as Record<string, unknown>)
    : undefined;
}

function readAuthority(payload: unknown): string | undefined {
  const data = readData(payload);
  return typeof data?.authority === 'string' ? data.authority : undefined;
}

function asId(value: unknown): number | string | undefined {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  return undefined;
}
