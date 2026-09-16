import type { Appointment } from "@/types/booking";
import { appointmentSchema } from "@/types/booking";

const key = "kadoos-bookings";

export function rememberedBookings(): Appointment[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.flatMap((item) => {
      const result = appointmentSchema.safeParse(item);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

export function rememberBooking(appointment: Appointment): void {
  const next = [
    appointment,
    ...rememberedBookings().filter((item) => item.id !== appointment.id),
  ].slice(0, 8);
  window.localStorage.setItem(key, JSON.stringify(next));
}

export function rememberMany(appointments: Appointment[]): void {
  for (const appointment of appointments) {
    rememberBooking(appointment);
  }
}
