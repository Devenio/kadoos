import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type SiteHeaderProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function SiteHeader({ locale, dictionary }: SiteHeaderProps) {
  const navigation = [
    { href: `/${locale}/shops`, label: dictionary.nav.shops },
    { href: `/${locale}/booking`, label: dictionary.nav.booking },
  ] as const;

  return (
    <header className="sticky top-0 z-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 border-b border-border/80 bg-background/85 backdrop-blur-md"
      />
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Link
          href={`/${locale}`}
          className="font-display text-xl text-foreground transition-opacity hover:opacity-80"
        >
          {dictionary.brand}
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher locale={locale} labels={dictionary.language} />
          <Button asChild size="touch" className="hidden sm:inline-flex">
            <Link href={`/${locale}/shops`}>{dictionary.nav.book}</Link>
          </Button>
        </div>
      </div>
      <nav className="relative flex items-center gap-6 border-t border-border/70 px-6 py-2 text-sm text-muted-foreground md:hidden">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex min-h-11 items-center transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href={`/${locale}/shops`}
          className="ms-auto inline-flex min-h-11 items-center text-foreground"
        >
          {dictionary.nav.book}
        </Link>
      </nav>
    </header>
  );
}
