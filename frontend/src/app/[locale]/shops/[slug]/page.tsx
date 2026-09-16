import { ShopProfile } from "@/components/shops/shop-profile";
import { ShopsUnavailable } from "@/components/shops/shop-states";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { text } from "@/lib/shop-format";
import { getShop } from "@/lib/api/shops";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) {
    return {};
  }

  try {
    const shop = await getShop(slug);
    if (!shop) {
      return {};
    }
    return {
      title: `${text(rawLocale, shop.name)} — Kadoos`,
      description: text(rawLocale, shop.tagline),
    };
  } catch {
    return {};
  }
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale;
  const dictionary = getDictionary(locale);

  try {
    const shop = await getShop(slug);
    if (!shop) {
      notFound();
    }
    return <ShopProfile locale={locale} dictionary={dictionary.shops} shop={shop} />;
  } catch {
    return (
      <ShopsUnavailable
        dictionary={dictionary.shops}
        onRetryHref={`/${locale}/shops/${slug}`}
      />
    );
  }
}
