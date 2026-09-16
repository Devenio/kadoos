"use client";

import { BookingCard } from "@/components/booking/booking-card";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { verifyZarinpalPayment } from "@/lib/api/booking";
import { rememberBooking } from "@/lib/remembered-bookings";
import type { Appointment } from "@/types/booking";
import Link from "next/link";
import { useEffect, useState } from "react";

type PaymentCallbackProps = {
  locale: Locale;
  dictionary: Dictionary;
  status: string;
  authority: string;
};

export function PaymentCallback({
  locale,
  dictionary,
  status,
  authority,
}: PaymentCallbackProps) {
  const copy = dictionary.pay;

  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "success"; booking: Appointment }
    | { kind: "fail"; reason: "cancelled" | "failed"; shopSlug?: string }
  >({ kind: "loading" });

  useEffect(() => {
    if (!authority) {
      setState({ kind: "fail", reason: "failed" });
      return;
    }

    let cancelled = false;
    void verifyZarinpalPayment(status || "NOK", authority)
      .then((result) => {
        if (cancelled) {
          return;
        }
        if (result.ok && result.appointment) {
          rememberBooking(result.appointment);
          setState({ kind: "success", booking: result.appointment });
          return;
        }
        setState({
          kind: "fail",
          reason: result.reason === "cancelled" ? "cancelled" : "failed",
          shopSlug: result.shopSlug,
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setState({ kind: "fail", reason: "failed" });
      });

    return () => {
      cancelled = true;
    };
  }, [authority, status]);

  if (state.kind === "loading") {
    return (
      <section className="mx-auto w-full max-w-xl px-6 py-12 sm:px-8">
        <p className="text-sm font-medium text-muted-foreground">{copy.verifying}</p>
      </section>
    );
  }

  if (state.kind === "success") {
    return (
      <section className="mx-auto w-full max-w-xl px-6 py-12 sm:px-8">
        <p className="text-sm font-medium text-foreground">{dictionary.book.doneEyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-foreground">{dictionary.book.doneTitle}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{dictionary.book.doorHint}</p>
        <div className="mt-8">
          <BookingCard locale={locale} dictionary={dictionary} booking={state.booking} />
        </div>
        <div className="mt-10 flex flex-col gap-3">
          <Button asChild size="touch">
            <Link href={`/${locale}/booking`}>{dictionary.book.findBooking}</Link>
          </Button>
          <Button asChild size="touch" variant="outline">
            <Link href={`/${locale}/shops`}>{dictionary.book.backShops}</Link>
          </Button>
        </div>
      </section>
    );
  }

  const cancelled = state.reason === "cancelled";
  const bookHref = state.shopSlug
    ? `/${locale}/shops/${state.shopSlug}/book`
    : `/${locale}/shops`;

  return (
    <section className="mx-auto w-full max-w-xl px-6 py-12 sm:px-8">
      <p className="text-sm font-medium text-muted-foreground">
        {cancelled ? copy.cancelledEyebrow : copy.failEyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl text-foreground">
        {cancelled ? copy.cancelledTitle : copy.failTitle}
      </h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">
        {cancelled ? copy.cancelledBody : copy.failBody}
      </p>
      <div className="mt-10">
        <Button asChild size="touch">
          <Link href={bookHref}>{copy.bookAgain}</Link>
        </Button>
      </div>
    </section>
  );
}
