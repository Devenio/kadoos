"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-24 sm:px-8">
      <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
        Something went wrong
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        This page could not be loaded.
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
        Please try again. If the problem continues, come back in a moment.
      </p>
      <div className="mt-8">
        <Button onClick={reset} size="lg">
          Try again
        </Button>
      </div>
    </section>
  );
}
