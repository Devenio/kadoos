"use client";

import { useLayoutEffect } from "react";
import { localeDirection, type Locale } from "@/i18n/config";

type DocumentLocaleProps = {
  locale: Locale;
};

export function DocumentLocale({ locale }: DocumentLocaleProps) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = localeDirection(locale);
  }, [locale]);

  return null;
}
