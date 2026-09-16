import type { Locale } from "@/i18n/config";

export const en = {
  meta: {
    title: "Kadoos — A barbershop, booked with care",
    description:
      "Appointment booking for men’s barbershops. Find a shop, choose a barber, and reserve a chair that is actually free.",
  },
  brand: "Kadoos",
  nav: {
    howItWorks: "How it works",
    forBarbers: "For barbers",
    shops: "Shops",
    book: "Book a chair",
  },
  hero: {
    eyebrow: "Men’s barber booking",
    title: "The chair, reserved without the wait.",
    body: "Find a barbershop, choose a barber, and book a time that is actually open — no group chats, no guesswork.",
    primary: "Book a chair",
    secondary: "For barbershops",
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "Three quiet steps to the chair.",
    steps: [
      {
        number: "01",
        title: "Choose a shop",
        body: "Open a barbershop’s world — the cuts, the barbers, and the hours they keep.",
      },
      {
        number: "02",
        title: "Pick who and what",
        body: "Select a service and the barber you trust. Duration and price are clear before you continue.",
      },
      {
        number: "03",
        title: "Reserve a time",
        body: "See real availability and book in a few taps. Reschedule later according to the shop’s rules.",
      },
    ],
  },
  forBarbers: {
    eyebrow: "For barbershops",
    title: "A quieter way to run the day.",
    body: "Your hours, your chair, your services, your calendar — in one place. Built for shops that already have a point of view.",
    items: [
      "Shop profile and branding",
      "Barbers and services",
      "Working hours and blocked time",
      "Appointment calendar",
    ],
  },
  footer: {
    tagline: "Appointment booking for men’s barbershops.",
    available: "Appointments available.",
    unavailable: "Booking is temporarily unavailable.",
  },
  notFound: {
    eyebrow: "Page not found",
    title: "This page does not exist.",
    body: "The address may be incorrect, or the page may have been moved.",
    back: "Back to Kadoos",
  },
  error: {
    eyebrow: "Something went wrong",
    title: "This page could not be loaded.",
    body: "Please try again. If the problem continues, come back in a moment.",
    retry: "Try again",
  },
  language: {
    label: "Language",
    en: "English",
    fa: "فارسی",
  },
  shops: {
    metaTitle: "Shops — Kadoos",
    eyebrow: "Barbershops",
    title: "A chair, somewhere in the city.",
    body: "Three shops to start. Open one, read the room, and see who is on the chair.",
    seeShop: "See the shop",
    openNow: "Open now",
    closedNow: "Closed now",
    opens: "Opens",
    opensAt: "Opens at",
    from: "From",
    back: "All shops",
    barbers: "Barbers",
    services: "Services",
    hours: "Hours",
    bookingSoon: "Booking the chair comes next.",
    emptyEyebrow: "No shops yet",
    emptyTitle: "No barbershops are listed.",
    emptyBody: "When a shop is ready, it will appear here.",
    unavailableEyebrow: "Shops unavailable",
    unavailableTitle: "The list could not be loaded.",
    unavailableBody: "The booking service is not responding. Try again in a moment.",
    retry: "Try again",
  },
  theme: {
    label: "Theme",
    ivory: "Ivory",
    marble: "Marble",
    cedar: "Cedar",
    ink: "Ink",
    oak: "Oak",
    brass: "Brass",
  },
};

export type Dictionary = typeof en;

