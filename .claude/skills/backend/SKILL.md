---
name: backend
description: >-
  Server-side conventions for "מזל טוב AI": Server Actions, API Routes, zod
  validation, Supabase server clients, the AI provider abstraction, and
  Puppeteer PDF generation. Use when writing any server logic — mutations, AI
  calls, PDF rendering, endpoints, webhooks, queries, emails. Triggers: "שרת",
  "API", "אקשן", "לוגיקה", "וובהוק", "AI", "בינה", "ניסוח", "PDF", "מייל",
  "server action", "route handler", "endpoint", "webhook", "mutation".
---

# Backend — קונבנציות צד-שרת: Server Actions, שכבת AI, יצירת PDF, Supabase

## Scope

- **In scope**: Server Actions, API Route Handlers, input validation, Supabase client usage, the **AI provider abstraction layer**, **Puppeteer PDF generation**, error handling, email (purchase confirmation + file).
- **Out of scope**: table schemas and RLS mechanics — see the `database` skill; guest checkout, order/payment flow, AI usage limits, and download gating — see the `access-control` skill; personal-data handling — see the `privacy-compliance` skill.

## Rules

1. **Server Action vs Route Handler — one way each**: mutations triggered by the app's own UI (fill a field, run an AI improvement, create an order, save a version) are **Server Actions** in `lib/actions/<entity>.ts`. Endpoints called by **external systems** (the **Grow payment webhook**, provider callbacks) are **Route Handlers** in `app/api/`. Never build a Route Handler for something the UI itself calls.
2. **Validate every input with zod** — schema per action at the top of the file. Parse before touching the database; return Hebrew field errors.
3. **Supabase clients**:
   - User/guest-scoped work: `createServerClient` (cookie-bound, `@supabase/ssr`) from `lib/supabase/server.ts` — RLS applies.
   - `service_role` key: only inside webhook Route Handlers, the PDF renderer, and admin jobs, via `lib/supabase/admin.ts`. Never imported by anything a browser bundle can reach, never in a Server Component.
4. **Uniform action result**: every Server Action returns `{ ok: true, data } | { ok: false, error: string }` with a Hebrew `error`. Never throw across the server/client boundary.
5. **Reads live in `lib/queries/<entity>.ts`**, writes in `lib/actions/<entity>.ts`. Components never call `supabase.from()` directly.
6. **AI goes through ONE abstraction** (spec §7, §7.1): all AI calls (Writer, Spell Checker) go through `lib/ai/provider.ts`, which wraps the single launch provider (Anthropic or OpenAI) behind a stable interface so it can be swapped. Never call an SDK (`@anthropic-ai/sdk`, `openai`) directly from an action. The provider layer also **records token cost** onto the order/document (spec §16: AI cost < 5% of price) and enforces the free-use limit via the `access-control` helper — see rule 8.
7. **PDF is server-only Puppeteer** (spec §13): `lib/pdf/render.ts` renders the **same preview HTML** to a print-quality PDF (A5 for invitations, A4 for CVs, 300dpi, embedded Hebrew fonts). It runs only after a paid order (see `access-control`), writes to Supabase Storage, and inserts a `downloads` row. The PDF must be byte-for-byte the same layout the user previewed.
8. **AI free-use limit is checked, not trusted** (spec §7.1): before any AI Writer call on a guest document, call `assertAiAllowed(documentId)` from the `access-control` skill (≤3 free improvements per document; beyond that requires a paid document or premium). Increment `documents.ai_uses` server-side.
9. **Auth is optional by design** (spec §11, guest checkout): actions resolve the session **if present** but must also work for a guest identified by the document's `session_token`. Never hard-fail with "יש להתחבר" on the core create→pay→download flow.

## Patterns

### AI Writer — through the abstraction, cost-tracked, limit-checked

```ts
// lib/actions/ai.ts
"use server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { improveText } from "@/lib/ai/provider";        // the ONLY AI entry point
import { assertAiAllowed } from "@/lib/access/aiLimit";  // access-control skill

const schema = z.object({
  documentId: z.string().uuid(),
  field: z.string().min(1),
  instruction: z.string().min(1, "נא לכתוב מה לשפר").max(500),
});

export async function runAiWriter(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };

  const gate = await assertAiAllowed(parsed.data.documentId);   // ≤3 free (spec §7.1)
  if (!gate.ok) return gate;

  const supabase = await createServerClient();
  const { data: doc } = await supabase.from("documents")
    .select("content").eq("id", parsed.data.documentId).single();

  const result = await improveText({                            // cost recorded inside
    text: doc.content[parsed.data.field] ?? "",
    instruction: parsed.data.instruction,
    documentId: parsed.data.documentId,
  });
  return { ok: true as const, data: { text: result.text } };
}
```

### Grow webhook — verify, then mark paid (idempotent)

```ts
// app/api/payments/grow/route.ts  — Route Handler, external caller
import { admin } from "@/lib/supabase/admin";
import { verifyGrowSignature } from "@/lib/payments/grow";

export async function POST(req: Request) {
  const payload = await req.json();
  if (!verifyGrowSignature(req, payload)) return new Response("bad signature", { status: 401 });

  // Idempotent on provider_ref (Grow retries) — see access-control skill for the full flow.
  await admin.from("payments").upsert(
    { order_id: payload.orderId, provider_ref: payload.transactionId, status: "approved",
      amount_agorot: payload.amount, raw: payload },
    { onConflict: "provider_ref" },
  );
  return Response.json({ received: true });
}
```

## Anti-patterns

- ❌ Calling `@anthropic-ai/sdk` / `openai` directly from an action — always go through `lib/ai/provider.ts` (swap-ability + cost tracking, spec §7.1).
- ❌ Generating the PDF from separate markup instead of the preview HTML — the file must match the preview exactly (spec §12).
- ❌ `service_role` client in Server Components, Server Actions, or anything client-reachable — it bypasses RLS.
- ❌ Trusting client-supplied `price` / `amount` / `ai_uses` / `isPaid` — amounts come from the DB, counters increment server-side.
- ❌ Hard-failing the core flow when there's no session — guests must reach payment without registering (spec §11).
- ❌ Route Handlers for internal UI mutations, or skipping zod because "the form already validates".
- ❌ Webhook without signature verification or non-idempotent upsert — anyone could forge a paid order; retries would duplicate.

## Checklist

- [ ] Every input parsed with zod before use; errors in Hebrew.
- [ ] Correct Supabase client for the context (user/guest-scoped vs admin).
- [ ] Action returns the uniform `{ ok, ... }` shape; core flow works for guests.
- [ ] AI calls go through `lib/ai/provider.ts`; cost recorded; free-use limit checked.
- [ ] PDF rendered from the preview HTML, only after a paid order; `downloads` row written.
- [ ] Grow webhook verifies the signature and is idempotent on `provider_ref`.
