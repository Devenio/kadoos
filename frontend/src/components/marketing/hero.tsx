import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:pt-32">
      <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
        Salon appointment booking
      </p>
      <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
        Beauty, booked with care.
      </h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
        Find a salon, choose a specialist, and reserve a time that actually
        works — without the messages, the waiting, or the guesswork.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild size="xl">
          <Link href="/#how-it-works">
            Book an appointment
            <ArrowRightIcon />
          </Link>
        </Button>
        <Button asChild size="xl" variant="outline">
          <Link href="/#for-salons">For salon owners</Link>
        </Button>
      </div>
    </section>
  );
}
