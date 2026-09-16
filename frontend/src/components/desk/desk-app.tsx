"use client";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  deskAppointments,
  deskLogin,
  deskLogout,
  deskMe,
  deskUpdateAppointment,
} from "@/lib/api/booking";
import {
  formatAppointmentClock,
  formatDayButton,
  formatPhone,
  shiftYmd,
  tehranYmd,
  text,
  weekdayFromYmd,
} from "@/lib/shop-format";
import type { Appointment, DeskUser } from "@/types/booking";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type DeskAppProps = {
  locale: Locale;
  dictionary: Dictionary;
};

const fieldClass =
  "mt-2 h-14 w-full rounded-xl border border-border bg-background px-4 text-lg text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function DeskApp({ locale, dictionary }: DeskAppProps) {
  const copy = dictionary.desk;
  const [user, setUser] = useState<DeskUser | null | undefined>(undefined);

  useEffect(() => {
    void deskMe().then(setUser);
  }, []);

  if (user === undefined) {
    return (
      <section className="mx-auto w-full max-w-xl px-6 py-16 sm:px-8">
        <p className="text-base text-muted-foreground">{copy.title}</p>
      </section>
    );
  }

  if (!user) {
    return <DeskLogin dictionary={dictionary} onSignedIn={setUser} />;
  }

  return (
    <DeskBoard
      locale={locale}
      dictionary={dictionary}
      user={user}
      onSignedOut={() => setUser(null)}
    />
  );
}

function DeskLogin({
  dictionary,
  onSignedIn,
}: {
  dictionary: Dictionary;
  onSignedIn: (user: DeskUser) => void;
}) {
  const copy = dictionary.desk;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  return (
    <section className="mx-auto w-full max-w-xl px-6 py-12 sm:px-8">
      <p className="text-sm font-medium text-muted-foreground">{copy.eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl text-foreground">{copy.title}</h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.body}</p>
      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          setError(undefined);
          void deskLogin(email.trim(), password)
            .then(onSignedIn)
            .catch(() => setError(copy.signInError))
            .finally(() => setLoading(false));
        }}
      >
        <label className="block">
          <span className="text-base text-foreground">{copy.email}</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="username"
            dir="ltr"
            required
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="text-base text-foreground">{copy.password}</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            required
            className={fieldClass}
          />
        </label>
        {error ? (
          <p className="text-base text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button size="touch" type="submit" loading={loading}>
          {copy.signIn}
        </Button>
      </form>
    </section>
  );
}

function DeskBoard({
  locale,
  dictionary,
  user,
  onSignedOut,
}: {
  locale: Locale;
  dictionary: Dictionary;
  user: DeskUser;
  onSignedOut: () => void;
}) {
  const copy = dictionary.desk;
  const isPersian = locale === "fa";
  const PrevIcon = isPersian ? ChevronRightIcon : ChevronLeftIcon;
  const NextIcon = isPersian ? ChevronLeftIcon : ChevronRightIcon;
  const today = tehranYmd();
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const labels = formatDayButton(locale, date, weekdayFromYmd(date));

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setRows(await deskAppointments(date));
    } catch {
      setError(copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [copy.loadError, date]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="mx-auto w-full max-w-xl px-6 py-10 sm:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {copy.hello} {user.name}
          </p>
          <h1 className="mt-2 font-display text-3xl text-foreground">
            {text(locale, user.shopName)}
          </h1>
        </div>
        <Button
          variant="outline"
          size="touch"
          onClick={() => {
            void deskLogout().then(onSignedOut);
          }}
        >
          {copy.signOut}
        </Button>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Button
          size="icon-lg"
          variant="outline"
          aria-label={copy.previous}
          onClick={() => setDate((current) => shiftYmd(current, -1))}
        >
          <PrevIcon />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-lg font-medium text-foreground">{labels.day}</p>
          <p className="text-sm text-muted-foreground">
            {date === today ? copy.today : labels.date}
          </p>
        </div>
        <Button
          size="icon-lg"
          variant="outline"
          aria-label={copy.next}
          onClick={() => setDate((current) => shiftYmd(current, 1))}
        >
          <NextIcon />
        </Button>
      </div>

      {date !== today ? (
        <Button className="mt-4 w-full" size="touch" variant="outline" onClick={() => setDate(today)}>
          {copy.today}
        </Button>
      ) : null}

      {error ? (
        <p className="mt-8 text-base text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-10 text-base text-muted-foreground">{copy.title}</p>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-base text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {rows.map((row) => (
            <DeskRow
              key={row.id}
              locale={locale}
              copy={copy}
              appointment={row}
              onChange={(updated) => {
                setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function DeskRow({
  locale,
  copy,
  appointment,
  onChange,
}: {
  locale: Locale;
  copy: Dictionary["desk"];
  appointment: Appointment;
  onChange: (appointment: Appointment) => void;
}) {
  const [askCancel, setAskCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  async function setStatus(status: Appointment["status"]) {
    setBusy(true);
    try {
      onChange(await deskUpdateAppointment(appointment.id, status));
      setAskCancel(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="py-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-3xl tabular-nums text-foreground" dir="ltr">
          {formatAppointmentClock(locale, appointment.startsAt)}
        </p>
        <p className="text-sm text-muted-foreground">{statusLabel(copy, appointment.status)}</p>
      </div>
      <p className="mt-3 text-lg font-medium text-foreground">{appointment.customerName}</p>
      <p className="mt-1 text-base text-muted-foreground" dir="ltr">
        {formatPhone(locale, appointment.customerPhone)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {text(locale, appointment.service.name)} · {text(locale, appointment.barber.name)}
      </p>

      {appointment.status === "booked" ? (
        askCancel ? (
          <div className="mt-5 space-y-3">
            <p className="text-base text-foreground">{copy.cancelAsk}</p>
            <Button size="touch" variant="destructive" loading={busy} onClick={() => void setStatus("cancelled")}>
              {copy.cancelYes}
            </Button>
            <Button size="touch" variant="outline" onClick={() => setAskCancel(false)}>
              {copy.cancelNo}
            </Button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button size="touch" loading={busy} onClick={() => void setStatus("completed")}>
              {copy.complete}
            </Button>
            <Button size="touch" variant="outline" onClick={() => setAskCancel(true)}>
              {copy.cancel}
            </Button>
          </div>
        )
      ) : null}
    </li>
  );
}

function statusLabel(copy: Dictionary["desk"], status: Appointment["status"]): string {
  if (status === "cancelled") return copy.cancelled;
  if (status === "completed") return copy.completed;
  return copy.booked;
}
