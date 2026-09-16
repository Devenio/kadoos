"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ locale?: string }>();
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-24 sm:px-8">
      <p className="text-xs font-medium text-muted-foreground">
        {dictionary.error.eyebrow}
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        {dictionary.error.title}
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
        {dictionary.error.body}
      </p>
      <div className="mt-8">
        <Button onClick={reset} size="touch">
          {dictionary.error.retry}
        </Button>
      </div>
    </section>
  );
}
