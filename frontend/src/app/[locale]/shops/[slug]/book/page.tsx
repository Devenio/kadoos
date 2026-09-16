import { BookingFlow } from "@/components/booking/booking-flow";
import { ShopsUnavailable } from "@/components/shops/shop-states";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getShop } from "@/lib/api/shops";
import { text } from "@/lib/shop-format";
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
  const dictionary = getDictionary(rawLocale);
  try {
    const shop = await getShop(slug);
    if (!shop) {
      return { title: dictionary.book.metaTitle };
    }
    return {
      title: `${dictionary.shops.bookTime} — ${text(rawLocale, shop.name)}`,
    };
  } catch {
    return { title: dictionary.book.metaTitle };
  }
}

export default async function BookShopPage({
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
    return <BookingFlow locale={locale} dictionary={dictionary} shop={shop} />;
  } catch {
    return (
      <ShopsUnavailable
        dictionary={dictionary.shops}
        onRetryHref={`/${locale}/shops/${slug}/book`}
      />
    );
  }
}
