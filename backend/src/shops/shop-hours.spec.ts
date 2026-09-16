import { Test } from '@nestjs/testing';
import { isOpenNow, nextOpenDay, tehranClock } from './shop-hours.js';

describe('shop hours', () => {
  it('treats the current slot as open', () => {
    expect(
      isOpenNow(
        { weekday: 1, closed: false, opensAt: '10:00', closesAt: '20:00' },
        { weekday: 1, minutes: 12 * 60 },
      ),
    ).toBe(true);
  });

  it('is closed before opening time', () => {
    expect(
      isOpenNow(
        { weekday: 1, closed: false, opensAt: '10:00', closesAt: '20:00' },
        { weekday: 1, minutes: 9 * 60 },
      ),
    ).toBe(false);
  });

  it('finds the next open weekday', () => {
    const next = nextOpenDay(
      [
        { weekday: 5, closed: true, opensAt: null },
        { weekday: 6, closed: false, opensAt: '10:00' },
      ],
      { weekday: 5, minutes: 21 * 60 },
    );

    expect(next?.weekday).toBe(6);
  });

  it('returns a Tehran weekday between 0 and 6', () => {
    const clock = tehranClock();
    expect(clock.weekday).toBeGreaterThanOrEqual(0);
    expect(clock.weekday).toBeLessThanOrEqual(6);
  });
});
