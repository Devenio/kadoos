import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentLocale } from "@/components/document-locale";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale, localeDirection, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { parseTheme, themeCookieName } from "@/lib/theme";
import { cookies, headers } from "next/headers";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    return {};
  }

  const dictionary = getDictionary(rawLocale);

  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const dictionary = getDictionary(locale);
  const cookieStore = await cookies();
  const theme = parseTheme(cookieStore.get(themeCookieName)?.value);
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";
  const isDesk = /\/desk(\/|$)/.test(pathname);

  return (
    <div
      lang={locale}
      dir={localeDirection(locale)}
      className="flex flex-1 flex-col"
    >
      <DocumentLocale locale={locale} />
      {isDesk ? null : (
        <SiteHeader locale={locale} dictionary={dictionary} />
      )}
      <main className="flex flex-1 flex-col">{children}</main>
      {isDesk ? null : (
        <SiteFooter locale={locale} dictionary={dictionary} theme={theme} />
      )}
    </div>
  );
}
