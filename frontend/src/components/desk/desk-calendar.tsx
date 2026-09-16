"use client";

import { DeskVisit } from "@/components/desk/desk-visit";
import { deskFieldClass, useDesk } from "@/components/desk/desk-shell";
import { Button } from "@/components/ui/button";
import {
  deskAppointments,
  deskBarbers,
  deskCreateTimeOff,
  deskDeleteTimeOff,
  deskTimeOff,
  deskUpdateAppointment,
} from "@/lib/api/desk";
import {
  barberTone,
  formatAppointmentClock,
  formatDayButton,
  shiftYmd,
  startOfTehranWeek,
  tehranYmd,
  text,
  weekdayFromYmd,
} from "@/lib/shop-format";
import type { Appointment } from "@/types/booking";
import type { DeskBarber, DeskTimeOff } from "@/types/desk";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export function DeskCalendar() {
  const { locale, dictionary, fail, toast } = useDesk();
  const copy = dictionary.desk;
  const isPersian = locale === "fa";
  const PrevIcon = isPersian ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = isPersian ? ChevronLeftIcon : ChevronRightIcon;
  const today = tehranYmd();
  const [date, setDate] = useState(today);
  const [mode, setMode] = useState<"day" | "week">("day");
  const [rows, setRows] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<DeskBarber[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => {
    if (mode === "day") {
      return { from: date, to: date };
    }
    const start = startOfTehranWeek(date);
    return { from: start, to: shiftYmd(start, 6) };
  }, [date, mode]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, team] = await Promise.all([
        deskAppointments({ from: range.from, to: range.to }),
        deskBarbers(),
      ]);
      setRows(list);
      setBarbers(team);
    } catch {
      fail();
    } finally {
      setLoading(false);
    }
  }, [fail, range.from, range.to]);

  useEffect(() => {
    void load();
  }, [load]);

  const labels = formatDayButton(locale, date, weekdayFromYmd(date));
  const weekDays = Array.from({ length: 7 }, (_, index) => shiftYmd(range.from, index));

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">{copy.nav.calendar}</h1>
        <div className="flex gap-2">
          <Button
            size="touch"
            variant={mode === "day" ? "default" : "outline"}
            onClick={() => setMode("day")}
          >
            {copy.day}
          </Button>
          <Button
            size="touch"
            variant={mode === "week" ? "default" : "outline"}
            onClick={() => setMode("week")}
          >
            {copy.week}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button
          size="icon-lg"
          variant="outline"
          aria-label={copy.previous}
          onClick={() => setDate((current) => shiftYmd(current, mode === "week" ? -7 : -1))}
        >
          <PrevIcon />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-lg font-medium">{labels.day}</p>
          <p className="text-sm text-muted-foreground">
            {date === today ? copy.today : `${range.from} – ${range.to}`}
          </p>
        </div>
        <Button
          size="icon-lg"
          variant="outline"
          aria-label={copy.next}
          onClick={() => setDate((current) => shiftYmd(current, mode === "week" ? 7 : 1))}
        >
          <NextIcon />
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="date"
          value={date}
          aria-label={copy.jumpDate}
          onChange={(event) => setDate(event.target.value || today)}
          className={deskFieldClass()}
        />
        <Button size="touch" variant="outline" onClick={() => setDate(today)}>
          {copy.today}
        </Button>
        <Button size="touch" variant="outline" onClick={() => setBlockOpen(true)}>
          {copy.blockTime}
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 h-40 animate-pulse rounded-xl bg-muted" />
      ) : mode === "day" ? (
        rows.length === 0 ? (
          <p className="mt-10 text-muted-foreground">{copy.empty}</p>
        ) : (
          <ul className="mt-6">
            {rows.map((row) => (
              <li key={row.id}>
                <DeskVisit
                  locale={locale}
                  copy={copy}
                  appointment={row}
                  onFail={fail}
                  onChange={(updated) => {
                    setRows((current) =>
                      current.map((item) => (item.id === updated.id ? updated : item)),
                    );
                    setSelected(updated);
                  }}
                />
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-7">
          {weekDays.map((ymd) => {
            const dayRows = rows.filter((row) => tehranDate(row.startsAt) === ymd);
            const heading = formatDayButton(locale, ymd, weekdayFromYmd(ymd));
            return (
              <div key={ymd} className="min-h-40 rounded-xl border border-border p-3">
                <p className="text-sm font-medium">{heading.day}</p>
                <p className="text-xs text-muted-foreground">{heading.date}</p>
                <ul className="mt-3 space-y-2">
                  {dayRows.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        className="w-full rounded-lg px-2 py-2 text-start text-sm"
                        style={{ background: "color-mix(in oklab, var(--muted) 80%, transparent)" }}
                        onClick={() => setSelected(row)}
                      >
                        <span
                          className="me-2 inline-block size-2 rounded-full"
                          style={{ background: barberTone(row.barber.id ?? "") }}
                        />
                        <span dir="ltr">{formatAppointmentClock(locale, row.startsAt)}</span>{" "}
                        {row.customerName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-30">
          <button type="button" className="absolute inset-0 bg-foreground/20" onClick={() => setSelected(null)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background px-5 py-6 sm:inset-y-0 sm:end-0 sm:start-auto sm:w-full sm:max-w-md sm:rounded-none sm:border-s">
            <DeskVisit
              locale={locale}
              copy={copy}
              appointment={selected}
              onFail={fail}
              onChange={(updated) => {
                setSelected(updated);
                setRows((current) =>
                  current.map((item) => (item.id === updated.id ? updated : item)),
                );
              }}
            />
            <NotesField
              appointment={selected}
              copy={copy}
              onChange={(updated) => {
                setSelected(updated);
                setRows((current) =>
                  current.map((item) => (item.id === updated.id ? updated : item)),
                );
              }}
              onFail={fail}
            />
            <div className="mt-4 flex gap-3">
              <Button
                size="touch"
                variant="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(selected.code).then(() => toast(copy.copied));
                }}
              >
                {copy.copyCode}
              </Button>
              <Button size="touch" variant="outline" onClick={() => setSelected(null)}>
                {copy.nav.close}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {blockOpen ? (
        <BlockSheet
          locale={locale}
          copy={copy}
          barbers={barbers.filter((item) => item.active)}
          date={date}
          onClose={() => setBlockOpen(false)}
          onSaved={() => {
            setBlockOpen(false);
            toast(copy.saved);
            void load();
          }}
          onFail={fail}
        />
      ) : null}
    </section>
  );
}

function tehranDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function NotesField({
  appointment,
  copy,
  onChange,
  onFail,
}: {
  appointment: Appointment;
  copy: ReturnType<typeof useDesk>["dictionary"]["desk"];
  onChange: (appointment: Appointment) => void;
  onFail: () => void;
}) {
  const [notes, setNotes] = useState(appointment.notes ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNotes(appointment.notes ?? "");
  }, [appointment.id, appointment.notes]);

  return (
    <label className="mt-4 block">
      {copy.notes}
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className={`${deskFieldClass()} h-24 py-3`}
      />
      <Button
        className="mt-3"
        size="touch"
        variant="outline"
        loading={busy}
        onClick={() => {
          setBusy(true);
          void deskUpdateAppointment(appointment.id, { notes: notes || null })
            .then(onChange)
            .catch(onFail)
            .finally(() => setBusy(false));
        }}
      >
        {copy.save}
      </Button>
    </label>
  );
}

function BlockSheet({
  locale,
  copy,
  barbers,
  date,
  onClose,
  onSaved,
  onFail,
}: {
  locale: import("@/i18n/config").Locale;
  copy: ReturnType<typeof useDesk>["dictionary"]["desk"];
  barbers: DeskBarber[];
  date: string;
  onClose: () => void;
  onSaved: () => void;
  onFail: () => void;
}) {
  const [barberId, setBarberId] = useState(barbers[0]?.id ?? "");
  const [dayOff, setDayOff] = useState(true);
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("20:00");
  const [reason, setReason] = useState("");
  const [existing, setExisting] = useState<DeskTimeOff[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!barberId) {
      return;
    }
    void deskTimeOff(barberId).then(setExisting).catch(onFail);
  }, [barberId, onFail]);

  return (
    <div className="fixed inset-0 z-30">
      <button type="button" className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <form
        className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background px-5 py-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!barberId) {
            return;
          }
          const startsAt = dayOff
            ? `${date}T00:00:00.000+03:30`
            : `${date}T${start}:00.000+03:30`;
          const endsAt = dayOff
            ? `${date}T23:59:00.000+03:30`
            : `${date}T${end}:00.000+03:30`;
          setBusy(true);
          void deskCreateTimeOff(barberId, {
            startsAt: new Date(startsAt).toISOString(),
            endsAt: new Date(endsAt).toISOString(),
            reason: reason || copy.blockTime,
          })
            .then(onSaved)
            .catch(onFail)
            .finally(() => setBusy(false));
        }}
      >
        <h2 className="font-display text-2xl">{copy.blockTime}</h2>
        <label className="mt-5 block">
          <span>{copy.nav.barbers}</span>
          <select
            value={barberId}
            onChange={(event) => setBarberId(event.target.value)}
            className={deskFieldClass()}
          >
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {text(locale, barber.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={dayOff}
            onChange={(event) => setDayOff(event.target.checked)}
          />
          {copy.blockDay}
        </label>
        {dayOff ? null : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label>
              {copy.starts}
              <input
                type="time"
                value={start}
                onChange={(event) => setStart(event.target.value)}
                className={deskFieldClass()}
              />
            </label>
            <label>
              {copy.ends}
              <input
                type="time"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
                className={deskFieldClass()}
              />
            </label>
          </div>
        )}
        <label className="mt-4 block">
          {copy.reason}
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className={deskFieldClass()}
          />
        </label>
        {existing.length > 0 ? (
          <ul className="mt-5 space-y-2 text-sm">
            {existing.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <span dir="ltr">
                  {item.startsAt.slice(0, 16)} – {item.endsAt.slice(11, 16)}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void deskDeleteTimeOff(item.id)
                      .then(() => setExisting((rows) => rows.filter((row) => row.id !== item.id)))
                      .catch(onFail);
                  }}
                >
                  {copy.removeBlock}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button size="touch" type="submit" loading={busy}>
            {copy.save}
          </Button>
          <Button size="touch" type="button" variant="outline" onClick={onClose}>
            {copy.cancel}
          </Button>
        </div>
      </form>
    </div>
  );
}
