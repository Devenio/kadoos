import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ThemeId } from "@/lib/theme";

type SiteHeaderProps = {
  locale: Locale;
  dictionary: Dictionary;
  theme: ThemeId;
};

export function SiteHeader({ locale, dictionary, theme }: SiteHeaderProps) {
  const navigation = [
    { href: `/${locale}#how-it-works`, label: dictionary.nav.howItWorks },
    { href: `/${locale}#for-barbers`, label: dictionary.nav.forBarbers },
  ] as const;

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Link
          href={`/${locale}`}
          className="font-display text-xl tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          {dictionary.brand}
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher locale={locale} labels={dictionary.language} />
          <ThemeSwitcher currentTheme={theme} labels={dictionary.theme} />
          <Button asChild size="sm">
            <Link href={`/${locale}#how-it-works`}>{dictionary.nav.book}</Link>
          </Button>
        </div>
      </div>
      <nav className="flex items-center gap-5 border-t border-border/70 px-6 py-3 text-sm text-muted-foreground md:hidden">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
