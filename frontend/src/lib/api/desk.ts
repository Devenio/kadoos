import { apiClient } from "@/lib/api/client";
import { appointmentSchema, deskUserSchema, type Appointment, type DeskUser } from "@/types/booking";
import {
  deskBarberSchema,
  deskHoursPreviewSchema,
  deskInsightsSchema,
  deskPayoutsSchema,
  deskServiceSchema,
  deskShopSchema,
  deskTimeOffSchema,
  type DeskBarber,
  type DeskHoursPreview,
  type DeskInsights,
  type DeskPayouts,
  type DeskService,
  type DeskShop,
  type DeskTimeOff,
} from "@/types/desk";
import { z } from "zod";

const browserApi = { baseUrl: "/api", credentials: "include" as const };

export async function deskLogin(email: string, password: string): Promise<DeskUser> {
  const data = await apiClient<DeskUser>("/auth/login", {
    method: "POST",
    body: { email, password },
    ...browserApi,
  });
  return deskUserSchema.parse(data);
}

export async function deskLogout(): Promise<void> {
  await apiClient("/auth/logout", { method: "POST", ...browserApi });
}

export async function deskMe(): Promise<DeskUser | null> {
  try {
    const data = await apiClient<DeskUser>("/auth/me", {
      cache: "no-store",
      ...browserApi,
    });
    return deskUserSchema.parse(data);
  } catch {
    return null;
  }
}

export async function deskChangePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiClient("/auth/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
    ...browserApi,
  });
}

export type DeskAppointmentQuery = {
  date?: string;
  from?: string;
  to?: string;
  barberId?: string;
  status?: Appointment["status"];
  q?: string;
};

export async function deskAppointments(
  query: DeskAppointmentQuery = {},
): Promise<Appointment[]> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value);
    }
  }
  const suffix = params.size ? `?${params.toString()}` : "";
  const data = await apiClient<Appointment[]>(`/desk/appointments${suffix}`, {
    cache: "no-store",
    ...browserApi,
  });
  return z.array(appointmentSchema).parse(data);
}

export async function deskAppointment(id: string): Promise<Appointment> {
  const data = await apiClient<Appointment>(`/desk/appointments/${id}`, {
    cache: "no-store",
    ...browserApi,
  });
  return appointmentSchema.parse(data);
}

export async function deskUpdateAppointment(
  id: string,
  body: { status?: Appointment["status"]; notes?: string | null },
): Promise<Appointment> {
  const data = await apiClient<Appointment>(`/desk/appointments/${id}`, {
    method: "PATCH",
    body,
    ...browserApi,
  });
  return appointmentSchema.parse(data);
}

export async function deskWalkIn(body: {
  serviceId: string;
  barberId: string;
  customerName: string;
  customerPhone: string;
  when?: "now" | "next";
  date?: string;
  time?: string;
  notes?: string;
}): Promise<Appointment> {
  const data = await apiClient<Appointment>("/desk/appointments/walk-in", {
    method: "POST",
    body,
    ...browserApi,
  });
  return appointmentSchema.parse(data);
}

export async function deskBarbers(): Promise<DeskBarber[]> {
  const data = await apiClient<DeskBarber[]>("/desk/barbers", {
    cache: "no-store",
    ...browserApi,
  });
  return z.array(deskBarberSchema).parse(data);
}

export async function deskCreateBarber(body: unknown): Promise<DeskBarber> {
  const data = await apiClient<DeskBarber>("/desk/barbers", {
    method: "POST",
    body,
    ...browserApi,
  });
  return deskBarberSchema.parse(data);
}

export async function deskUpdateBarber(id: string, body: unknown): Promise<DeskBarber> {
  const data = await apiClient<DeskBarber>(`/desk/barbers/${id}`, {
    method: "PATCH",
    body,
    ...browserApi,
  });
  return deskBarberSchema.parse(data);
}

export async function deskReorderBarbers(ids: string[]): Promise<DeskBarber[]> {
  const data = await apiClient<DeskBarber[]>("/desk/barbers/reorder", {
    method: "POST",
    body: { ids },
    ...browserApi,
  });
  return z.array(deskBarberSchema).parse(data);
}

export async function deskServices(): Promise<DeskService[]> {
  const data = await apiClient<DeskService[]>("/desk/services", {
    cache: "no-store",
    ...browserApi,
  });
  return z.array(deskServiceSchema).parse(data);
}

export async function deskCreateService(body: unknown): Promise<DeskService> {
  const data = await apiClient<DeskService>("/desk/services", {
    method: "POST",
    body,
    ...browserApi,
  });
  return deskServiceSchema.parse(data);
}

export async function deskUpdateService(id: string, body: unknown): Promise<DeskService> {
  const data = await apiClient<DeskService>(`/desk/services/${id}`, {
    method: "PATCH",
    body,
    ...browserApi,
  });
  return deskServiceSchema.parse(data);
}

export async function deskReorderServices(ids: string[]): Promise<DeskService[]> {
  const data = await apiClient<DeskService[]>("/desk/services/reorder", {
    method: "POST",
    body: { ids },
    ...browserApi,
  });
  return z.array(deskServiceSchema).parse(data);
}

export async function deskHours(): Promise<DeskHoursPreview> {
  const data = await apiClient<DeskHoursPreview>("/desk/hours", {
    cache: "no-store",
    ...browserApi,
  });
  return deskHoursPreviewSchema.parse(data);
}

export async function deskReplaceHours(
  days: DeskHoursPreview["hours"],
): Promise<DeskHoursPreview> {
  const data = await apiClient<DeskHoursPreview>("/desk/hours", {
    method: "PUT",
    body: { days },
    ...browserApi,
  });
  return deskHoursPreviewSchema.parse(data);
}

export async function deskShop(): Promise<DeskShop> {
  const data = await apiClient<DeskShop>("/desk/shop", {
    cache: "no-store",
    ...browserApi,
  });
  return deskShopSchema.parse(data);
}

export async function deskUpdateShop(body: unknown): Promise<DeskShop> {
  const data = await apiClient<DeskShop>("/desk/shop", {
    method: "PATCH",
    body,
    ...browserApi,
  });
  return deskShopSchema.parse(data);
}

export async function deskTimeOff(barberId: string): Promise<DeskTimeOff[]> {
  const data = await apiClient<DeskTimeOff[]>(`/desk/barbers/${barberId}/time-off`, {
    cache: "no-store",
    ...browserApi,
  });
  return z.array(deskTimeOffSchema).parse(data);
}

export async function deskCreateTimeOff(
  barberId: string,
  body: { startsAt: string; endsAt: string; reason?: string | null },
): Promise<DeskTimeOff> {
  const data = await apiClient<DeskTimeOff>(`/desk/barbers/${barberId}/time-off`, {
    method: "POST",
    body,
    ...browserApi,
  });
  return deskTimeOffSchema.parse(data);
}

export async function deskDeleteTimeOff(id: string): Promise<void> {
  await apiClient(`/desk/time-off/${id}`, { method: "DELETE", ...browserApi });
}

export async function deskPayouts(): Promise<DeskPayouts> {
  const data = await apiClient<DeskPayouts>("/desk/payouts", {
    cache: "no-store",
    ...browserApi,
  });
  return deskPayoutsSchema.parse(data);
}

export async function deskInsights(): Promise<DeskInsights> {
  const data = await apiClient<DeskInsights>("/desk/insights?range=7d", {
    cache: "no-store",
    ...browserApi,
  });
  return deskInsightsSchema.parse(data);
}
