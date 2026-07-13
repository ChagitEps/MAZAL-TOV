import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Template, TemplateSchema } from "@/lib/templates/types";

/**
 * Template reads (per the backend skill: reads live in lib/queries/<entity>.ts).
 *
 * TEMPORARY SOURCE: until a Supabase project is wired, templates load from the
 * local seed files in supabase/seed/templates/*.json. The public interface
 * (getAllTemplates / getTemplateBySlug) is the stable contract — when the DB
 * lands, only the internals of this file change; no component moves.
 */

const SEED_DIR = path.join(process.cwd(), "supabase", "seed", "templates");
const THUMB_DIR = path.join(process.cwd(), "public", "templates");
const THUMB_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

/** Auto-detect a card image: public/templates/<slug>.(png|jpg|jpeg|webp).
 *  Dropping a correctly-named file is enough — no JSON wiring needed. */
async function detectThumbnail(slug: string): Promise<string | null> {
  for (const ext of THUMB_EXTENSIONS) {
    try {
      await fs.access(path.join(THUMB_DIR, `${slug}.${ext}`));
      return `/templates/${slug}.${ext}`;
    } catch {
      // not this extension — keep looking
    }
  }
  return null;
}

/** Shape of a seed file (snake_case like the DB row it will become). */
interface SeedTemplate {
  slug: string;
  title: string;
  description?: string;
  category_slug: string;
  base_price_agorot: number;
  /** Public path of the catalog-card image, e.g. "/templates/wedding.jpg". */
  thumbnail?: string;
  schema: TemplateSchema;
}

let cache: Template[] | null = null;

async function loadAll(): Promise<Template[]> {
  // Cache only in production — in dev, template JSON edits must show immediately.
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = (await fs.readdir(SEED_DIR)).filter((f) => f.endsWith(".json"));
  const templates = await Promise.all(
    files.map(async (file) => {
      const raw = JSON.parse(await fs.readFile(path.join(SEED_DIR, file), "utf8")) as SeedTemplate;
      if (!raw.slug || !raw.schema?.fields?.length || !raw.schema?.colorSets?.length) {
        throw new Error(`Invalid template seed: ${file} — missing slug/fields/colorSets`);
      }
      return {
        id: raw.slug, // seed phase: slug doubles as id until DB rows exist
        categoryId: raw.category_slug,
        slug: raw.slug,
        title: raw.title,
        description: raw.description ?? null,
        thumbnail: raw.thumbnail ?? (await detectThumbnail(raw.slug)),
        schema: raw.schema,
        basePriceAgorot: raw.base_price_agorot,
        isActive: true,
      } satisfies Template;
    }),
  );
  cache = templates.sort((a, b) => a.title.localeCompare(b.title, "he"));
  return cache;
}

/** All active templates, for the catalog page (spec §3 step 1). */
export async function getAllTemplates(): Promise<Template[]> {
  return loadAll();
}

/** One template by its slug, or null (caller decides on notFound()). */
export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  const all = await loadAll();
  return all.find((t) => t.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------
// Background artwork (user request: real images the wording integrates into).
// Drop a file → it appears as a background option in the editor, zero wiring:
//   public/backgrounds/<slug>/*   — backgrounds for one template
//   public/backgrounds/shared/*   — backgrounds offered to every template
// ---------------------------------------------------------------------------

const BG_DIR = path.join(process.cwd(), "public", "backgrounds");
const BG_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "svg"]);

export interface BackgroundImage {
  /** Public URL under /backgrounds/ — also the stored background value. */
  url: string;
  /** Display name: the file name without its extension (Hebrew welcome). */
  label: string;
}

async function listBackgroundDir(dir: string, urlBase: string): Promise<BackgroundImage[]> {
  try {
    const files = await fs.readdir(path.join(BG_DIR, dir));
    return files
      .filter((f) => BG_EXTENSIONS.has(f.split(".").pop()?.toLowerCase() ?? ""))
      .map((f) => ({
        url: `${urlBase}/${encodeURIComponent(f)}`,
        label: f.replace(/\.[^.]+$/, ""),
      }));
  } catch {
    return []; // folder doesn't exist — no options from it
  }
}

/** Background images offered to a template: its own folder + the shared pool. */
export async function getBackgroundImages(slug: string): Promise<BackgroundImage[]> {
  const [own, shared] = await Promise.all([
    listBackgroundDir(slug, `/backgrounds/${slug}`),
    listBackgroundDir("shared", "/backgrounds/shared"),
  ]);
  return [...own, ...shared];
}
