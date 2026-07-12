import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * service_role client — BYPASSES RLS. Server-only.
 * Allowed ONLY in webhook Route Handlers (Grow), the PDF renderer, and admin jobs.
 * The `server-only` import makes any accidental client-side import a build error.
 */
export const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
