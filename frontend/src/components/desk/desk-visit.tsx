import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { deskUpdateAppointment } from "@/lib/api/desk";
import {
  barberTone,
  formatAppointmentClock,
  formatPhone,
  text,
} from "@/lib/shop-format";
import type { Appointment } from "@/types/booking";
import { useState } from "react";

export function statusCopy(
  copy: Dictionary["desk"],
  appointment: Appointment,
): string {
  if (appointment.status === "cancelled") return copy.cancelled;
  if (appointment.status === "completed") return copy.completed;
  if (appointment.status === "no_show") return copy.noShow;
  if (
    appointment.status === "pending_payment" ||
    (appointment.source !== "walk_in" && appointment.payment?.status !== "paid")
  ) {
    return copy.unpaid;
  }
  if (appointment.payment?.status === "paid") {
    return `${copy.booked} · ${copy.paid}`;
  }
  return copy.booked;
}

export function DeskVisit({
  locale,
  copy,
  appointment,
  nextUp,
  onChange,
  onFail,
}: {
  locale: Locale;
  copy: Dictionary["desk"];
  appointment: Appointment;
  nextUp?: boolean;
  onChange: (appointment: Appointment) => void;
  onFail: () => void;
}) {
  const [askCancel, setAskCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  async function setStatus(status: Appointment["status"]) {
    const previous = appointment;
    onChange({ ...appointment, status });
    setBusy(true);
    try {
      onChange(await deskUpdateAppointment(appointment.id, { status }));
      setAskCancel(false);
    } catch {
      onChange(previous);
      onFail();
    } finally {
      setBusy(false);
    }
  }

  const paid = appointment.payment?.status === "paid";
  const walkIn = appointment.source === "walk_in";
  const canAct = appointment.status === "booked" && (paid || walkIn);
  const canCancelHold = appointment.status === "pending_payment";
  const canUndo =
    appointment.status === "completed" ||
    appointment.status === "no_show" ||
    (appointment.status === "cancelled" && (paid || walkIn));

  return (
    <article
      className="border-b border-border py-5"
      style={{ borderInlineStart: `3px solid ${barberTone(appointment.barber.id ?? appointment.barber.name.en)}` }}
    >
      <div className="ps-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-display text-3xl tabular-nums text-foreground" dir="ltr">
            {formatAppointmentClock(locale, appointment.startsAt)}
          </p>
          <p className="text-sm text-muted-foreground">
            {nextUp ? `${copy.nextUp} · ` : null}
            {statusCopy(copy, appointment)}
          </p>
        </div>
        <p className="mt-3 text-lg font-medium text-foreground">{appointment.customerName}</p>
        <a
          href={`tel:${appointment.customerPhone}`}
          className="mt-1 inline-flex min-h-11 items-center text-base text-muted-foreground"
          dir="ltr"
        >
          {formatPhone(locale, appointment.customerPhone)}
        </a>
        <p className="text-sm text-muted-foreground">
          {text(locale, appointment.service.name)} · {text(locale, appointment.barber.name)}
          {appointment.source === "walk_in" ? ` · ${copy.sourceWalkIn}` : null}
        </p>
        {appointment.notes ? (
          <p className="mt-2 text-sm text-muted-foreground">{appointment.notes}</p>
        ) : null}

        {askCancel ? (
          <div className="mt-4 space-y-3">
            <p className="text-base text-foreground">{copy.cancelAsk}</p>
            <Button
              size="touch"
              variant="destructive"
              loading={busy}
              onClick={() => void setStatus("cancelled")}
            >
              {copy.cancelYes}
            </Button>
            <Button size="touch" variant="outline" onClick={() => setAskCancel(false)}>
              {copy.cancelNo}
            </Button>
          </div>
        ) : canAct ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Button size="touch" loading={busy} onClick={() => void setStatus("completed")}>
              {copy.complete}
            </Button>
            <Button size="touch" variant="outline" onClick={() => setAskCancel(true)}>
              {copy.cancel}
            </Button>
            <Button
              size="touch"
              variant="outline"
              loading={busy}
              onClick={() => void setStatus("no_show")}
            >
              {copy.markNoShow}
            </Button>
          </div>
        ) : canCancelHold ? (
          <Button className="mt-4" size="touch" variant="outline" onClick={() => setAskCancel(true)}>
            {copy.cancel}
          </Button>
        ) : canUndo ? (
          <Button
            className="mt-4"
            size="touch"
            variant="outline"
            loading={busy}
            onClick={() => void setStatus("booked")}
          >
            {copy.undo}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
