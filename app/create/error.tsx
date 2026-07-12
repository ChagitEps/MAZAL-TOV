"use client";

export default function CreateError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold">משהו השתבש בטעינת התבניות</h1>
      <p className="mt-2 text-gray-600">נסו שוב, ואם התקלה חוזרת — נשמח שתעדכנו אותנו.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-brand px-6 py-2 text-brand-fg"
      >
        ניסיון חוזר
      </button>
    </main>
  );
}
