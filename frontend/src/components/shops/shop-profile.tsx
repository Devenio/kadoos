import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  formatDuration,
  formatPrice,
  hoursLabel,
  orderedHours,
  place,
  text,
  weekdayLabel,
} from "@/lib/shop-format";
import type { ShopDetail } from "@/types/shop";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

type ShopProfileProps = {
  locale: Locale;
  dictionary: Dictionary["shops"];
  shop: ShopDetail;
};

export function ShopProfile({ locale, dictionary, shop }: ShopProfileProps) {
  const isPersian = locale === "fa";
  const BackIcon = isPersian ? ArrowRightIcon : ArrowLeftIcon;

  return (
    <article className="mx-auto w-full max-w-6xl px-6 pb-24 pt-12 sm:px-8 sm:pt-16">
      <Link
        href={`/${locale}/shops`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <BackIcon className="size-3.5" />
        {dictionary.back}
      </Link>

      <p className="mt-10 text-sm text-muted-foreground">
        {place(locale, shop.neighborhood, shop.city)}
      </p>
      <h1
        className={`mt-3 font-display text-5xl tracking-tight text-foreground sm:text-6xl ${
          isPersian ? "font-normal" : "font-medium"
        }`}
      >
        {text(locale, shop.name)}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
        {text(locale, shop.tagline)}
      </p>
      <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
        {text(locale, shop.description)}
      </p>
      <p className="mt-6 text-sm text-foreground">
        {shop.openNow ? dictionary.openNow : dictionary.closedNow}
      </p>

      <div className="mt-20 grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <section>
          <h2 className="text-xs font-medium text-muted-foreground">
            {dictionary.barbers}
          </h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {shop.barbers.map((barber) => (
              <li key={barber.id} className="py-6">
                <p className="text-base font-medium text-foreground">
                  {text(locale, barber.name)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {text(locale, barber.title)}
                </p>
                <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                  {text(locale, barber.bio)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xs font-medium text-muted-foreground">
            {dictionary.hours}
          </h2>
          <ul className="mt-6 space-y-3 text-sm">
            {orderedHours(shop.hours).map((row) => (
              <li
                key={row.weekday}
                className="flex items-baseline justify-between gap-6"
              >
                <span className="text-foreground">{weekdayLabel(locale, row.weekday)}</span>
                <span className="text-muted-foreground">{hoursLabel(locale, row)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-20">
        <h2 className="text-xs font-medium text-muted-foreground">
          {dictionary.services}
        </h2>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {shop.services.map((service) => (
            <li
              key={service.id}
              className="flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div>
                <p className="text-base text-foreground">{text(locale, service.name)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDuration(locale, service.durationMin)}
                </p>
              </div>
              <p className="text-sm text-foreground">
                {formatPrice(locale, service.priceToman)}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted-foreground">{dictionary.bookingSoon}</p>
      </section>
    </article>
  );
}
