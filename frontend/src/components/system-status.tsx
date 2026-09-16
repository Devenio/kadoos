import { getHealth } from "@/lib/api/health";

export async function SystemStatus() {
  const health = await getHealth().catch(() => null);

  if (!health || health.status !== "ok") {
    return (
      <p className="text-sm text-muted-foreground">
        Booking is temporarily unavailable.
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">Appointments available.</p>
  );
}
