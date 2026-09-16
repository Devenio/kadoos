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

export type AppointmentDto = {
  id: string;
  code: string;
  status: 'booked' | 'completed' | 'cancelled';
  customerName: string;
  customerPhone: string;
  startsAt: string;
  endsAt: string;
  shop: {
    slug: string;
    name: LocalizedText;
    address: LocalizedText;
    neighborhood: LocalizedText;
    city: LocalizedText;
    lat: number;
    lng: number;
  };
  barber: { name: LocalizedText };
  service: {
    name: LocalizedText;
    durationMin: number;
    priceToman: number;
  };
};
