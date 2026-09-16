import { z } from 'zod';

export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1),
  barberId: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().trim().min(2).max(80),
  customerPhone: z.string().trim().min(10).max(16),
});

export const lookupBookingSchema = z.object({
  code: z.string().trim().min(4).max(12),
  phone: z.string().trim().min(10).max(16),
});

export const cancelBookingSchema = lookupBookingSchema;

export const updateAppointmentSchema = z.object({
  status: z.enum(['booked', 'completed', 'cancelled']),
});

export type CreateAppointmentBody = z.infer<typeof createAppointmentSchema>;
export type LookupBookingInput = z.infer<typeof lookupBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type UpdateAppointmentBody = z.infer<typeof updateAppointmentSchema>;
