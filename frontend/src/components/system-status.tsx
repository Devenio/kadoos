import { getHealth } from "@/lib/api/health";

type SystemStatusProps = {
  available: string;
  unavailable: string;
};

export async function SystemStatus({
  available,
  unavailable,
}: SystemStatusProps) {
  const health = await getHealth().catch(() => null);

  if (!health || health.status !== "ok") {
    return <p className="text-sm text-muted-foreground">{unavailable}</p>;
  }

  return <p className="text-sm text-muted-foreground">{available}</p>;
}
