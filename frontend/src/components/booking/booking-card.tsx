"use client";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { downloadBookingCalendar } from "@/lib/calendar";
import { formatAppointmentWhen, mapUrl, text } from "@/lib/shop-format";
import type { Appointment } from "@/types/booking";
import { useState } from "react";

type BookingCardProps = {
  locale: Locale;
  dictionary: Dictionary;
  booking: Appointment;
  cancelPhone?: string;
  onCancel?: (booking: Appointment) => Promise<void>;
};

export function BookingCard({
  locale,
  dictionary,
  booking,
  cancelPhone,
  onCancel,
}: BookingCardProps) {
  const copy = dictionary.booking;
  const bookCopy = dictionary.book;
  const [copied, setCopied] = useState(false);
  const [askCancel, setAskCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const address = text(locale, booking.shop.address);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(booking.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="border-t border-border pt-8">
      <p className="text-sm text-muted-foreground">{statusLabel(copy, booking.status)}</p>
      <p className="mt-3 text-2xl leading-snug text-foreground">
        {formatAppointmentWhen(locale, booking.startsAt)}
      </p>
      <dl className="mt-6 space-y-3 text-base">
        <div>
          <dt className="text-muted-foreground">{copy.shop}</dt>
          <dd className="text-foreground">{text(locale, booking.shop.name)}</dd>
        </div>
        {address ? (
          <div>
            <dt className="text-muted-foreground">{copy.address}</dt>
            <dd className="text-foreground">{address}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-muted-foreground">{copy.service}</dt>
          <dd className="text-foreground">{text(locale, booking.service.name)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{copy.barber}</dt>
          <dd className="text-foreground">{text(locale, booking.barber.name)}</dd>
        </div>
        {booking.payment?.status === "paid" ? (
          <div>
            <dt className="text-muted-foreground">{bookCopy.paid}</dt>
            <dd className="text-foreground">
              {booking.payment.refId
                ? `${bookCopy.refId} ${booking.payment.refId}`
                : bookCopy.paid}
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-8 text-sm text-muted-foreground">{bookCopy.codeHint}</p>
      <p className="mt-2 font-mono text-3xl tracking-[0.28em] text-foreground" dir="ltr">
        {booking.code}
      </p>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy.doorHint}</p>
      <div className="mt-6 flex flex-col gap-3">
        <Button size="touch" variant="outline" onClick={() => void copyCode()}>
          {copied ? copy.copied : copy.copyCode}
        </Button>
        <Button size="touch" variant="outline" onClick={() => downloadBookingCalendar(locale, booking)}>
          {copy.saveCalendar}
        </Button>
        {booking.shop.lat !== 0 ? (
          <Button asChild size="touch" variant="outline">
            <a href={mapUrl(booking.shop.lat, booking.shop.lng)} target="_blank" rel="noreferrer">
              {dictionary.shops.map}
            </a>
          </Button>
        ) : null}
      </div>
      {booking.status === "booked" && onCancel ? (
        askCancel ? (
          <div className="mt-8 flex flex-col gap-3">
            <p className="text-base text-foreground">{copy.cancelAsk}</p>
            <Button
              size="touch"
              variant="destructive"
              loading={cancelling}
              onClick={() => {
                setCancelling(true);
                void onCancel(booking)
                  .then(() => setAskCancel(false))
                  .finally(() => setCancelling(false));
              }}
            >
              {copy.cancelYes}
            </Button>
            <Button size="touch" variant="outline" onClick={() => setAskCancel(false)}>
              {copy.cancelNo}
            </Button>
          </div>
        ) : (
          <Button className="mt-8" size="touch" variant="outline" onClick={() => setAskCancel(true)}>
            {copy.cancel}
          </Button>
        )
      ) : null}
      {cancelPhone ? <span className="sr-only">{cancelPhone}</span> : null}
    </article>
  );
}

function statusLabel(copy: Dictionary["booking"], status: Appointment["status"]): string {
  if (status === "cancelled") return copy.cancelled;
  if (status === "completed") return copy.completed;
  if (status === "pending_payment") return copy.pendingPayment;
  if (status === "no_show") return copy.noShow;
  return copy.booked;
}
