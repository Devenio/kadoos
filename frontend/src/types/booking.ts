import { z } from "zod";
import { localizedTextSchema } from "@/types/shop";

export const availabilityDaySchema = z.object({
  date: z.string(),
  weekday: z.number().int(),
  slots: z.array(z.string()),
});

export const appointmentSchema = z.object({
  id: z.string(),
  code: z.string(),
  status: z.enum(["booked", "completed", "cancelled"]),
  customerName: z.string(),
  customerPhone: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  shop: z.object({
    slug: z.string(),
    name: localizedTextSchema,
  }),
  barber: z.object({
    name: localizedTextSchema,
  }),
  service: z.object({
    name: localizedTextSchema,
    durationMin: z.number(),
    priceToman: z.number(),
  }),
});

export const deskUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  shopId: z.string(),
  shopSlug: z.string(),
  shopName: localizedTextSchema,
});

export type AvailabilityDay = z.infer<typeof availabilityDaySchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type DeskUser = z.infer<typeof deskUserSchema>;
