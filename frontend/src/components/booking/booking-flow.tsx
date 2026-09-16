"use client";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { ApiError } from "@/lib/api/client";
import { createAppointment, getAvailability } from "@/lib/api/booking";
import {
  formatAppointmentWhen,
  formatClock,
  formatDayButton,
  formatDuration,
  formatPrice,
  text,
} from "@/lib/shop-format";
import type { Appointment, AvailabilityDay } from "@/types/booking";
import type { ShopDetail } from "@/types/shop";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Step = "service" | "barber" | "day" | "time" | "details" | "done";

const steps: Exclude<Step, "done">[] = ["service", "barber", "day", "time", "details"];

type BookingFlowProps = {
  locale: Locale;
  dictionary: Dictionary;
  shop: ShopDetail;
};

const fieldClass =
  "mt-2 h-14 w-full rounded-xl border border-border bg-background px-4 text-lg text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function BookingFlow({ locale, dictionary, shop }: BookingFlowProps) {
  const copy = dictionary.book;
  const isPersian = locale === "fa";
  const BackIcon = isPersian ? ArrowRightIcon : ArrowLeftIcon;

  const [step, setStep] = useState<Step>("service");
  const [serviceId, setServiceId] = useState<string>();
  const [barberId, setBarberId] = useState<string | "any">();
  const [date, setDate] = useState<string>();
  const [time, setTime] = useState<string>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [booking, setBooking] = useState<Appointment>();

  const service = shop.services.find((item) => item.id === serviceId);
  const barber =
    barberId && barberId !== "any"
      ? shop.barbers.find((item) => item.id === barberId)
      : undefined;
  const selectedDay = days.find((item) => item.date === date);
  const question = step === "done" ? "details" : step;
  const stepIndex = steps.indexOf(question);

  useEffect(() => {
    if (!serviceId || !barberId) {
      return;
    }
    let cancelled = false;
    setLoadingDays(true);
    setError(undefined);
    getAvailability(shop.slug, serviceId, barberId === "any" ? undefined : barberId)
      .then((result) => {
        if (!cancelled) {
          setDays(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(copy.timesError);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingDays(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [barberId, copy.timesError, serviceId, shop.slug]);

  function goBack() {
    setError(undefined);
    if (step === "barber") setStep("service");
    else if (step === "day") setStep("barber");
    else if (step === "time") setStep("day");
    else if (step === "details") setStep("time");
  }

  async function submit() {
    if (!serviceId || !barberId || !date || !time) {
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      const created = await createAppointment(shop.slug, {
        serviceId,
        barberId: barberId === "any" ? undefined : barberId,
        date,
        time,
        customerName: name,
        customerPhone: phone,
      });
      setBooking(created);
      setStep("done");
    } catch (caught) {
      setError(caught instanceof ApiError ? userFacingError(caught, copy) : copy.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done" && booking) {
    return (
      <section className="mx-auto w-full max-w-xl px-6 py-12 sm:px-8">
        <p className="text-sm font-medium text-foreground">{copy.doneEyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-foreground">{copy.doneTitle}</h1>
        <p className="mt-6 text-2xl leading-snug text-foreground">
          {formatAppointmentWhen(locale, booking.startsAt)}
        </p>
        <dl className="mt-8 space-y-3 text-base">
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
        <p className="mt-8 text-sm text-muted-foreground">{copy.codeHint}</p>
        <p className="mt-2 font-mono text-3xl tracking-[0.28em] text-foreground" dir="ltr">
          {booking.code}
        </p>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy.saveHint}</p>
        <div className="mt-10 flex flex-col gap-3">
          <Button asChild size="touch">
            <Link href={`/${locale}/booking`}>{copy.findBooking}</Link>
          </Button>
          <Button asChild size="touch" variant="outline">
            <Link href={`/${locale}/shops`}>{copy.backShops}</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-xl px-6 py-10 sm:px-8">
      <Link
        href={`/${locale}/shops/${shop.slug}`}
        className="inline-flex min-h-11 items-center gap-1.5 text-base text-muted-foreground hover:text-foreground"
      >
        <BackIcon className="size-4" />
        {text(locale, shop.name)}
      </Link>

      <p className="mt-8 text-sm text-muted-foreground">
        {copy.step} {isPersian ? toFaStep(stepIndex + 1) : stepIndex + 1} {copy.of}{" "}
        {isPersian ? toFaStep(steps.length) : steps.length}
      </p>
      <h1 className="mt-2 font-display text-4xl text-foreground">{copy.titles[question]}</h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">{copy.helps[question]}</p>

      <div className="mt-8 space-y-3">
        {step === "service"
          ? shop.services.map((item) => (
              <Choice
                key={item.id}
                selected={serviceId === item.id}
                title={text(locale, item.name)}
                subtitle={`${formatDuration(locale, item.durationMin)} · ${formatPrice(locale, item.priceToman)}`}
                onSelect={() => {
                  setServiceId(item.id);
                  setDate(undefined);
                  setTime(undefined);
                  setStep("barber");
                }}
              />
            ))
          : null}

        {step === "barber" ? (
          <>
            <Choice
              selected={barberId === "any"}
              title={copy.anyBarber}
              subtitle={copy.anyBarberHelp}
              onSelect={() => {
                setBarberId("any");
                setDate(undefined);
                setTime(undefined);
                setStep("day");
              }}
            />
            {shop.barbers.map((item) => (
              <Choice
                key={item.id}
                selected={barberId === item.id}
                title={text(locale, item.name)}
                subtitle={text(locale, item.title)}
                onSelect={() => {
                  setBarberId(item.id);
                  setDate(undefined);
                  setTime(undefined);
                  setStep("day");
                }}
              />
            ))}
          </>
        ) : null}

        {step === "day" ? (
          loadingDays ? (
            <p className="py-6 text-base text-muted-foreground">{copy.loadingTimes}</p>
          ) : (
            days.map((item) => {
              const labels = formatDayButton(locale, item.date, item.weekday);
              const closed = item.slots.length === 0;
              return (
                <Choice
                  key={item.date}
                  selected={date === item.date}
                  disabled={closed}
                  title={labels.day}
                  subtitle={closed ? copy.noTimes : labels.date}
                  onSelect={() => {
                    setDate(item.date);
                    setTime(undefined);
                    setStep("time");
                  }}
                />
              );
            })
          )
        ) : null}

        {step === "time" ? (
          selectedDay && selectedDay.slots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {selectedDay.slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setTime(slot);
                    setStep("details");
                  }}
                  className={`min-h-16 rounded-xl border px-4 text-xl transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none ${
                    time === slot
                      ? "border-foreground bg-muted text-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {formatClock(locale, slot)}
                </button>
              ))}
            </div>
          ) : (
            <p className="py-6 text-base text-muted-foreground">{copy.noTimes}</p>
          )
        ) : null}

        {step === "details" ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <label className="block">
              <span className="text-base text-foreground">{copy.name}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                name="name"
                required
                className={fieldClass}
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
                required
                className={fieldClass}
              />
              <span className="mt-2 block text-sm text-muted-foreground">{copy.phoneHelp}</span>
            </label>
            {service && date && time ? (
              <p className="text-base leading-7 text-muted-foreground">
                {text(locale, service.name)}
                {" · "}
                {barber ? text(locale, barber.name) : copy.anyBarber}
                {" · "}
                {formatClock(locale, time)}
              </p>
            ) : null}
          </form>
        ) : null}
      </div>

      {error ? (
        <p className="mt-6 text-base text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-10 flex flex-col gap-3">
        {step === "details" ? (
          <Button
            size="touch"
            disabled={name.trim().length < 2 || phone.replace(/\D/g, "").length < 10}
            loading={submitting}
            onClick={() => void submit()}
          >
            {copy.confirm}
          </Button>
        ) : null}
        {step !== "service" ? (
          <Button size="touch" variant="outline" onClick={goBack}>
            <BackIcon />
            {copy.back}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function Choice({
  title,
  subtitle,
  selected,
  disabled,
  onSelect,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border px-5 py-4 text-start transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-40 ${
        selected
          ? "border-foreground bg-muted text-foreground"
          : "border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      <span>
        <span className="block text-lg font-medium">{title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{subtitle}</span>
      </span>
      {selected ? <CheckIcon className="size-5 shrink-0" /> : null}
    </button>
  );
}

function toFaStep(value: number): string {
  return String(value).replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)] ?? digit);
}

function userFacingError(error: ApiError, copy: Dictionary["book"]): string {
  if (error.status === 409) {
    return copy.taken;
  }
  if (error.message.includes("mobile") || error.message.includes("0912")) {
    return copy.phoneInvalid;
  }
  return copy.submitError;
}
