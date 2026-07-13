import { notFound } from "next/navigation";
import { getTemplateBySlug } from "@/lib/queries/templates";
import { DocumentPreview } from "@/components/DocumentPreview";

/**
 * The print surface — the EXACT page Puppeteer rasterizes to PDF (spec §12–13).
 * Renders the same DocumentPreview as the live preview, at true page size.
 * Values arrive URL-encoded in ?d= (JSON). Until payment lands (spec §8), every
 * PDF carries a draft watermark; the paid path will render without it.
 */

export const metadata = { robots: { index: false, follow: false } };

interface PrintData {
  values: Record<string, string>;
  colorKey: string;
  font?: string;
  background?: string;
  spacing?: string;
  styles?: Record<string, { sizeDelta?: number }>;
}

export default async function PrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ d?: string }>;
}) {
  const { slug } = await params;
  const { d } = await searchParams;
  const template = await getTemplateBySlug(slug);
  if (!template) notFound();

  let data: PrintData = { values: {}, colorKey: template.schema.colorSets[0].key };
  if (d) {
    try {
      data = { ...data, ...(JSON.parse(d) as PrintData) };
    } catch {
      // malformed payload — fall back to template defaults
    }
  }

  const colorSet =
    template.schema.colorSets.find((c) => c.key === data.colorKey) ??
    template.schema.colorSets[0];

  return (
    <div className="relative" style={{ width: "fit-content" }}>
      <DocumentPreview
        schema={template.schema}
        values={data.values}
        colorSet={colorSet}
        font={data.font}
        background={data.background}
        spacing={data.spacing}
        styles={data.styles}
        print
      />
      {/* draft watermark — removed on the paid path (spec §8) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className="select-none text-4xl font-bold opacity-10"
          style={{ transform: "rotate(-30deg)", color: colorSet.fg }}
        >
          טיוטה · מזל טוב AI
        </span>
      </div>
    </div>
  );
}
