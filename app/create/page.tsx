import Link from "next/link";
import { getAllTemplates } from "@/lib/queries/templates";
import { CatalogBrowser, type CatalogGroup } from "@/components/CatalogBrowser";

export const metadata = { title: "בחירת מסמך | מזל טוב AI" };

// Launch categories (spec §6) — display order matters: events first, then work.
const CATEGORIES: { slug: string; title: string }[] = [
  { slug: "events", title: "אירועים" },
  { slug: "work", title: "עבודה" },
];

// Catalog page (spec §3 step 1) — Server Component fetches templates; the
// client CatalogBrowser adds live search over titles and descriptions.
export default async function CreatePage() {
  const templates = await getAllTemplates();

  const groups: CatalogGroup[] = CATEGORIES.map((c) => ({
    ...c,
    cards: templates
      .filter((t) => t.categoryId === c.slug)
      .map((t) => ({
        slug: t.slug,
        title: t.title,
        description: t.description,
        thumbnail: t.thumbnail,
        priceAgorot: t.basePriceAgorot,
        bg: t.schema.colorSets[0].bg,
        accent: t.schema.colorSets[0].accent,
      })),
  })).filter((g) => g.cards.length > 0);

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

      <CatalogBrowser groups={groups} />
    </main>
  );
}
