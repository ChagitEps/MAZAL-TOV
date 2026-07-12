import Link from "next/link";
import { getAllTemplates } from "@/lib/queries/templates";
import { formatAgorot } from "@/lib/utils";

export const metadata = { title: "בחירת מסמך | מזל טוב AI" };

// Catalog page (spec §3 step 1) — Server Component, templates from the query layer.
export default async function CreatePage() {
  const templates = await getAllTemplates();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-center">איזה מסמך ניצור היום?</h1>
      <p className="mt-2 text-center text-gray-600">
        בוחרים תבנית, ממלאים פרטים — ורואים את המסמך נבנה מול העיניים.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {templates.map((t) => (
          <Link
            key={t.slug}
            href={`/create/${t.slug}`}
            className="group rounded-2xl border p-6 text-start transition hover:border-brand hover:shadow-md"
          >
            <h2 className="text-lg font-semibold group-hover:text-brand">{t.title}</h2>
            {t.description && (
              <p className="mt-1 text-sm text-gray-600">{t.description}</p>
            )}
            <div className="mt-4 text-sm font-medium text-brand">
              {formatAgorot(t.basePriceAgorot)}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
