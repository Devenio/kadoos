import { ShopDirectory } from "@/components/shops/shop-directory";
import { ShopsEmpty, ShopsUnavailable } from "@/components/shops/shop-states";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getShops } from "@/lib/api/shops";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
    title: dictionary.shops.metaTitle,
    description: dictionary.shops.body,
  };
}

export default async function ShopsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale;
  const dictionary = getDictionary(locale);

  try {
    const shops = await getShops();
    if (shops.length === 0) {
      return <ShopsEmpty dictionary={dictionary.shops} />;
    }
    return (
      <ShopDirectory locale={locale} dictionary={dictionary.shops} shops={shops} />
    );
  } catch {
    return (
      <ShopsUnavailable
        dictionary={dictionary.shops}
        onRetryHref={`/${locale}/shops`}
      />
    );
  }
}
