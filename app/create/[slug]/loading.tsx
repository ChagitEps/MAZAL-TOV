export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 h-8 w-72 animate-pulse rounded bg-gray-200" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
        <div className="mx-auto w-full max-w-md animate-pulse rounded-sm bg-gray-100"
          style={{ aspectRatio: "148 / 210" }}
        />
      </div>
    </main>
  );
}
