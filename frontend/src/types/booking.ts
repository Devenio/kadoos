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
  status: z.enum(["pending_payment", "booked", "completed", "cancelled", "no_show"]),
  source: z.enum(["online", "walk_in"]).optional().default("online"),
  notes: z.string().nullable().optional().default(null),
  customerName: z.string(),
  customerPhone: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  payment: z
    .object({
      status: z.enum(["requested", "paid", "failed", "cancelled"]),
      amount: z.number(),
      refId: z.string().nullable(),
    })
    .nullable()
    .optional()
    .default(null),
  shop: z.object({
    slug: z.string(),
    name: localizedTextSchema,
    address: localizedTextSchema,
    neighborhood: localizedTextSchema,
    city: localizedTextSchema,
    lat: z.number(),
    lng: z.number(),
  }),
  barber: z.object({
    id: z.string().optional(),
    name: localizedTextSchema,
  }),
  service: z.object({
    id: z.string().optional(),
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
