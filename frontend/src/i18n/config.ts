export const locales = ["en", "fa"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeMeta: Record<
  Locale,
  { nativeName: string; region: string; dir: "ltr" | "rtl" }
> = {
  en: { nativeName: "English", region: "United Kingdom", dir: "ltr" },
  fa: { nativeName: "فارسی", region: "ایران", dir: "rtl" },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

export function localeDirection(locale: Locale): "ltr" | "rtl" {
  return localeMeta[locale].dir;
}
