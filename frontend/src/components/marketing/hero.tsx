import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

type HeroProps = {
  locale: Locale;
  dictionary: Dictionary["hero"];
};

export function Hero({ locale, dictionary }: HeroProps) {
  const isPersian = locale === "fa";

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:pt-32">
      <p
        className={cn(
          "text-xs font-medium text-muted-foreground",
          isPersian ? "tracking-wide" : "tracking-[0.22em] uppercase",
        )}
      >
        {dictionary.eyebrow}
      </p>
      <h1
        className={cn(
          "mt-6 max-w-3xl font-display text-5xl leading-[1.15] tracking-tight text-foreground sm:text-6xl sm:leading-[1.1] lg:text-7xl",
          isPersian ? "font-normal" : "font-medium",
        )}
      >
        {dictionary.title}
      </h1>
      <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg sm:leading-8">
        {dictionary.body}
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild size="touch">
          <Link href={`/${locale}/shops`}>
            {dictionary.primary}
            <ArrowRightIcon className="rtl:rotate-180" />
          </Link>
        </Button>
        <Button asChild size="touch" variant="outline">
          <Link href={`/${locale}/booking`}>{dictionary.secondary}</Link>
        </Button>
      </div>
    </section>
  );
}
