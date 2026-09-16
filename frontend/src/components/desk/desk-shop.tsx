"use client";

import { deskFieldClass, useDesk } from "@/components/desk/desk-shell";
import { Button } from "@/components/ui/button";
import { deskShop, deskUpdateShop } from "@/lib/api/desk";
import type { DeskShop as DeskShopDto } from "@/types/desk";
import { useEffect, useState } from "react";

export function DeskShopPage() {
  const { dictionary, fail, toast } = useDesk();
  const copy = dictionary.desk;
  const [shop, setShop] = useState<DeskShopDto>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void deskShop().then(setShop).catch(fail);
  }, [fail]);

  if (!shop) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  }

  function patch<K extends keyof DeskShopDto>(key: K, value: DeskShopDto[K]) {
    setShop((current) => (current ? { ...current, [key]: value } : current));
  }

  function patchText(
    field: "name" | "tagline" | "description" | "neighborhood" | "city" | "address",
    locale: "en" | "fa",
    value: string,
  ) {
    setShop((current) =>
      current ? { ...current, [field]: { ...current[field], [locale]: value } } : current,
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <h1 className="font-display text-3xl">{copy.nav.shop}</h1>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          void deskUpdateShop({
            published: shop.published,
            nameEn: shop.name.en,
            nameFa: shop.name.fa,
            taglineEn: shop.tagline.en,
            taglineFa: shop.tagline.fa,
            descriptionEn: shop.description.en,
            descriptionFa: shop.description.fa,
            neighborhoodEn: shop.neighborhood.en,
            neighborhoodFa: shop.neighborhood.fa,
            cityEn: shop.city.en,
            cityFa: shop.city.fa,
            addressEn: shop.address.en,
            addressFa: shop.address.fa,
            lat: shop.lat,
            lng: shop.lng,
            photoUrl: shop.photoUrl,
            iban: shop.iban,
          })
            .then((updated) => {
              setShop(updated);
              toast(copy.saved);
            })
            .catch(fail)
            .finally(() => setBusy(false));
        }}
      >
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={shop.published}
            onChange={(event) => patch("published", event.target.checked)}
          />
          <span>
            {copy.published}
            <span className="mt-1 block text-sm text-muted-foreground">{copy.publishedHelp}</span>
          </span>
        </label>
        <label className="block">
          {copy.slug}
          <input value={shop.slug} readOnly dir="ltr" className={`${deskFieldClass()} opacity-70`} />
          <span className="mt-1 block text-sm text-muted-foreground">{copy.slugHelp}</span>
        </label>
        {(
          [
            ["name", copy.nameEn, copy.nameFa],
            ["tagline", copy.taglineEn, copy.taglineFa],
            ["neighborhood", copy.neighborhoodEn, copy.neighborhoodFa],
            ["city", copy.cityEn, copy.cityFa],
            ["address", copy.addressEn, copy.addressFa],
          ] as const
        ).map(([field, en, fa]) => (
          <div key={field} className="grid gap-4 sm:grid-cols-2">
            <label>
              {en}
              <input
                required
                dir="ltr"
                value={shop[field].en}
                onChange={(event) => patchText(field, "en", event.target.value)}
                className={deskFieldClass()}
              />
            </label>
            <label>
              {fa}
              <input
                required
                value={shop[field].fa}
                onChange={(event) => patchText(field, "fa", event.target.value)}
                className={deskFieldClass()}
              />
            </label>
          </div>
        ))}
        <label className="block">
          {copy.descriptionEn}
          <textarea
            required
            dir="ltr"
            value={shop.description.en}
            onChange={(event) => patchText("description", "en", event.target.value)}
            className={`${deskFieldClass()} h-28 py-3`}
          />
        </label>
        <label className="block">
          {copy.descriptionFa}
          <textarea
            required
            value={shop.description.fa}
            onChange={(event) => patchText("description", "fa", event.target.value)}
            className={`${deskFieldClass()} h-28 py-3`}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            {copy.lat}
            <input
              type="number"
              step="0.0001"
              value={shop.lat}
              onChange={(event) => patch("lat", Number(event.target.value))}
              className={deskFieldClass()}
            />
          </label>
          <label>
            {copy.lng}
            <input
              type="number"
              step="0.0001"
              value={shop.lng}
              onChange={(event) => patch("lng", Number(event.target.value))}
              className={deskFieldClass()}
            />
          </label>
        </div>
        <label className="block">
          {copy.photoUrl}
          <input
            dir="ltr"
            value={shop.photoUrl}
            onChange={(event) => patch("photoUrl", event.target.value)}
            className={deskFieldClass()}
          />
        </label>
        <Button size="touch" type="submit" loading={busy} className="w-full">
          {copy.save}
        </Button>
      </form>
    </section>
  );
}
