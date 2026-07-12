import Link from "next/link";

export const metadata = { title: "בחירת מסמך | מזל טוב AI" };

// Placeholder for the generator entry (spec §3). Once templates are seeded,
// this Server Component lists them from the DB (see lib/queries/templates.ts).
export default function CreatePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">בחירת סוג מסמך</h1>
      <p className="mt-4 text-gray-600">
        המחולל בבנייה. כאן תוצג רשימת התבניות מתוך מסד הנתונים, וממנה נעבור למילוי הטופס.
      </p>
      <Link href="/" className="mt-8 inline-block text-brand hover:underline">
        ← חזרה לדף הבית
      </Link>
    </main>
  );
}
