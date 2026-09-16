import { z } from 'zod';

export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1),
  barberId: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().trim().min(2).max(80),
  customerPhone: z.string().trim().min(8).max(24),
});

export const lookupBookingSchema = z.object({
  code: z.string().trim().max(12).optional(),
  phone: z.string().trim().min(8).max(24),
});

export const cancelBookingSchema = z.object({
  code: z.string().trim().min(4).max(12),
  phone: z.string().trim().min(8).max(24),
});

export type CreateAppointmentBody = z.infer<typeof createAppointmentSchema>;
export type LookupBookingInput = z.infer<typeof lookupBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
