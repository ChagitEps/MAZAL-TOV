import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTemplates, getTemplateBySlug } from "@/lib/queries/templates";
import { formatAgorot } from "@/lib/utils";
import { DocumentPreview } from "@/components/DocumentPreview";

/**
 * Auto landing page per template (spec §9): /wedding, /bar-mitzvah, …
 * Generated entirely from the template JSON — hundreds of SEO pages, zero
 * manual work. The hero shows the template rendered with its default wording.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const templates = await getAllTemplates();
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTemplateBySlug(slug);
  if (!t) return {};
  const title = `${t.title} מעוצבת אונליין תוך דקות | מזל טוב AI`;
  const description = `${t.description ?? t.title} עיצוב מקצועי בעברית, תצוגה חיה והורדת PDF באיכות דפוס — ${formatAgorot(t.basePriceAgorot)} בלבד, ללא צורך בהרשמה.`;
  return {
    title,
    description,
    openGraph: { title, description, locale: "he_IL", type: "website" },
  };
}

export default async function TemplateLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) notFound();

  const colorSet = template.schema.colorSets[0];
  const steps = [
    "ממלאים את הפרטים בטופס פשוט",
    "ה-AI משפר את הנוסח (בקרוב)",
    "בוחרים ערכת צבעים",
    "מורידים PDF מוכן לדפוס",
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <section className="text-start">
          <h1 className="text-4xl font-bold leading-tight">{template.title} בעיצוב מקצועי — בתוך דקות</h1>
          {template.description && (
            <p className="mt-4 text-lg text-gray-600">{template.description}</p>
          )}
          <ol className="mt-6 flex flex-col gap-2 text-sm text-gray-700">
            {steps.map((s, i) => (
              <li key={s}>
                <span className="font-bold text-brand">{i + 1}.</span> {s}
              </li>
            ))}
          </ol>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href={`/create/${template.slug}`}
              className="rounded-xl bg-brand px-8 py-3 font-medium text-brand-fg shadow-sm transition hover:opacity-90"
            >
              יצירת {template.title} עכשיו
            </Link>
            <span className="text-sm text-gray-500">{formatAgorot(template.basePriceAgorot)} · ללא הרשמה</span>
          </div>
        </section>

        <section aria-label="דוגמה" className="mx-auto w-full max-w-sm">
          <DocumentPreview schema={template.schema} values={{}} colorSet={colorSet} />
        </section>
      </div>
    </main>
  );
}
