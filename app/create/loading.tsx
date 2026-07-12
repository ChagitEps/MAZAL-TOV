export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mx-auto h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </main>
  );
}
