import { z } from "zod";
import { localizedTextSchema, shopHoursSchema } from "@/types/shop";

export const deskBarberSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  title: localizedTextSchema,
  bio: localizedTextSchema,
  sortOrder: z.number(),
  active: z.boolean(),
});

export const deskServiceSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  durationMin: z.number(),
  priceToman: z.number(),
  sortOrder: z.number(),
  active: z.boolean(),
});

export const deskHoursPreviewSchema = z.object({
  hours: z.array(shopHoursSchema),
  openNow: z.boolean(),
  weekday: z.number(),
});

export const deskShopSchema = z.object({
  id: z.string(),
  slug: z.string(),
  published: z.boolean(),
  iban: z.string().nullable(),
  payoutReady: z.boolean(),
  feePercent: z.number(),
  name: localizedTextSchema,
  tagline: localizedTextSchema,
  description: localizedTextSchema,
  neighborhood: localizedTextSchema,
  city: localizedTextSchema,
  address: localizedTextSchema,
  lat: z.number(),
  lng: z.number(),
  photoUrl: z.string(),
});

export const deskTimeOffSchema = z.object({
  id: z.string(),
  barberId: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  reason: z.string().nullable(),
});

export const deskPayoutsSchema = z.object({
  iban: z.string().nullable(),
  payoutReady: z.boolean(),
  feePercent: z.number(),
  recent: z.array(
    z.object({
      id: z.string(),
      appointmentId: z.string(),
      code: z.string(),
      customerName: z.string(),
      amount: z.number(),
      shopShare: z.number(),
      refId: z.string().nullable(),
      paidAt: z.string(),
    }),
  ),
});

export const deskInsightsSchema = z.object({
  today: z.object({
    booked: z.number(),
    completed: z.number(),
    cancelled: z.number(),
    noShow: z.number(),
    pendingPayment: z.number(),
  }),
  last7Days: z.object({
    count: z.number(),
    completedRate: z.number(),
    shopShareToman: z.number(),
    topService: z
      .object({
        name: localizedTextSchema,
        count: z.number(),
      })
      .nullable(),
  }),
  latestCreatedAt: z.string().nullable(),
});

export type DeskBarber = z.infer<typeof deskBarberSchema>;
export type DeskService = z.infer<typeof deskServiceSchema>;
export type DeskHoursPreview = z.infer<typeof deskHoursPreviewSchema>;
export type DeskShop = z.infer<typeof deskShopSchema>;
export type DeskTimeOff = z.infer<typeof deskTimeOffSchema>;
export type DeskPayouts = z.infer<typeof deskPayoutsSchema>;
export type DeskInsights = z.infer<typeof deskInsightsSchema>;
