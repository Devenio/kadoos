import Link from "next/link";
import { locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  locale: Locale;
  labels: Dictionary["language"];
};

export function LanguageSwitcher({ locale, labels }: LanguageSwitcherProps) {
  return (
    <div
      role="group"
      aria-label={labels.label}
      className="flex items-center gap-1 text-sm"
    >
      {locales.map((item) => (
        <Link
          key={item}
          href={`/${item}`}
          hrefLang={item}
          className={cn(
            "px-1.5 py-1 transition-colors",
            item === "fa" && "font-fa",
            item === locale
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {labels[item]}
        </Link>
      ))}
    </div>
  );
}
