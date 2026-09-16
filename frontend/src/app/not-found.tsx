import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-24 sm:px-8">
      <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
        Page not found
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        This page does not exist.
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
        The address may be incorrect, or the page may have been moved.
      </p>
      <div className="mt-8">
        <Button asChild size="lg">
          <Link href="/">Back to Kadoos</Link>
        </Button>
      </div>
    </section>
  );
}
