import { describe, expect, it } from 'vitest';
import { isBarberFree, overlaps, startTimesForDay } from './availability.js';

describe('availability', () => {
  it('builds half-hour starts that fit the service', () => {
    expect(
      startTimesForDay(
        { weekday: 1, closed: false, opensAt: '10:00', closesAt: '12:00' },
        45,
      ),
    ).toEqual(['10:00', '10:30', '11:00']);
  });

  it('returns no times on a closed day', () => {
    expect(
      startTimesForDay(
        { weekday: 5, closed: true, opensAt: null, closesAt: null },
        30,
      ),
    ).toEqual([]);
  });

  it('detects overlapping chairs', () => {
    const ten = new Date('2026-09-16T06:30:00.000Z');
    const tenFortyFive = new Date('2026-09-16T07:15:00.000Z');
    const tenThirty = new Date('2026-09-16T07:00:00.000Z');
    const elevenFifteen = new Date('2026-09-16T07:45:00.000Z');

    expect(overlaps(ten, tenFortyFive, tenThirty, elevenFifteen)).toBe(true);
    expect(
      isBarberFree('a', tenThirty, elevenFifteen, [
        { barberId: 'a', startsAt: ten, endsAt: tenFortyFive },
      ]),
    ).toBe(false);
    expect(
      isBarberFree('b', tenThirty, elevenFifteen, [
        { barberId: 'a', startsAt: ten, endsAt: tenFortyFive },
      ]),
    ).toBe(true);
  });

  it('treats a blocked range as a busy chair', () => {
    const ten = new Date('2026-09-16T06:30:00.000Z');
    const noon = new Date('2026-09-16T08:30:00.000Z');
    const tenThirty = new Date('2026-09-16T07:00:00.000Z');
    const eleven = new Date('2026-09-16T07:30:00.000Z');

    expect(
      isBarberFree('a', tenThirty, eleven, [
        { barberId: 'a', startsAt: ten, endsAt: noon },
      ]),
    ).toBe(false);
  });
});
