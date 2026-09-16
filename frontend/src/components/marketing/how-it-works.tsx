const steps = [
  {
    number: "01",
    title: "Choose a salon",
    body: "Open a salon’s world — the services, the specialists, and the hours they keep.",
  },
  {
    number: "02",
    title: "Pick who and what",
    body: "Select a service and the specialist you trust. Duration and price are clear before you continue.",
  },
  {
    number: "03",
    title: "Reserve a time",
    body: "See real availability and book in a few taps. Reschedule later according to the salon’s rules.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-t border-border"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
        <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
          How it works
        </p>
        <h2 className="mt-4 max-w-xl font-display text-4xl tracking-tight text-foreground sm:text-5xl">
          Three quiet steps to the chair.
        </h2>
        <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-12">
          {steps.map((step) => (
            <li key={step.number} className="border-t border-border pt-6">
              <p className="font-display text-2xl text-muted-foreground">
                {step.number}
              </p>
              <h3 className="mt-4 text-base font-medium text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
