/** ZarinPal’s minimum payment and wage is 10,000 rial. We send IRT (toman). */
export const MIN_PAYMENT_IRT = 1_000;
export const MIN_WAGE_IRT = 1_000;

export type MoneyShares = {
  platformShare: number;
  shopShare: number;
};

export function splitAmount(amount: number, feePercent: number): MoneyShares {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('Amount must be a positive integer');
  }
  if (!Number.isInteger(feePercent) || feePercent < 1 || feePercent > 99) {
    throw new Error('Fee percent must be between 1 and 99');
  }

  const platformShare = Number(
    (BigInt(amount) * BigInt(feePercent) + 50n) / 100n,
  );
  const shopShare = amount - platformShare;
  return { platformShare, shopShare };
}

export function assertShopWage(amount: number, shares: MoneyShares): void {
  if (amount < MIN_PAYMENT_IRT) {
    throw new WageError(
      'Amount is below ZarinPal’s minimum',
      'AMOUNT_TOO_SMALL',
    );
  }
  if (shares.shopShare < MIN_WAGE_IRT) {
    throw new WageError(
      'The shop share is below ZarinPal’s minimum',
      'WAGE_TOO_SMALL',
    );
  }
  if (shares.platformShare < 1 || shares.shopShare >= amount) {
    throw new WageError(
      'The shop share must be less than the total amount',
      'WAGE_EXCEEDS_AMOUNT',
    );
  }
}

export class WageError extends Error {
  constructor(
    message: string,
    readonly code: 'AMOUNT_TOO_SMALL' | 'WAGE_TOO_SMALL' | 'WAGE_EXCEEDS_AMOUNT',
  ) {
    super(message);
    this.name = 'WageError';
  }
}
