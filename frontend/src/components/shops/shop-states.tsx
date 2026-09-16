import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries";

type ShopStateProps = {
  dictionary: Dictionary["shops"];
  onRetryHref?: string;
};

export function ShopsEmpty({ dictionary }: ShopStateProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-24 sm:px-8">
      <p className="text-xs font-medium text-muted-foreground">{dictionary.emptyEyebrow}</p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        {dictionary.emptyTitle}
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
        {dictionary.emptyBody}
      </p>
    </section>
  );
}

export function ShopsUnavailable({ dictionary, onRetryHref }: ShopStateProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-24 sm:px-8">
      <p className="text-xs font-medium text-muted-foreground">{dictionary.unavailableEyebrow}</p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
        {dictionary.unavailableTitle}
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
        {dictionary.unavailableBody}
      </p>
      {onRetryHref ? (
        <div className="mt-8">
          <Button asChild size="lg">
            <a href={onRetryHref}>{dictionary.retry}</a>
          </Button>
        </div>
      ) : null}
    </section>
  );
}
