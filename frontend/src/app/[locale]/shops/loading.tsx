export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 sm:px-8 sm:pt-24">
      <div className="h-3 w-28 animate-pulse rounded-sm bg-muted" />
      <div className="mt-4 h-12 w-full max-w-md animate-pulse rounded-sm bg-muted" />
      <div className="mt-5 h-5 w-full max-w-lg animate-pulse rounded-sm bg-muted" />
      <div className="mt-16 space-y-8">
        <div className="h-24 animate-pulse rounded-sm bg-muted" />
        <div className="h-24 animate-pulse rounded-sm bg-muted" />
        <div className="h-24 animate-pulse rounded-sm bg-muted" />
      </div>
    </div>
  );
}
