import type { AppointmentDto } from '../appointments/appointments.types.js';

export type PaymentRequestDto = {
  redirectUrl: string;
  authority: string;
  appointmentCode: string;
};

export type PaymentDto = {
  status: 'requested' | 'paid' | 'failed' | 'cancelled';
  amount: number;
  refId: string | null;
};

export type PaymentVerifyDto = {
  ok: boolean;
  reason?: 'cancelled' | 'failed';
  shopSlug?: string;
  appointment?: AppointmentDto;
  payment?: PaymentDto;
};
