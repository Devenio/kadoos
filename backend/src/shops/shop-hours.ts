const TEHRAN = 'Asia/Tehran';
const TEHRAN_OFFSET_MS = 3.5 * 60 * 60 * 1000;

export const SLOT_MINUTES = 30;

export type TehranClock = {
  ymd: string;
  weekday: number;
  minutes: number;
};

export function tehranClock(now = new Date()): TehranClock {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TEHRAN,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    ymd: `${value('year')}-${value('month')}-${value('day')}`,
    weekday: weekdayIndex(value('weekday')),
    minutes: Number(value('hour')) * 60 + Number(value('minute')),
  };
}

export function addDaysYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

export function weekdayFromYmd(ymd: string): number {
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function tehranLocalToUtc(ymd: string, hhmm: string): Date {
  const [year, month, day] = ymd.split('-').map(Number);
  const [hour, minute] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - TEHRAN_OFFSET_MS);
}

export function minutesFromClock(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

export function clockFromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function isOpenNow(
  hours: { weekday: number; closed: boolean; opensAt: string | null; closesAt: string | null },
  clock: { weekday: number; minutes: number } = tehranClock(),
): boolean {
  if (hours.weekday !== clock.weekday || hours.closed) {
    return false;
  }

  const opens = minutesFromClock(hours.opensAt);
  const closes = minutesFromClock(hours.closesAt);
  if (opens === null || closes === null) {
    return false;
  }

  return clock.minutes >= opens && clock.minutes < closes;
}

export function nextOpenDay<
  T extends { weekday: number; closed: boolean; opensAt: string | null },
>(hours: T[], from: { weekday: number; minutes: number } = tehranClock()): T | null {
  for (let offset = 1; offset <= 7; offset += 1) {
    const weekday = (from.weekday + offset) % 7;
    const candidate = hours.find((item) => item.weekday === weekday);
    if (candidate && !candidate.closed && candidate.opensAt) {
      return candidate;
    }
  }

  return null;
}

function weekdayIndex(name: string): number {
  const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
  const index = order.indexOf(name as (typeof order)[number]);
  return index === -1 ? 0 : index;
}
