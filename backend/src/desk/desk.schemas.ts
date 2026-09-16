import { z } from 'zod';
import { isValidIban, normalizeIban } from '../payments/iban.js';

const localizedPair = {
  nameEn: z.string().trim().min(1).max(80),
  nameFa: z.string().trim().min(1).max(80),
};

const clock = z.string().regex(/^\d{2}:\d{2}$/);
const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const listAppointmentsQuerySchema = z.object({
  date: ymd.optional(),
  from: ymd.optional(),
  to: ymd.optional(),
  barberId: z.string().min(1).optional(),
  status: z
    .enum(['pending_payment', 'booked', 'completed', 'cancelled', 'no_show'])
    .optional(),
  q: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(24).optional(),
});

export const walkInSchema = z
  .object({
    serviceId: z.string().min(1),
    barberId: z.string().min(1),
    customerName: z.string().trim().min(2).max(80),
    customerPhone: z.string().trim().min(8).max(24),
    when: z.enum(['now', 'next']).optional(),
    date: ymd.optional(),
    time: clock.optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine(
    (value) =>
      value.when === 'now' ||
      value.when === 'next' ||
      Boolean(value.date && value.time),
    { message: 'Pick now, next, or a date and time' },
  );

export const updateAppointmentSchema = z
  .object({
    status: z
      .enum(['booked', 'completed', 'cancelled', 'no_show'])
      .optional(),
    notes: z.string().trim().max(500).nullable().optional(),
  })
  .refine(
    (value) => value.status !== undefined || value.notes !== undefined,
    { message: 'Nothing to update' },
  );

export const upsertBarberSchema = z.object({
  ...localizedPair,
  titleEn: z.string().trim().min(1).max(80),
  titleFa: z.string().trim().min(1).max(80),
  bioEn: z.string().trim().min(1).max(500),
  bioFa: z.string().trim().min(1).max(500),
  sortOrder: z.number().int().min(0).max(999).optional(),
  active: z.boolean().optional(),
});

export const patchBarberSchema = upsertBarberSchema.partial();

export const upsertServiceSchema = z.object({
  ...localizedPair,
  durationMin: z.number().int().min(5).max(300),
  priceToman: z.number().int().min(0).max(100_000_000),
  sortOrder: z.number().int().min(0).max(999).optional(),
  active: z.boolean().optional(),
});

export const patchServiceSchema = upsertServiceSchema.partial();

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(50),
});

export const hoursDaySchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    closed: z.boolean(),
    opensAt: clock.nullable(),
    closesAt: clock.nullable(),
  })
  .refine(
    (day) =>
      day.closed ||
      (day.opensAt !== null &&
        day.closesAt !== null &&
        day.opensAt < day.closesAt),
    { message: 'Open days need opensAt before closesAt' },
  );

export const replaceHoursSchema = z
  .object({
    days: z.array(hoursDaySchema).length(7),
  })
  .refine(
    (value) => new Set(value.days.map((day) => day.weekday)).size === 7,
    { message: 'Send every weekday from 0 to 6' },
  );

export const patchShopSchema = z.object({
  published: z.boolean().optional(),
  nameEn: z.string().trim().min(1).max(80).optional(),
  nameFa: z.string().trim().min(1).max(80).optional(),
  taglineEn: z.string().trim().min(1).max(160).optional(),
  taglineFa: z.string().trim().min(1).max(160).optional(),
  descriptionEn: z.string().trim().min(1).max(2000).optional(),
  descriptionFa: z.string().trim().min(1).max(2000).optional(),
  neighborhoodEn: z.string().trim().min(1).max(80).optional(),
  neighborhoodFa: z.string().trim().min(1).max(80).optional(),
  cityEn: z.string().trim().min(1).max(80).optional(),
  cityFa: z.string().trim().min(1).max(80).optional(),
  addressEn: z.string().trim().min(1).max(240).optional(),
  addressFa: z.string().trim().min(1).max(240).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  photoUrl: z.string().trim().min(8).max(500).optional(),
  iban: z
    .union([
      z.null(),
      z
        .string()
        .trim()
        .transform((value) => (value === "" ? null : normalizeIban(value))),
    ])
    .refine((value) => value === null || isValidIban(value), {
      message: "IBAN must be IR plus 24 digits",
    })
    .optional(),
});

export const createTimeOffSchema = z
  .object({
    startsAt: z.iso.datetime(),
    endsAt: z.iso.datetime(),
    reason: z.string().trim().max(160).nullable().optional(),
  })
  .refine((value) => new Date(value.startsAt) < new Date(value.endsAt), {
    message: 'endsAt must be after startsAt',
  });

export const insightsQuerySchema = z.object({
  range: z.enum(['7d']).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
export type WalkInBody = z.infer<typeof walkInSchema>;
export type UpdateAppointmentBody = z.infer<typeof updateAppointmentSchema>;
export type UpsertBarberBody = z.infer<typeof upsertBarberSchema>;
export type PatchBarberBody = z.infer<typeof patchBarberSchema>;
export type UpsertServiceBody = z.infer<typeof upsertServiceSchema>;
export type PatchServiceBody = z.infer<typeof patchServiceSchema>;
export type ReorderBody = z.infer<typeof reorderSchema>;
export type ReplaceHoursBody = z.infer<typeof replaceHoursSchema>;
export type PatchShopBody = z.infer<typeof patchShopSchema>;
export type CreateTimeOffBody = z.infer<typeof createTimeOffSchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>;
