import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllTemplates, getTemplateBySlug } from "@/lib/queries/templates";
import { GeneratorClient } from "@/components/GeneratorClient";

// The generator page (spec §3): server loads the template, client renders live.
// All template slugs are known at build time (seed files) — unknown slugs 404.
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
  const template = await getTemplateBySlug(slug);
  if (!template) return { title: "מזל טוב AI" };
  return {
    title: `${template.title} | מזל טוב AI`,
    description: template.description,
  };
}

export default async function GeneratorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-gray-500">
        <Link href="/create" className="hover:text-brand hover:underline">
          כל התבניות
        </Link>
        <span className="mx-2">‹</span>
        <span>{template.title}</span>
      </nav>
      <h1 className="mt-2 text-2xl font-bold">{template.title}</h1>
      <div className="mt-6">
        <GeneratorClient template={template} />
      </div>
    </main>
  );
}
