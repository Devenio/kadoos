import { PaymentCallback } from "@/components/booking/payment-callback";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }
  const dictionary = getDictionary(rawLocale);

  return (
    <Suspense
      fallback={
        <section className="mx-auto w-full max-w-xl px-6 py-12 sm:px-8">
          <p className="text-sm font-medium text-muted-foreground">{dictionary.pay.verifying}</p>
        </section>
      }
    >
      <PaymentCallback locale={rawLocale} dictionary={dictionary} />
    </Suspense>
  );
}
