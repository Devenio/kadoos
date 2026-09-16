"use client";

import { DeskVisit } from "@/components/desk/desk-visit";
import { deskFieldClass, useDesk } from "@/components/desk/desk-shell";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import {
  deskAppointments,
  deskBarbers,
  deskInsights,
  deskServices,
  deskWalkIn,
} from "@/lib/api/desk";
import { formatPrice, tehranYmd, text } from "@/lib/shop-format";
import type { Appointment } from "@/types/booking";
import type { DeskBarber, DeskInsights, DeskService } from "@/types/desk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function DeskToday() {
  const { locale, dictionary, fail, toast } = useDesk();
  const copy = dictionary.desk;
  const today = tehranYmd();
  const [rows, setRows] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<DeskBarber[]>([]);
  const [insights, setInsights] = useState<DeskInsights>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [barberId, setBarberId] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [fresh, setFresh] = useState(false);
  const latestRef = useRef<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }
      setError(undefined);
      try {
        const [list, team, stats] = await Promise.all([
          deskAppointments({
            date: today,
            barberId: barberId || undefined,
            status: (status || undefined) as Appointment["status"] | undefined,
            q: q || undefined,
          }),
          deskBarbers(),
          deskInsights(),
        ]);
        setRows(list);
        setBarbers(team);
        setInsights(stats);
        if (
          latestRef.current &&
          stats.latestCreatedAt &&
          stats.latestCreatedAt > latestRef.current
        ) {
          setFresh(true);
        }
        if (stats.latestCreatedAt) {
          latestRef.current = stats.latestCreatedAt;
        }
      } catch {
        setError(copy.loadError);
      } finally {
        setLoading(false);
      }
    },
    [barberId, copy.loadError, q, status, today],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onFocus() {
      void load(true);
    }
    const timer = window.setInterval(() => void load(true), 30_000);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const nextUpId = useMemo(() => {
    const now = Date.now();
    return rows.find(
      (row) => row.status === "booked" && new Date(row.startsAt).getTime() >= now,
    )?.id;
  }, [rows]);

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">{copy.nav.today}</h1>
          {fresh ? (
            <p className="mt-2 text-sm text-foreground">{copy.newBooking}</p>
          ) : null}
        </div>
        <Button size="touch" onClick={() => setWalkInOpen(true)}>
          {copy.walkIn}
        </Button>
      </div>

      {insights ? <InsightsStrip locale={locale} copy={copy} insights={insights} /> : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={copy.search}
          className={deskFieldClass()}
        />
        <select
          value={barberId}
          onChange={(event) => setBarberId(event.target.value)}
          className={deskFieldClass()}
        >
          <option value="">{copy.allBarbers}</option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {text(locale, barber.name)}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={deskFieldClass()}
        >
          <option value="">{copy.allStatuses}</option>
          <option value="booked">{copy.booked}</option>
          <option value="completed">{copy.completed}</option>
          <option value="cancelled">{copy.cancelled}</option>
          <option value="no_show">{copy.noShow}</option>
          <option value="pending_payment">{copy.unpaid}</option>
        </select>
      </div>

      {error ? (
        <p className="mt-8 text-base text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8 space-y-4">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-base text-muted-foreground">{copy.emptyToday}</p>
      ) : (
        <ul className="mt-6">
          {rows.map((row) => (
            <li key={row.id}>
              <DeskVisit
                locale={locale}
                copy={copy}
                appointment={row}
                nextUp={row.id === nextUpId}
                onFail={fail}
                onChange={(updated) => {
                  setRows((current) =>
                    current.map((item) => (item.id === updated.id ? updated : item)),
                  );
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {walkInOpen ? (
        <WalkInSheet
          locale={locale}
          copy={copy}
          barbers={barbers.filter((item) => item.active)}
          onClose={() => setWalkInOpen(false)}
          onCreated={(appointment) => {
            setRows((current) =>
              [...current, appointment].sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
            );
            setWalkInOpen(false);
            toast(copy.saved);
          }}
          onFail={fail}
        />
      ) : null}
    </section>
  );
}

function InsightsStrip({
  locale,
  copy,
  insights,
}: {
  locale: Locale;
  copy: DictionaryDesk;
  insights: DeskInsights;
}) {
  const rate = Math.round(insights.last7Days.completedRate * 100);
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label={copy.booked} value={insights.today.booked} />
      <Stat label={copy.completed} value={insights.today.completed} />
      <Stat label={copy.cancelled} value={insights.today.cancelled} />
      <Stat label={copy.noShow} value={insights.today.noShow} />
      <p className="col-span-2 text-sm text-muted-foreground sm:col-span-4">
        {copy.insightsWeek}: {insights.last7Days.count} · {rate}% {copy.insightsCompleted}
        {insights.last7Days.shopShareToman
          ? ` · ${formatPrice(locale, insights.last7Days.shopShareToman)} ${copy.insightsCollected}`
          : ""}
        {insights.last7Days.topService
          ? ` · ${copy.insightsTop}: ${text(locale, insights.last7Days.topService.name)}`
          : ""}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums">{value}</p>
    </div>
  );
}

type DictionaryDesk = ReturnType<typeof useDesk>["dictionary"]["desk"];

function WalkInSheet({
  locale,
  copy,
  barbers,
  onClose,
  onCreated,
  onFail,
}: {
  locale: Locale;
  copy: DictionaryDesk;
  barbers: DeskBarber[];
  onClose: () => void;
  onCreated: (appointment: Appointment) => void;
  onFail: () => void;
}) {
  const [services, setServices] = useState<DeskService[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState(barbers[0]?.id ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [when, setWhen] = useState<"now" | "next">("now");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void deskServices().then((rows) => {
      const active = rows.filter((item) => item.active);
      setServices(active);
      setServiceId(active[0]?.id ?? "");
    });
  }, []);

  return (
    <div className="fixed inset-0 z-30">
      <button type="button" className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <form
        className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background px-5 py-6 sm:inset-auto sm:start-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          void deskWalkIn({
            serviceId,
            barberId,
            customerName: name,
            customerPhone: phone,
            when,
          })
            .then(onCreated)
            .catch(onFail)
            .finally(() => setBusy(false));
        }}
      >
        <h2 className="font-display text-2xl">{copy.walkInTitle}</h2>
        <label className="mt-5 block">
          <span>{copy.name}</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={deskFieldClass()}
          />
        </label>
        <label className="mt-4 block">
          <span>{copy.phone}</span>
          <input
            required
            dir="ltr"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={deskFieldClass()}
          />
        </label>
        <label className="mt-4 block">
          <span>{copy.nav.services}</span>
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className={deskFieldClass()}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {text(locale, service.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
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
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            type="button"
            size="touch"
            variant={when === "now" ? "default" : "outline"}
            onClick={() => setWhen("now")}
          >
            {copy.walkInNow}
          </Button>
          <Button
            type="button"
            size="touch"
            variant={when === "next" ? "default" : "outline"}
            onClick={() => setWhen("next")}
          >
            {copy.walkInNext}
          </Button>
        </div>
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
