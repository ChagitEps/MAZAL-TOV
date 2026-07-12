import "server-only";
import puppeteer, { type Browser } from "puppeteer";

/**
 * PDF rendering (spec §13): Puppeteer opens the /print page — the SAME
 * DocumentPreview component the user saw — and rasterizes it at true page size.
 * Preview and file are one rendering; they cannot drift (spec §12).
 *
 * Current phase: called from the draft-download route. When payments land, the
 * paid path will call this after the Grow webhook and store the file via
 * lib/supabase/admin (see the access-control skill).
 */

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--font-render-hinting=none"],
    });
  }
  return browserPromise;
}

export interface RenderPdfInput {
  /** Absolute URL of the /print page to rasterize (same origin as the app). */
  printUrl: string;
  pageSize: "A5" | "A4";
}

export async function renderPdf({ printUrl, pageSize }: RenderPdfInput): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.goto(printUrl, { waitUntil: "networkidle0", timeout: 30_000 });
    // Ensure the self-hosted Hebrew fonts are ready before rasterizing.
    await page.evaluateHandle("document.fonts.ready");
    return await page.pdf({
      format: pageSize,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await page.close();
  }
}
