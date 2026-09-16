import type { Locale } from "@/i18n/config";
import type { LocalizedText, ShopHours } from "@/types/shop";

const weekdayOrder = [6, 0, 1, 2, 3, 4, 5] as const;

const weekdayNames: Record<Locale, Record<number, string>> = {
  en: {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  },
  fa: {
    0: "یکشنبه",
    1: "دوشنبه",
    2: "سه‌شنبه",
    3: "چهارشنبه",
    4: "پنجشنبه",
    5: "جمعه",
    6: "شنبه",
  },
};

export function text(locale: Locale, value: LocalizedText): string {
  return value[locale];
}

export function formatPrice(locale: Locale, toman: number): string {
  if (locale === "fa") {
    return `${toman.toLocaleString("fa-IR")} تومان`;
  }
  return `${toman.toLocaleString("en-US")} toman`;
}

export function formatDuration(locale: Locale, minutes: number): string {
  if (locale === "fa") {
    return `${minutes.toLocaleString("fa-IR")} دقیقه`;
  }
  return `${minutes} min`;
}

export function formatClock(locale: Locale, value: string | null): string {
  if (!value) {
    return "";
  }
  return locale === "fa" ? toFaDigits(value) : value;
}

export function place(locale: Locale, neighborhood: LocalizedText, city: LocalizedText): string {
  const sep = locale === "fa" ? "، " : ", ";
  return `${text(locale, neighborhood)}${sep}${text(locale, city)}`;
}

export function weekdayLabel(locale: Locale, weekday: number): string {
  return weekdayNames[locale][weekday] ?? "";
}

export function orderedHours(hours: ShopHours[]): ShopHours[] {
  return [...hours].sort(
    (a, b) => weekdayOrder.indexOf(a.weekday as (typeof weekdayOrder)[number]) -
      weekdayOrder.indexOf(b.weekday as (typeof weekdayOrder)[number]),
  );
}

export function hoursLabel(locale: Locale, hours: ShopHours): string {
  if (hours.closed) {
    return locale === "fa" ? "تعطیل" : "Closed";
  }
  return `${formatClock(locale, hours.opensAt)}–${formatClock(locale, hours.closesAt)}`;
}

export function formatAppointmentWhen(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-GB", {
    timeZone: "Asia/Tehran",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function formatDayButton(locale: Locale, ymd: string, weekday: number): { day: string; date: string } {
  const day = weekdayLabel(locale, weekday);
  const [, month, date] = ymd.split("-");
  const dateLabel =
    locale === "fa"
      ? toFaDigits(`${Number(date)} / ${Number(month)}`)
      : `${Number(date)}/${Number(month)}`;
  return { day, date: dateLabel };
}

export function toFaDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}

export function formatPhone(locale: Locale, phone: string): string {
  return locale === "fa" ? toFaDigits(phone) : phone;
}

export function formatAppointmentClock(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-GB", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function tehranYmd(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function shiftYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function weekdayFromYmd(ymd: string): number {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}
