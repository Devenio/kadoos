export const ZARINPAL_GATEWAY = Symbol('ZARINPAL_GATEWAY');

export type ZarinPalWage = {
  iban: string;
  amount: number;
  description: string;
};

export type ZarinPalCreateInput = {
  amount: number;
  callback_url: string;
  description: string;
  mobile?: string;
  currency: 'IRT';
  wages: ZarinPalWage[];
};

export type ZarinPalVerifyResult = {
  code: number;
  ref_id?: number | string;
  card_pan?: string;
  fee?: number;
  fee_type?: string;
  raw: unknown;
};

export interface ZarinPalGateway {
  createPayment(input: ZarinPalCreateInput): Promise<{ authority: string }>;
  getRedirectUrl(authority: string): string;
  verify(input: {
    amount: number;
    authority: string;
  }): Promise<ZarinPalVerifyResult>;
}
