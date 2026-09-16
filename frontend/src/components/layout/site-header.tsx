import Link from "next/link";
import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#for-salons", label: "For salons" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          Kadoos
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm">
          <Link href="/#how-it-works">Book an appointment</Link>
        </Button>
      </div>
      <nav className="flex items-center gap-5 border-t border-border/70 px-6 py-3 text-sm text-muted-foreground sm:hidden">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
