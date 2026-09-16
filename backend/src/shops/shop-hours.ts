const TEHRAN = 'Asia/Tehran';

export function tehranClock(now = new Date()): { weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TEHRAN,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const weekdayName = parts.find((part) => part.type === 'weekday')?.value ?? 'Sun';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');

  return {
    weekday: weekdayIndex(weekdayName),
    minutes: hour * 60 + minute,
  };
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

export function isOpenNow(
  hours: { weekday: number; closed: boolean; opensAt: string | null; closesAt: string | null },
  clock = tehranClock(),
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
>(hours: T[], from = tehranClock()): T | null {
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
