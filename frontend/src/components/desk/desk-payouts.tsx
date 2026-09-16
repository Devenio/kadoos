"use client";

import { deskFieldClass, useDesk } from "@/components/desk/desk-shell";
import { Button } from "@/components/ui/button";
import { deskPayouts, deskUpdateShop } from "@/lib/api/desk";
import { formatAppointmentWhen, formatPrice } from "@/lib/shop-format";
import type { DeskPayouts } from "@/types/desk";
import { useEffect, useState } from "react";

const ibanPattern = /^IR[0-9]{24}$/;

export function DeskPayoutsPage() {
  const { locale, dictionary, fail, toast } = useDesk();
  const copy = dictionary.desk;
  const [data, setData] = useState<DeskPayouts>();
  const [iban, setIban] = useState("");
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    void deskPayouts()
      .then((next) => {
        setData(next);
        setIban(next.iban ?? "");
      })
      .catch(fail);
  }, [fail]);

  if (!data) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="font-display text-3xl">{copy.nav.payouts}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {copy.fee}: {data.feePercent}%
      </p>
      {!data.iban ? <p className="mt-4 text-base text-foreground">{copy.ibanEmpty}</p> : null}
      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          const normalized = iban.replace(/\s+/g, "").toUpperCase();
          if (normalized && !ibanPattern.test(normalized)) {
            setInvalid(true);
            return;
          }
          setInvalid(false);
          setBusy(true);
          void deskUpdateShop({ iban: normalized || null })
            .then((shop) => {
              setData((current) =>
                current
                  ? { ...current, iban: shop.iban, payoutReady: shop.payoutReady }
                  : current,
              );
              toast(copy.saved);
            })
            .catch(fail)
            .finally(() => setBusy(false));
        }}
      >
        <label className="block">
          {copy.iban}
          <input
            dir="ltr"
            value={iban}
            onChange={(event) => setIban(event.target.value)}
            className={deskFieldClass()}
          />
          <span className="mt-1 block text-sm text-muted-foreground">{copy.ibanHelp}</span>
        </label>
        {invalid ? (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {copy.ibanInvalid}
          </p>
        ) : null}
        <Button className="mt-4" size="touch" type="submit" loading={busy}>
          {copy.save}
        </Button>
      </form>

      {data.recent.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{copy.payoutsEmpty}</p>
      ) : (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {data.recent.map((row) => (
            <li key={row.id} className="py-4">
              <p className="font-medium">{row.customerName}</p>
              <p className="text-sm text-muted-foreground">
                {formatAppointmentWhen(locale, row.paidAt)}
              </p>
              <p className="mt-1 text-sm" dir="ltr">
                {copy.amount} {formatPrice(locale, row.amount)} · {copy.shopShare}{" "}
                {formatPrice(locale, row.shopShare)}
                {row.refId ? ` · ${copy.refId} ${row.refId}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