export const fa = {
  meta: {
    title: "کادوس — نوبت آرایشگاه، با دقت",
    description:
      "نوبت‌دهی برای آرایشگاه مردانه. آرایشگاه را پیدا کنید، آرایشگر را انتخاب کنید، و صندلی‌ای رزرو کنید که واقعاً خالی است.",
  },
  brand: "کادوس",
  nav: {
    howItWorks: "چطور کار می‌کند",
    forBarbers: "برای آرایشگر",
    shops: "آرایشگاه‌ها",
    book: "رزرو صندلی",
  },
  hero: {
    eyebrow: "نوبت‌دهی آرایشگاه مردانه",
    title: "صندلی، بدون معطلی رزرو می‌شود",
    body: "آرایشگاه را پیدا کنید، آرایشگر را انتخاب کنید، و زمانی را رزرو کنید که واقعاً خالی است — بدون پیام‌های پی‌درپی و حدس زدن.",
    primary: "رزرو صندلی",
    secondary: "برای آرایشگاه‌ها",
  },
  howItWorks: {
    eyebrow: "چطور کار می‌کند",
    title: "سه قدم تا صندلی",
    steps: [
      {
        number: "۰۱",
        title: "آرایشگاه را انتخاب کنید",
        body: "دنیای یک آرایشگاه را ببینید — مدل‌ها، آرایشگرها، و ساعت‌هایی که کار می‌کنند.",
      },
      {
        number: "۰۲",
        title: "سرویس و آرایشگر",
        body: "سرویس و آرایشگر مورد اعتمادتان را انتخاب کنید. مدت و قیمت قبل از ادامه مشخص است.",
      },
      {
        number: "۰۳",
        title: "ساعت را رزرو کنید",
        body: "ظرفیت واقعی را ببینید و در چند حرکت نوبت بگیرید. بعداً مطابق قوانین آرایشگاه می‌توانید تغییرش دهید.",
      },
    ],
  },
  forBarbers: {
    eyebrow: "برای آرایشگاه‌ها",
    title: "روز شلوغ، بدون درهم‌ریختگی",
    body: "ساعت کاری، صندلی، سرویس‌ها و تقویم — همه در یک جا. برای آرایشگاه‌هایی که سبک خودشان را دارند.",
    items: [
      "پروفایل و هویت آرایشگاه",
      "آرایشگرها و سرویس‌ها",
      "ساعت کاری و زمان‌های مسدود",
      "تقویم نوبت‌ها",
    ],
  },
  footer: {
    tagline: "نوبت‌دهی برای آرایشگاه مردانه.",
    available: "امکان رزرو وجود دارد.",
    unavailable: "رزرو فعلاً در دسترس نیست.",
  },
  notFound: {
    eyebrow: "صفحه پیدا نشد",
    title: "این صفحه وجود ندارد.",
    body: "آدرس ممکن است اشتباه باشد، یا صفحه جابه‌جا شده باشد.",
    back: "بازگشت به کادوس",
  },
  error: {
    eyebrow: "خطایی رخ داد",
    title: "این صفحه بارگذاری نشد.",
    body: "دوباره تلاش کنید. اگر مشکل ادامه داشت، کمی بعد برگردید.",
    retry: "تلاش دوباره",
  },
  language: {
    label: "زبان",
    en: "English",
    fa: "فارسی",
  },
  shops: {
    metaTitle: "آرایشگاه‌ها — کادوس",
    eyebrow: "آرایشگاه‌ها",
    title: "یک صندلی، جایی در شهر",
    body: "سه آرایشگاه برای شروع. یکی را باز کنید، فضا را ببینید، و ببینید چه کسی پشت صندلی است.",
    seeShop: "دیدن آرایشگاه",
    openNow: "الان باز است",
    closedNow: "الان تعطیل است",
    opens: "باز می‌شود",
    opensAt: "باز می‌شود ساعت",
    from: "از",
    back: "همه آرایشگاه‌ها",
    barbers: "آرایشگرها",
    services: "سرویس‌ها",
    hours: "ساعت کاری",
    bookingSoon: "رزرو صندلی مرحله بعد است.",
    emptyEyebrow: "هنوز آرایشگاهی نیست",
    emptyTitle: "آرایشگاهی فهرست نشده است.",
    emptyBody: "وقتی آرایشگاهی آماده باشد، اینجا می‌آید.",
    unavailableEyebrow: "آرایشگاه‌ها در دسترس نیستند",
    unavailableTitle: "فهرست بارگذاری نشد.",
    unavailableBody: "سرویس نوبت پاسخ نمی‌دهد. کمی بعد دوباره تلاش کنید.",
    retry: "تلاش دوباره",
  },
  theme: {
    label: "تم",
    ivory: "استخوانی",
    marble: "مرمر",
    cedar: "سرو",
    ink: "مرکب",
    oak: "بلوط",
    brass: "برنج",
  },
} as Dictionary;

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  fa,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
