import { z } from "zod";

export const localizedTextSchema = z.object({
  en: z.string(),
  fa: z.string(),
});

export const shopHoursSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  closed: z.boolean(),
  opensAt: z.string().nullable(),
  closesAt: z.string().nullable(),
});

export const shopSummarySchema = z.object({
  slug: z.string(),
  name: localizedTextSchema,
  tagline: localizedTextSchema,
  neighborhood: localizedTextSchema,
  city: localizedTextSchema,
  openNow: z.boolean(),
  hoursToday: shopHoursSchema,
  nextOpen: shopHoursSchema.nullable(),
  barberCount: z.number().int(),
  serviceFromToman: z.number().int().nullable(),
});

export const shopDetailSchema = shopSummarySchema.extend({
  description: localizedTextSchema,
  barbers: z.array(
    z.object({
      id: z.string(),
      name: localizedTextSchema,
      title: localizedTextSchema,
      bio: localizedTextSchema,
    }),
  ),
  services: z.array(
    z.object({
      id: z.string(),
      name: localizedTextSchema,
      durationMin: z.number().int(),
      priceToman: z.number().int(),
    }),
  ),
  hours: z.array(shopHoursSchema),
});

export const shopListSchema = z.array(shopSummarySchema);

export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type ShopHours = z.infer<typeof shopHoursSchema>;
export type ShopSummary = z.infer<typeof shopSummarySchema>;
export type ShopDetail = z.infer<typeof shopDetailSchema>;
