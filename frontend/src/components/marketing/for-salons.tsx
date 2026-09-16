const capabilities = [
  "Salon profile and branding",
  "Specialists and services",
  "Working hours and blocked time",
  "Appointment calendar",
] as const;

export function ForSalons() {
  return (
    <section id="for-salons" className="scroll-mt-24 border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:items-end">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
            For salons
          </p>
          <h2 className="mt-4 max-w-xl font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            A quieter way to run the day.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
            Your hours, your team, your services, your calendar — in one place.
            Built for rooms that already have a point of view.
          </p>
        </div>
        <ul className="space-y-0 border-t border-border">
          {capabilities.map((item) => (
            <li
              key={item}
              className="border-b border-border py-4 text-sm text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
