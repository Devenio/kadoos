import { describe, expect, it } from 'vitest';
import {
  assertShopWage,
  MIN_PAYMENT_IRT,
  MIN_WAGE_IRT,
  splitAmount,
  WageError,
} from './money.js';

describe('splitAmount', () => {
  it('keeps the platform remainder off wages', () => {
    expect(splitAmount(850_000, 10)).toEqual({
      platformShare: 85_000,
      shopShare: 765_000,
    });
  });

  it('uses integer rounding', () => {
    expect(splitAmount(1001, 10)).toEqual({
      platformShare: 100,
      shopShare: 901,
    });
  });
});

describe('assertShopWage', () => {
  it('rejects a shop share below the ZarinPal wage floor', () => {
    expect(() =>
      assertShopWage(MIN_PAYMENT_IRT, {
        platformShare: MIN_PAYMENT_IRT - (MIN_WAGE_IRT - 1),
        shopShare: MIN_WAGE_IRT - 1,
      }),
    ).toThrow(WageError);
  });

  it('rejects wages that leave nothing on the merchant', () => {
    expect(() =>
      assertShopWage(20_000, { platformShare: 0, shopShare: 20_000 }),
    ).toThrow(WageError);
  });
});
