import { PaymentCallback } from "@/components/booking/payment-callback";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }
  return { title: getDictionary(locale).pay.metaTitle };
}

export default async function PaymentCallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }
  const query = await searchParams;
  const dictionary = getDictionary(rawLocale);

  return (
    <PaymentCallback
      locale={rawLocale}
      dictionary={dictionary}
      status={firstQuery(query.Status) || firstQuery(query.status)}
      authority={firstQuery(query.Authority) || firstQuery(query.authority)}
    />
  );
}

function firstQuery(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}
