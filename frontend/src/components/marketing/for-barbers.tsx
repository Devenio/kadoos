import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

type ForBarbersProps = {
  locale: Locale;
  dictionary: Dictionary["forBarbers"];
};

export function ForBarbers({ locale, dictionary }: ForBarbersProps) {
  const isPersian = locale === "fa";

  return (
    <section id="for-barbers" className="scroll-mt-24 border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
        <div>
          <p
            className={cn(
              "text-xs font-medium text-muted-foreground",
              isPersian ? "tracking-wide" : "tracking-[0.22em] uppercase",
            )}
          >
            {dictionary.eyebrow}
          </p>
          <h2
            className={cn(
              "mt-4 max-w-xl font-display text-4xl leading-snug tracking-tight text-foreground sm:text-5xl",
              isPersian ? "font-normal" : "font-medium",
            )}
          >
            {dictionary.title}
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">
            {dictionary.body}
          </p>
        </div>
        <ul className="space-y-0 border-t border-border">
          {dictionary.items.map((item) => (
            <li
              key={item}
              className="border-b border-border py-4 text-sm text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
