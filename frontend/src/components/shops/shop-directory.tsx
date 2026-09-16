import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  formatClock,
  formatPrice,
  place,
  text,
  weekdayLabel,
} from "@/lib/shop-format";
import type { ShopSummary } from "@/types/shop";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

type ShopDirectoryProps = {
  locale: Locale;
  dictionary: Dictionary["shops"];
  shops: ShopSummary[];
};

export function ShopDirectory({ locale, dictionary, shops }: ShopDirectoryProps) {
  const isPersian = locale === "fa";

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 sm:px-8 sm:pt-24">
      <p
        className={
          isPersian
            ? "text-xs font-medium tracking-wide text-muted-foreground"
            : "text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase"
        }
      >
        {dictionary.eyebrow}
      </p>
      <h1
        className={`mt-4 max-w-2xl font-display text-4xl leading-snug tracking-tight text-foreground sm:text-5xl ${
          isPersian ? "font-normal" : "font-medium"
        }`}
      >
        {dictionary.title}
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
        {dictionary.body}
      </p>
      <ul className="mt-16 divide-y divide-border border-y border-border">
        {shops.map((shop) => (
          <li key={shop.slug}>
            <Link
              href={`/${locale}/shops/${shop.slug}`}
              className="group flex flex-col gap-4 py-8 transition-colors sm:flex-row sm:items-end sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  {place(locale, shop.neighborhood, shop.city)}
                </p>
                <h2
                  className={`mt-2 font-display text-3xl tracking-tight text-foreground group-hover:opacity-80 sm:text-4xl ${
                    isPersian ? "font-normal" : "font-medium"
                  }`}
                >
                  {text(locale, shop.name)}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                  {text(locale, shop.tagline)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1 text-sm text-muted-foreground sm:items-end sm:text-end">
                <p className="text-foreground">
                  {shop.openNow ? dictionary.openNow : statusAway(dictionary, locale, shop)}
                </p>
                {shop.serviceFromToman !== null ? (
                  <p>
                    {dictionary.from} {formatPrice(locale, shop.serviceFromToman)}
                  </p>
                ) : null}
                <p className="inline-flex items-center gap-1 text-foreground">
                  {dictionary.seeShop}
                  {isPersian ? (
                    <ArrowLeftIcon className="size-3.5" />
                  ) : (
                    <ArrowRightIcon className="size-3.5" />
                  )}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function statusAway(
  dictionary: Dictionary["shops"],
  locale: Locale,
  shop: ShopSummary,
): string {
  if (shop.nextOpen && shop.nextOpen.weekday === shop.hoursToday.weekday) {
    return `${dictionary.opensAt} ${formatClock(locale, shop.nextOpen.opensAt)}`;
  }

  if (shop.nextOpen) {
    return `${dictionary.opens} ${weekdayLabel(locale, shop.nextOpen.weekday)}`;
  }

  return dictionary.closedNow;
}
