"use client";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { ApiError } from "@/lib/api/client";
import { cancelAppointment, lookupAppointment } from "@/lib/api/booking";
import { formatAppointmentWhen, text } from "@/lib/shop-format";
import type { Appointment } from "@/types/booking";
import { useState } from "react";
import Link from "next/link";

type FindBookingProps = {
  locale: Locale;
  dictionary: Dictionary;
};

const fieldClass =
  "mt-2 h-14 w-full rounded-xl border border-border bg-background px-4 text-lg text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function FindBooking({ locale, dictionary }: FindBookingProps) {
  const copy = dictionary.booking;
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [askCancel, setAskCancel] = useState(false);
  const [error, setError] = useState<string>();
  const [booking, setBooking] = useState<Appointment>();

  async function find() {
    setLoading(true);
    setError(undefined);
    setAskCancel(false);
    try {
      const found = await lookupAppointment(code.trim(), phone.trim());
      setBooking(found);
    } catch (caught) {
      setBooking(undefined);
      if (caught instanceof ApiError && caught.status === 404) {
        setError(copy.notFound);
      } else {
        setError(copy.lookupError);
      }
    } finally {
      setLoading(false);
    }
  }

  async function confirmCancel() {
    if (!booking) {
      return;
    }
    setCancelling(true);
    setError(undefined);
    try {
      const updated = await cancelAppointment(booking.code, phone.trim());
      setBooking(updated);
      setAskCancel(false);
    } catch {
      setError(copy.cancelError);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-xl px-6 py-12 sm:px-8">
      <p className="text-sm font-medium text-muted-foreground">{copy.eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl text-foreground">{copy.title}</h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.body}</p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void find();
        }}
      >
        <label className="block">
          <span className="text-base text-foreground">{copy.code}</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            autoComplete="off"
            name="code"
            dir="ltr"
            spellCheck={false}
            className={`${fieldClass} font-mono tracking-[0.2em]`}
          />
        </label>
        <label className="block">
          <span className="text-base text-foreground">{copy.phone}</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
            inputMode="numeric"
            name="tel"
            dir="ltr"
            placeholder={copy.phonePlaceholder}
            className={fieldClass}
          />
        </label>
        <Button size="touch" type="submit" loading={loading} disabled={code.trim().length < 4 || phone.trim().length < 10}>
          {copy.find}
        </Button>
      </form>

      {error ? (
        <p className="mt-6 text-base text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {booking ? (
        <div className="mt-10 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">{statusLabel(copy, booking.status)}</p>
          <p className="mt-3 text-2xl leading-snug text-foreground">
            {formatAppointmentWhen(locale, booking.startsAt)}
          </p>
          <dl className="mt-6 space-y-3 text-base">
            <div>
              <dt className="text-muted-foreground">{copy.shop}</dt>
              <dd className="text-foreground">{text(locale, booking.shop.name)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{copy.service}</dt>
              <dd className="text-foreground">{text(locale, booking.service.name)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{copy.barber}</dt>
              <dd className="text-foreground">{text(locale, booking.barber.name)}</dd>
            </div>
          </dl>
          <p className="mt-6 font-mono text-2xl tracking-[0.28em] text-foreground" dir="ltr">
            {booking.code}
          </p>

          {booking.status === "booked" ? (
            askCancel ? (
              <div className="mt-8 flex flex-col gap-3">
                <p className="text-base text-foreground">{copy.cancelAsk}</p>
                <Button size="touch" variant="destructive" loading={cancelling} onClick={() => void confirmCancel()}>
                  {copy.cancelYes}
                </Button>
                <Button size="touch" variant="outline" onClick={() => setAskCancel(false)}>
                  {copy.cancelNo}
                </Button>
              </div>
            ) : (
              <div className="mt-8 flex flex-col gap-3">
                <Button size="touch" variant="outline" onClick={() => setAskCancel(true)}>
                  {copy.cancel}
                </Button>
                <Button asChild size="touch" variant="outline">
                  <Link href={`/${locale}/shops`}>{copy.bookAgain}</Link>
                </Button>
              </div>
            )
          ) : (
            <Button asChild size="touch" variant="outline" className="mt-8">
              <Link href={`/${locale}/shops`}>{copy.bookAgain}</Link>
            </Button>
          )}
        </div>
      ) : null}
    </section>
  );
}

function statusLabel(copy: Dictionary["booking"], status: Appointment["status"]): string {
  if (status === "cancelled") return copy.cancelled;
  if (status === "completed") return copy.completed;
  return copy.booked;
}
