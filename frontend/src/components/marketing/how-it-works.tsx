import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

type HowItWorksProps = {
  locale: Locale;
  dictionary: Dictionary["howItWorks"];
};

export function HowItWorks({ locale, dictionary }: HowItWorksProps) {
  const isPersian = locale === "fa";

  return (
    <section id="how-it-works" className="scroll-mt-24 border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
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
            locale === "fa" ? "font-normal" : "font-medium",
          )}
        >
          {dictionary.title}
        </h2>
        <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-12">
          {dictionary.steps.map((step) => (
            <li key={step.number} className="border-t border-border pt-6">
              <p className="font-display text-2xl text-muted-foreground">
                {step.number}
              </p>
              <h3 className="mt-4 text-base font-medium text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
