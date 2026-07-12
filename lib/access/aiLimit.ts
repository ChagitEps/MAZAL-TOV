import "server-only";
import { createServerClient } from "@/lib/supabase/server";

const FREE_AI_USES = 3; // spec §7.1: up to 3 free AI improvements per document

/**
 * Enforce the free-AI cap server-side (spec §7.1). Call before every AI Writer
 * run on a document. Beyond the cap, improvements require a paid document or an
 * active premium subscription (phase 2). Returns the uniform action-result shape.
 */
export async function assertAiAllowed(
  documentId: string,
): Promise<{ ok: true; data: null } | { ok: false; error: string }> {
  const supabase = await createServerClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("ai_uses, orders(status)")
    .eq("id", documentId)
    .single();

  const isPaid = (doc?.orders as { status: string }[] | undefined)?.some(
    (o) => o.status === "paid",
  );
  if (!isPaid && (doc?.ai_uses ?? 0) >= FREE_AI_USES) {
    return {
      ok: false,
      error: "הגעת למכסת השיפורים החינמיים. רכשי את המסמך להמשך שיפורים",
    };
  }
  return { ok: true, data: null };
}
