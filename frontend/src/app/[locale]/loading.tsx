export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 sm:px-8 sm:pt-24">
      <div className="h-3 w-40 animate-pulse rounded-sm bg-muted" />
      <div className="mt-6 h-16 w-full max-w-xl animate-pulse rounded-sm bg-muted sm:h-20" />
      <div className="mt-4 h-16 w-full max-w-md animate-pulse rounded-sm bg-muted" />
      <div className="mt-6 h-5 w-full max-w-lg animate-pulse rounded-sm bg-muted" />
      <div className="mt-10 flex gap-3">
        <div className="h-11 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-11 w-40 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
