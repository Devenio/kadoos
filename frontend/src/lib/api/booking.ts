import { apiClient } from "@/lib/api/client";
import {
  appointmentSchema,
  availabilityDaySchema,
  deskUserSchema,
  type Appointment,
  type AvailabilityDay,
  type DeskUser,
} from "@/types/booking";
import { z } from "zod";

const browserApi = { baseUrl: "/api" } as const;

export async function getAvailability(
  slug: string,
  serviceId: string,
  barberId?: string,
): Promise<AvailabilityDay[]> {
  const query = new URLSearchParams({ serviceId });
  if (barberId) {
    query.set("barberId", barberId);
  }
  const data = await apiClient<AvailabilityDay[]>(
    `/shops/${slug}/availability?${query.toString()}`,
    { cache: "no-store", signal: AbortSignal.timeout(5000), ...browserApi },
  );
  return z.array(availabilityDaySchema).parse(data);
}

export async function requestZarinpalPayment(
  slug: string,
  body: {
    serviceId: string;
    barberId?: string;
    date: string;
    time: string;
    customerName: string;
    customerPhone: string;
    locale: "en" | "fa";
  },
): Promise<{ redirectUrl: string; authority: string; appointmentCode: string }> {
  const data = await apiClient<{
    redirectUrl: string;
    authority: string;
    appointmentCode: string;
  }>("/payments/zarinpal/request", {
    method: "POST",
    body: { ...body, slug },
    ...browserApi,
  });
  return z
    .object({
      redirectUrl: z.string().min(1),
      authority: z.string().min(1),
      appointmentCode: z.string().min(1),
    })
    .parse(data);
}

export async function verifyZarinpalPayment(
  status: string,
  authority: string,
): Promise<{
  ok: boolean;
  reason?: "cancelled" | "failed";
  shopSlug?: string;
  appointment?: Appointment;
}> {
  const data = await apiClient<unknown>("/payments/zarinpal/verify", {
    method: "POST",
    body: { status, authority },
    ...browserApi,
  });
  const parsed = z
    .object({
      ok: z.boolean(),
      reason: z.enum(["cancelled", "failed"]).optional(),
      shopSlug: z.string().optional(),
      appointment: appointmentSchema.optional(),
    })
    .parse(data);
  return parsed;
}

export async function lookupBookings(
  phone: string,
  code?: string,
): Promise<Appointment[]> {
  const query = new URLSearchParams({ phone });
  if (code) {
    query.set("code", code);
  }
  const data = await apiClient<Appointment | Appointment[]>(
    `/bookings?${query.toString()}`,
    { cache: "no-store", ...browserApi },
  );
  if (Array.isArray(data)) {
    return z.array(appointmentSchema).parse(data);
  }
  return [appointmentSchema.parse(data)];
}

export async function lookupAppointment(
  code: string,
  phone: string,
): Promise<Appointment> {
  const [booking] = await lookupBookings(phone, code);
  if (!booking) {
    throw new Error("Booking not found");
  }
  return booking;
}

export async function cancelAppointment(
  code: string,
  phone: string,
): Promise<Appointment> {
  const data = await apiClient<Appointment>("/bookings/cancel", {
    method: "POST",
    body: { code, phone },
    ...browserApi,
  });
  return appointmentSchema.parse(data);
}

export async function deskLogin(email: string, password: string): Promise<DeskUser> {
  const data = await apiClient<DeskUser>("/auth/login", {
    method: "POST",
    body: { email, password },
    credentials: "include",
    ...browserApi,
  });
  return deskUserSchema.parse(data);
}

export async function deskLogout(): Promise<void> {
  await apiClient("/auth/logout", { method: "POST", credentials: "include", ...browserApi });
}

export async function deskMe(): Promise<DeskUser | null> {
  try {
    const data = await apiClient<DeskUser>("/auth/me", {
      credentials: "include",
      cache: "no-store",
      ...browserApi,
    });
    return deskUserSchema.parse(data);
  } catch {
    return null;
  }
}

export async function deskAppointments(
  date: string,
  phone?: string,
): Promise<Appointment[]> {
  const query = new URLSearchParams({ date });
  if (phone) {
    query.set("phone", phone);
  }
  const data = await apiClient<Appointment[]>(
    `/desk/appointments?${query.toString()}`,
    { credentials: "include", cache: "no-store", ...browserApi },
  );
  return z.array(appointmentSchema).parse(data);
}

export async function deskUpdateAppointment(
  id: string,
  status: Appointment["status"],
): Promise<Appointment> {
  const data = await apiClient<Appointment>(`/desk/appointments/${id}`, {
    method: "PATCH",
    body: { status },
    credentials: "include",
    ...browserApi,
  });
  return appointmentSchema.parse(data);
}
