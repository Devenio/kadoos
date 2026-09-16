import { z } from "zod";
import { apiClient } from "@/lib/api/client";

export const healthResponseSchema = z.object({
  status: z.enum(["ok", "error"]),
  database: z.enum(["connected", "disconnected"]),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export async function getHealth(): Promise<HealthResponse> {
  const data = await apiClient<HealthResponse>("/health", {
    cache: "no-store",
    signal: AbortSignal.timeout(2500),
  });

  return healthResponseSchema.parse(data);
}
