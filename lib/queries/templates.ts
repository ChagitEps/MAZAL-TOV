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

/** Shape of a seed file (snake_case like the DB row it will become). */
interface SeedTemplate {
  slug: string;
  title: string;
  description?: string;
  category_slug: string;
  base_price_agorot: number;
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
