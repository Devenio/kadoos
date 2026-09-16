"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { LocaleFlag } from "@/components/locale-flag";
import { isLocale, localeMeta, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  locale: Locale;
  labels: Dictionary["language"];
};

export function LanguageSwitcher({ locale, labels }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const pathname = usePathname();
  const current = localeMeta[locale];

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        aria-label={labels.label}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background ps-1.5 pe-3 text-sm text-foreground transition-colors",
          "hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          "active:translate-y-px",
          open && "bg-muted",
        )}
      >
        <LocaleFlag locale={locale} shape="round" />
        <span
          className={cn("min-w-10 text-start", locale === "fa" && "font-fa")}
          lang={locale}
        >
          {current.nativeName}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <ul
          id={menuId}
          role="listbox"
          aria-label={labels.label}
          className="absolute end-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-lg"
        >
          {locales.map((item) => {
            const selected = item === locale;
            const meta = localeMeta[item];

            return (
              <li key={item} role="option" aria-selected={selected}>
                <Link
                  href={withLocale(pathname, item)}
                  hrefLang={item}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                    selected
                      ? "bg-muted text-foreground"
                      : "text-foreground hover:bg-muted",
                  )}
                  onClick={(event) => {
                    if (
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    ) {
                      return;
                    }

                    event.preventDefault();
                    setOpen(false);
                    if (!selected) {
                      window.location.assign(withLocale(pathname, item));
                    }
                  }}
                >
                  <LocaleFlag locale={item} className="h-[1.15rem] w-7" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
                    <span
                      className={cn("leading-none", item === "fa" && "font-fa")}
                      lang={item}
                    >
                      {meta.nativeName}
                    </span>
                    <span
                      className={cn(
                        "text-[0.7rem] leading-none text-muted-foreground",
                        item === "fa" && "font-fa",
                      )}
                      lang={item}
                    >
                      {meta.region}
                    </span>
                  </span>
                  {selected ? (
                    <CheckIcon className="size-3.5 shrink-0 text-foreground" />
                  ) : (
                    <span className="size-3.5 shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function withLocale(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    segments[1] = nextLocale;
    return segments.join("/") || `/${nextLocale}`;
  }

  return `/${nextLocale}`;
}
