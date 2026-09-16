export class ZarinPalApiError extends Error {
  constructor(
    readonly zarinpalCode: number | undefined,
    message: string,
    readonly raw?: unknown,
  ) {
    super(message);
    this.name = 'ZarinPalApiError';
  }
}

const known: Record<number, { code: string; message: string }> = {
  [-9]: {
    code: 'ZARINPAL_-9',
    message: 'Payment details were not accepted',
  },
  [-10]: {
    code: 'ZARINPAL_-10',
    message: 'Payment is not available from this terminal',
  },
  [-11]: {
    code: 'ZARINPAL_-11',
    message: 'Payment is not available from this terminal',
  },
  [-14]: {
    code: 'ZARINPAL_-14',
    message: 'Payment is not available from this site yet',
  },
  [-30]: {
    code: 'ZARINPAL_-30',
    message: 'Shop payouts are not enabled on this terminal',
  },
  [-31]: {
    code: 'ZARINPAL_-31',
    message: 'The platform settlement account is missing',
  },
  [-32]: {
    code: 'ZARINPAL_-32',
    message: 'The shop share is too large for this payment',
  },
  [-34]: {
    code: 'ZARINPAL_-34',
    message: 'The shop share is too large for this payment',
  },
  [-36]: {
    code: 'ZARINPAL_-36',
    message: 'The shop share is below ZarinPal’s minimum',
  },
  [-50]: {
    code: 'ZARINPAL_-50',
    message: 'The paid amount did not match this booking',
  },
  [-51]: {
    code: 'ZARINPAL_-51',
    message: 'The payment did not go through',
  },
  [-54]: {
    code: 'ZARINPAL_-54',
    message: 'This payment could not be found',
  },
};

export function mapZarinpalError(zarinpalCode: number | undefined): {
  code: string;
  message: string;
} {
  if (zarinpalCode !== undefined && known[zarinpalCode]) {
    return known[zarinpalCode];
  }
  return {
    code:
      zarinpalCode === undefined ? 'ZARINPAL' : `ZARINPAL_${zarinpalCode}`,
    message: 'The payment did not go through',
  };
}

export function readZarinpalCode(payload: unknown): number | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }
  const body = payload as {
    errors?: { code?: unknown } | unknown[];
    data?: { code?: unknown };
  };
  const fromErrors = Array.isArray(body.errors)
    ? undefined
    : body.errors?.code;
  const fromData = body.data?.code;
  const value = fromErrors ?? fromData;
  return typeof value === 'number' ? value : undefined;
}

export function readZarinpalMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }
  const body = payload as {
    errors?: { message?: unknown };
    data?: { message?: unknown };
  };
  const message = body.errors?.message ?? body.data?.message;
  return typeof message === 'string' ? message : undefined;
}

export function axiosResponseData(error: unknown): unknown {
  if (typeof error === 'object' && error && 'response' in error) {
    return (error as { response?: { data?: unknown } }).response?.data;
  }
  return undefined;
}
