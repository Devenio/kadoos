"use client";

import { deskFieldClass, useDesk } from "@/components/desk/desk-shell";
import { Button } from "@/components/ui/button";
import { deskHours, deskReplaceHours } from "@/lib/api/desk";
import { orderedHours, weekdayLabel } from "@/lib/shop-format";
import type { ShopHours } from "@/types/shop";
import { useEffect, useState } from "react";

export function DeskHours() {
  const { locale, dictionary, fail, toast } = useDesk();
  const copy = dictionary.desk;
  const [days, setDays] = useState<ShopHours[]>([]);
  const [openNow, setOpenNow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void deskHours()
      .then((preview) => {
        setDays(orderedHours(preview.hours));
        setOpenNow(preview.openNow);
      })
      .catch(fail);
  }, [fail]);

  function update(weekday: number, patch: Partial<ShopHours>) {
    setDays((current) =>
      current.map((day) => (day.weekday === weekday ? { ...day, ...patch } : day)),
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="font-display text-3xl">{copy.nav.hours}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {openNow ? copy.openNow : copy.closedNow}
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          void deskReplaceHours(days)
            .then((preview) => {
              setDays(orderedHours(preview.hours));
              setOpenNow(preview.openNow);
              toast(copy.saved);
            })
            .catch(fail)
            .finally(() => setBusy(false));
        }}
      >
        {days.map((day) => (
          <div key={day.weekday} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{weekdayLabel(locale, day.weekday)}</p>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={day.closed}
                  onChange={(event) =>
                    update(day.weekday, {
                      closed: event.target.checked,
                      opensAt: event.target.checked ? null : day.opensAt ?? "10:00",
                      closesAt: event.target.checked ? null : day.closesAt ?? "20:00",
                    })
                  }
                />
                {copy.closed}
              </label>
            </div>
            {day.closed ? null : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label>
                  {copy.opens}
                  <input
                    type="time"
                    value={day.opensAt ?? ""}
                    onChange={(event) => update(day.weekday, { opensAt: event.target.value })}
                    className={deskFieldClass()}
                  />
                </label>
                <label>
                  {copy.closes}
                  <input
                    type="time"
                    value={day.closesAt ?? ""}
                    onChange={(event) => update(day.weekday, { closesAt: event.target.value })}
                    className={deskFieldClass()}
                  />
                </label>
              </div>
            )}
          </div>
        ))}
        <Button size="touch" type="submit" loading={busy} className="w-full">
          {copy.save}
        </Button>
      </form>
    </section>
  );
}
