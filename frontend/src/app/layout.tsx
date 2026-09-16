import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Amiri, Cormorant_Garamond, Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import { isLocale } from "@/i18n/config";
import { parseTheme, themeCookieName } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Kadoos",
  description: "Appointment booking for men’s barbershops.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const localeHeader = headerStore.get("x-locale");
  const locale = isLocale(localeHeader) ? localeHeader : "en";
  const direction = locale === "fa" ? "rtl" : "ltr";
  const theme = parseTheme(cookieStore.get(themeCookieName)?.value);

  return (
    <html
      lang={locale}
      dir={direction}
      data-theme={theme}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${vazirmatn.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
