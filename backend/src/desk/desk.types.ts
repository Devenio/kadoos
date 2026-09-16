import type { Request } from 'express';

export type DeskAuthedRequest = Request & {
  desk: { sub: string; shopId: string; exp: number };
};

export type LocalizedText = {
  en: string;
  fa: string;
};

export type DeskBarberDto = {
  id: string;
  name: LocalizedText;
  title: LocalizedText;
  bio: LocalizedText;
  sortOrder: number;
  active: boolean;
};

export type DeskServiceDto = {
  id: string;
  name: LocalizedText;
  durationMin: number;
  priceToman: number;
  sortOrder: number;
  active: boolean;
};

export type DeskHoursDto = {
  weekday: number;
  closed: boolean;
  opensAt: string | null;
  closesAt: string | null;
};

export type DeskHoursPreviewDto = {
  hours: DeskHoursDto[];
  openNow: boolean;
  weekday: number;
};

export type DeskShopDto = {
  id: string;
  slug: string;
  published: boolean;
  iban: string | null;
  payoutReady: boolean;
  feePercent: number;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  neighborhood: LocalizedText;
  city: LocalizedText;
  address: LocalizedText;
  lat: number;
  lng: number;
  photoUrl: string;
};

export type DeskTimeOffDto = {
  id: string;
  barberId: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
};

export type DeskPayoutRowDto = {
  id: string;
  appointmentId: string;
  code: string;
  customerName: string;
  amount: number;
  shopShare: number;
  refId: string | null;
  paidAt: string;
};

export type DeskPayoutsDto = {
  iban: string | null;
  payoutReady: boolean;
  feePercent: number;
  recent: DeskPayoutRowDto[];
};

export type DeskInsightsDto = {
  today: {
    booked: number;
    completed: number;
    cancelled: number;
    noShow: number;
    pendingPayment: number;
  };
  last7Days: {
    count: number;
    completedRate: number;
    shopShareToman: number;
    topService: { name: LocalizedText; count: number } | null;
  };
  latestCreatedAt: string | null;
};
