import "server-only";
import { createServerClient } from "@/lib/supabase/server";

/**
 * The ONLY place the right to fetch a rendered PDF is decided (spec §3, §15).
 * True iff the order is paid AND the requester owns it (matching user_id, or the
 * document's guest session_token), or the requester is an admin. Every download
 * route calls this — never re-implement inline.
 */
export async function canDownload(
  orderId: string,
  sessionToken: string | null,
): Promise<boolean> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("status, user_id, documents(session_token)")
    .eq("id", orderId)
    .single();

  if (!order || order.status !== "paid") return false;
  if (user && order.user_id === user.id) return true;

  // Without generated DB types, an embedded to-one relation is inferred loosely —
  // normalize whether it arrives as an object or a single-element array.
  const docs = order.documents as unknown as
    | { session_token: string | null }
    | { session_token: string | null }[]
    | null;
  const doc = Array.isArray(docs) ? docs[0] : docs;
  return !!sessionToken && doc?.session_token === sessionToken;
}
