import type { Locale } from "@/i18n/config";
import type { Appointment } from "@/types/booking";
import { text } from "@/lib/shop-format";

export function downloadBookingCalendar(locale: Locale, booking: Appointment): void {
  const stamp = icsStamp(booking.startsAt);
  const end = icsStamp(booking.endsAt);
  const shop = text(locale, booking.shop.name);
  const cut = text(locale, booking.service.name);
  const address = booking.shop.address ? text(locale, booking.shop.address) : shop;
  const summary = `${shop} — ${cut}`;
  const description =
    locale === "fa"
      ? `کد نوبت را دم در نشان دهید: ${booking.code}`
      : `Show this code at the door: ${booking.code}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kadoos//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@kadoos`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${stamp}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `LOCATION:${escapeIcs(address)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kadoos-${booking.code}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

function icsStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
