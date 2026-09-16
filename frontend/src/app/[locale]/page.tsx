import { ForBarbers } from "@/components/marketing/for-barbers";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { notFound } from "next/navigation";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <>
      <Hero locale={locale} dictionary={dictionary.hero} />
      <HowItWorks locale={locale} dictionary={dictionary.howItWorks} />
      <ForBarbers locale={locale} dictionary={dictionary.forBarbers} />
    </>
  );
}
