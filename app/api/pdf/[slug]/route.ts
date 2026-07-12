import { NextRequest } from "next/server";
import { z } from "zod";
import { getTemplateBySlug } from "@/lib/queries/templates";
import { renderPdf } from "@/lib/pdf/render";

/**
 * Draft-PDF download (file downloads need a URL, hence a Route Handler).
 * The PDF is rendered from the /print page — the same component as the live
 * preview. Current phase: watermarked draft, no payment gate yet; the paid,
 * clean-PDF path will be gated by canDownload (access-control skill) once
 * orders exist (spec §8).
 */

export const dynamic = "force-dynamic";

const querySchema = z.object({
  d: z.string().max(8_000).optional(), // URL-encoded JSON: { values, colorKey }
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) return new Response("template not found", { status: 404 });

  const parsed = querySchema.safeParse({
    d: req.nextUrl.searchParams.get("d") ?? undefined,
  });
  if (!parsed.success) return new Response("bad request", { status: 400 });

  const printUrl = new URL(`/print/${slug}`, req.nextUrl.origin);
  if (parsed.data.d) printUrl.searchParams.set("d", parsed.data.d);

  try {
    const pdf = await renderPdf({
      printUrl: printUrl.toString(),
      pageSize: template.schema.layout.pageSize,
    });
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(template.title)}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("pdf render failed:", err instanceof Error ? err.message : err);
    return new Response("יצירת ה-PDF נכשלה, נסו שוב", { status: 500 });
  }
}
