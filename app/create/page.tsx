import Image from "next/image";
import Link from "next/link";
import { getAllTemplates } from "@/lib/queries/templates";
import { formatAgorot } from "@/lib/utils";

export const metadata = { title: "בחירת מסמך | מזל טוב AI" };

// Launch categories (spec §6) — display order matters: events first, then work.
const CATEGORIES: { slug: string; title: string }[] = [
  { slug: "events", title: "אירועים" },
  { slug: "work", title: "עבודה" },
];

// Catalog page (spec §3 step 1) — Server Component, templates from the query layer.
// Each card shows the template's thumbnail (user-provided image in
// public/templates/<slug>.jpg); until one exists, a soft gradient placeholder
// derived from the template's first color set keeps the catalog polished.
export default async function CreatePage() {
  const templates = await getAllTemplates();
  const groups = CATEGORIES.map((c) => ({
    ...c,
    templates: templates.filter((t) => t.categoryId === c.slug),
  })).filter((g) => g.templates.length > 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-center">איזה מסמך ניצור היום?</h1>
      <p className="mt-2 text-center text-gray-600">
        בוחרים תבנית, ממלאים פרטים — ורואים את המסמך נבנה מול העיניים.
      </p>
      <p className="mt-3 text-center text-sm">
        <Link href="/my-documents" className="text-brand hover:underline">
          📄 המסמכים שלי — המשך מאיפה שעצרת
        </Link>
      </p>

      {groups.map((group) => (
        <section key={group.slug} className="mt-10">
          <h2 className="text-xl font-bold">{group.title}</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {group.templates.map((t) => {
          const cs = t.schema.colorSets[0];
          return (
            <Link
              key={t.slug}
              href={`/create/${t.slug}`}
              className="group overflow-hidden rounded-2xl border text-start transition hover:border-brand hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {t.thumbnail ? (
                  <Image
                    src={t.thumbnail}
                    alt={t.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${cs.bg} 0%, ${cs.accent}33 60%, ${cs.accent}66 100%)`,
                    }}
                  >
                    <span
                      className="px-4 text-center text-xl font-bold"
                      style={{ color: cs.accent }}
                    >
                      {t.title}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold group-hover:text-brand">{t.title}</h2>
                {t.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{t.description}</p>
                )}
                <div className="mt-3 text-sm font-medium text-brand">
                  {formatAgorot(t.basePriceAgorot)}
                </div>
              </div>
            </Link>
          );
        })}
          </div>
        </section>
      ))}
    </main>
  );
}
