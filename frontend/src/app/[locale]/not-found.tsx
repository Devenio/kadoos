import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function NotFound() {
  const localeHeader = (await headers()).get("x-locale");
  const locale = isLocale(localeHeader) ? localeHeader : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-24 sm:px-8">
      <p className="text-xs font-medium text-muted-foreground">
        {dictionary.notFound.eyebrow}
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        {dictionary.notFound.title}
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
        {dictionary.notFound.body}
      </p>
      <div className="mt-8">
        <Button asChild size="lg">
          <Link href={`/${locale}`}>{dictionary.notFound.back}</Link>
        </Button>
      </div>
    </section>
  );
}
