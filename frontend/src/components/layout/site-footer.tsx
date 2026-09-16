import { Suspense } from "react";
import Link from "next/link";
import { SystemStatus } from "@/components/system-status";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type SiteFooterProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function SiteFooter({ locale, dictionary }: SiteFooterProps) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-display text-lg text-foreground">{dictionary.brand}</p>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:items-end sm:text-end">
          <p>{dictionary.footer.tagline}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
            <Link
              href={`/${locale}/booking`}
              className="inline-flex min-h-11 items-center text-foreground hover:opacity-80"
            >
              {dictionary.footer.booking}
            </Link>
            <Link
              href={`/${locale}/desk`}
              className="inline-flex min-h-11 items-center text-foreground hover:opacity-80"
            >
              {dictionary.footer.desk}
            </Link>
          </div>
          <Suspense fallback={<StatusFallback />}>
            <SystemStatus
              available={dictionary.footer.available}
              unavailable={dictionary.footer.unavailable}
            />
          </Suspense>
        </div>
      </div>
    </footer>
  );
}

function StatusFallback() {
  return (
    <span className="inline-block h-4 w-36 animate-pulse rounded-sm bg-muted" />
  );
}
