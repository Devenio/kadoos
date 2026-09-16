import { Suspense } from "react";
import { SystemStatus } from "@/components/system-status";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-display text-lg text-foreground">Kadoos</p>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:items-end">
          <p>Appointment booking for beauty salons.</p>
          <Suspense fallback={<StatusFallback />}>
            <SystemStatus />
          </Suspense>
        </div>
      </div>
    </footer>
  );
}

function StatusFallback() {
  return (
    <span className="inline-block h-4 w-36 animate-pulse rounded-sm bg-muted" />
  );
}
