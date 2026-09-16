export function KadoosLoader({
  label = "Loading",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        width={88}
        height={88}
        aria-hidden="true"
      >
        <style>{`
          .k-ring{fill:none;stroke:currentColor;stroke-width:1.25;opacity:.18}
          .k-chair{fill:none;stroke:currentColor;stroke-width:2.25;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:180;stroke-dashoffset:180;animation:k-draw 1.6s ease-in-out infinite alternate,k-breathe 1.6s ease-in-out infinite;transform-origin:60px 60px}
          .k-dot{fill:currentColor;opacity:0;animation:k-dot 1.6s ease-in-out infinite}
          @keyframes k-draw{0%{stroke-dashoffset:180;opacity:.35}55%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:1}}
          @keyframes k-breathe{0%,100%{transform:scale(.96)}50%{transform:scale(1)}}
          @keyframes k-dot{0%,40%{opacity:0}70%,100%{opacity:.9}}
          @media (prefers-reduced-motion:reduce){.k-chair,.k-dot{animation:none;stroke-dashoffset:0;opacity:1}}
        `}</style>
        <circle className="k-ring" cx="60" cy="60" r="46" />
        <g transform="translate(28,24)">
          <path
            className="k-chair"
            d="M18 28V12c0-5 5-9 13-9h5c8 0 13 4 13 9v5h-7v-4c0-2-2-4-6-4s-6 2-6 4V28H14c-3 0-5 2-5 4.5V36H16M36 28h8c3 0 5 2 5 4.5V36H40M16 28H40M25 33V48M12 52H44c2 0 3.5 1.2 3.5 2.8 0 1.2-1.2 2.2-3.5 2.2H12c-2.3 0-3.5-1-3.5-2.2C8.5 53.2 10 52 12 52Z"
          />
        </g>
        <circle className="k-dot" cx="60" cy="98" r="2.5" />
      </svg>
      <span className="font-display text-sm tracking-[0.22em] uppercase text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
