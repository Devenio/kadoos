export type LocalizedText = {
  en: string;
  fa: string;
};

export type ShopHoursDto = {
  weekday: number;
  closed: boolean;
  opensAt: string | null;
  closesAt: string | null;
};

export type ShopSummaryDto = {
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  neighborhood: LocalizedText;
  city: LocalizedText;
  address: LocalizedText;
  lat: number;
  lng: number;
  photoUrl: string;
  openNow: boolean;
  hoursToday: ShopHoursDto;
  nextOpen: ShopHoursDto | null;
  barberCount: number;
  serviceFromToman: number | null;
};

export type BarberDto = {
  id: string;
  name: LocalizedText;
  title: LocalizedText;
  bio: LocalizedText;
};

export type ServiceDto = {
  id: string;
  name: LocalizedText;
  durationMin: number;
  priceToman: number;
};

export type ShopDetailDto = ShopSummaryDto & {
  description: LocalizedText;
  barbers: BarberDto[];
  services: ServiceDto[];
  hours: ShopHoursDto[];
};
