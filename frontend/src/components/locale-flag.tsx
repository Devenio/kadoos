import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

type LocaleFlagProps = {
  locale: Locale;
  className?: string;
  shape?: "rect" | "round";
};

export function LocaleFlag({
  locale,
  className,
  shape = "rect",
}: LocaleFlagProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]",
        shape === "round"
          ? "size-5 rounded-full"
          : "h-4 w-6 rounded-[3px]",
        className,
      )}
      aria-hidden
    >
      {locale === "fa" ? <IranFlag /> : <UnitedKingdomFlag />}
      <span className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/25 to-transparent" />
    </span>
  );
}

function IranFlag() {
  return (
    <svg viewBox="0 0 21 15" className="size-full" preserveAspectRatio="none">
      <rect width="21" height="5" fill="#239f40" />
      <rect y="5" width="21" height="5" fill="#fff" />
      <rect y="10" width="21" height="5" fill="#da0000" />
      <line
        x1="1"
        y1="4.55"
        x2="20"
        y2="4.55"
        stroke="#fff"
        strokeWidth="0.7"
        strokeDasharray="0.85 0.95"
      />
      <line
        x1="1"
        y1="10.45"
        x2="20"
        y2="10.45"
        stroke="#fff"
        strokeWidth="0.7"
        strokeDasharray="0.85 0.95"
      />
      <path
        fill="#da0000"
        d="M10.5 6.05c.78 0 1.32.42 1.48.95H9.02c.16-.53.7-.95 1.48-.95Zm0 2.9c-.78 0-1.32-.42-1.48-.95h2.96c-.16.53-.7.95-1.48.95Z"
      />
      <circle cx="10.5" cy="7.5" r="0.55" fill="#da0000" />
    </svg>
  );
}

function UnitedKingdomFlag() {
  return (
    <svg viewBox="0 0 60 30" className="size-full" preserveAspectRatio="none">
      <rect width="60" height="30" fill="#012169" />
      <path stroke="#fff" strokeWidth="10" d="M0 0l60 30M60 0L0 30" />
      <path stroke="#c8102e" strokeWidth="4" d="M0 0l60 30M60 0L0 30" />
      <path fill="#fff" d="M25 0h10v30H25zM0 10h60v10H0z" />
      <path fill="#c8102e" d="M27 0h6v30h-6zM0 12h60v6H0z" />
    </svg>
  );
}
