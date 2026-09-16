import { SLOT_MINUTES, clockFromMinutes, minutesFromClock } from '../shops/shop-hours.js';

export type DayHours = {
  weekday: number;
  closed: boolean;
  opensAt: string | null;
  closesAt: string | null;
};

export type BusyRange = {
  barberId: string;
  startsAt: Date;
  endsAt: Date;
};

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function startTimesForDay(hours: DayHours, durationMin: number): string[] {
  if (hours.closed) {
    return [];
  }

  const opens = minutesFromClock(hours.opensAt);
  const closes = minutesFromClock(hours.closesAt);
  if (opens === null || closes === null) {
    return [];
  }

  const times: string[] = [];
  for (let start = opens; start + durationMin <= closes; start += SLOT_MINUTES) {
    times.push(clockFromMinutes(start));
  }
  return times;
}

export function isBarberFree(
  barberId: string,
  start: Date,
  end: Date,
  busy: BusyRange[],
): boolean {
  return !busy.some(
    (item) => item.barberId === barberId && overlaps(start, end, item.startsAt, item.endsAt),
  );
}
