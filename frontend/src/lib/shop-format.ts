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

export function toFaDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}
