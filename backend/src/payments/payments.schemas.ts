import { z } from 'zod';
import { createAppointmentSchema } from '../appointments/appointments.schemas.js';

export const requestPaymentSchema = createAppointmentSchema.extend({
  slug: z.string().min(1),
  locale: z.enum(['en', 'fa']).default('en'),
});

export const verifyPaymentSchema = z.object({
  status: z.string().trim().min(1).max(32),
  authority: z.string().trim().min(8).max(64),
});

export type RequestPaymentBody = z.infer<typeof requestPaymentSchema>;
export type VerifyPaymentBody = z.infer<typeof verifyPaymentSchema>;
