"use client";

import { BookingCard } from "@/components/booking/booking-card";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { ApiError } from "@/lib/api/client";
import { cancelAppointment, lookupBookings } from "@/lib/api/booking";
import { isMobilePhone } from "@/lib/phone";
import { rememberBooking, rememberMany, rememberedBookings } from "@/lib/remembered-bookings";
import type { Appointment } from "@/types/booking";
import { useEffect, useState } from "react";
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
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState<Appointment[]>([]);
  const [found, setFound] = useState<Appointment[]>([]);

  useEffect(() => {
    setSaved(rememberedBookings());
  }, []);

  async function find() {
    setLoading(true);
    setError(undefined);
    try {
      const rows = await lookupBookings(phone.trim(), code.trim() || undefined);
      setFound(rows);
      rememberMany(rows);
      setSaved(rememberedBookings());
    } catch (caught) {
      setFound([]);
      if (caught instanceof ApiError && caught.status === 404) {
        setError(copy.notFound);
      } else {
        setError(copy.lookupError);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onCancel(booking: Appointment) {
    const updated = await cancelAppointment(booking.code, booking.customerPhone);
    rememberBooking(updated);
    setFound((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setSaved(rememberedBookings());
  }

  const visible = found.length > 0 ? found : saved.filter((item) => item.status === "booked");

  return (
    <section className="mx-auto w-full max-w-xl px-6 py-12 sm:px-8">
      <p className="text-sm font-medium text-muted-foreground">{copy.eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl text-foreground">{copy.title}</h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.body}</p>

      {saved.length > 0 && found.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">{copy.saved}</p>
      ) : null}

      {visible.map((booking) => (
        <div key={booking.id} className="mt-6">
          <BookingCard
            locale={locale}
            dictionary={dictionary}
            booking={booking}
            onCancel={onCancel}
          />
        </div>
      ))}

      <form
        className="mt-10 space-y-5 border-t border-border pt-8"
        onSubmit={(event) => {
          event.preventDefault();
          void find();
        }}
      >
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
        <Button size="touch" type="submit" loading={loading} disabled={!isMobilePhone(phone)}>
          {copy.find}
        </Button>
      </form>

      {error ? (
        <p className="mt-6 text-base text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button asChild size="touch" variant="outline" className="mt-8">
        <Link href={`/${locale}/shops`}>{copy.bookAgain}</Link>
      </Button>
    </section>
  );
}
