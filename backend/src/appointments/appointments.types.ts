export type LocalizedText = {
  en: string;
  fa: string;
};

export type AvailabilityDayDto = {
  date: string;
  weekday: number;
  slots: string[];
};

export type CreateAppointmentInput = {
  serviceId: string;
  barberId?: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
};

export type PaymentSummaryDto = {
  status: 'requested' | 'paid' | 'failed' | 'cancelled';
  amount: number;
  refId: string | null;
};

export type AppointmentStatusDto =
  | 'pending_payment'
  | 'booked'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AppointmentDto = {
  id: string;
  code: string;
  status: AppointmentStatusDto;
  source: 'online' | 'walk_in';
  notes: string | null;
  customerName: string;
  customerPhone: string;
  startsAt: string;
  endsAt: string;
  payment: PaymentSummaryDto | null;
  shop: {
    slug: string;
    name: LocalizedText;
    address: LocalizedText;
    neighborhood: LocalizedText;
    city: LocalizedText;
    lat: number;
    lng: number;
  };
  barber: { id: string; name: LocalizedText };
  service: {
    id: string;
    name: LocalizedText;
    durationMin: number;
    priceToman: number;
  };
};

export type ListShopAppointmentsQuery = {
  date?: string;
  from?: string;
  to?: string;
  barberId?: string;
  status?: AppointmentStatusDto;
  q?: string;
  phone?: string;
};
