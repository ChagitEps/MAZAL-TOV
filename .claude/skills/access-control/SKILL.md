---
name: access-control
description: >-
  Guest checkout, orders & the Grow payment flow, AI free-use limits, PDF
  download entitlement, and RLS policy content for "מזל טוב AI". Use when
  touching anything about who may pay/download, orders, payment webhooks,
  coupons, AI usage caps, or access to a rendered PDF. Triggers: "תשלום",
  "רכישה", "הזמנה", "הורדה", "קופון", "מגבלת AI", "הרשאות", "סליקה", "מנוי",
  "payment", "order", "download", "coupon", "AI limit", "entitlement", "Grow".
---

# Access Control — צ'קאאוט אורחת, הזמנות ותשלומי Grow, מגבלות AI, והרשאת הורדת PDF

## Scope

- **In scope**: guest checkout, order creation, the Grow payment/webhook flow, coupon application, AI free-use limits (spec §7.1), PDF download entitlement, and RLS policy *content*.
- **Out of scope**: table mechanics — see the `database` skill; AI call plumbing and PDF rendering code — see the `backend` skill; checkout/paywall UI — see the `frontend` skill; personal-data rules — see the `privacy-compliance` skill.

## Rules

1. **Guest-first, registration optional** (spec §3, §11): a Guest can create a document, preview it, and buy it **without an account**. A guest document is owned by a server-issued `session_token` (httpOnly cookie), not a `user_id`. Never gate the create→pay→download flow behind login.
2. **One download-entitlement function**: `canDownload(orderId, requester)` in `lib/access/entitlements.ts` is the ONLY place the right to fetch a rendered PDF is decided. True iff the order is `status = 'paid'` **and** the requester owns it (matching `user_id` **or** the document's `session_token`), or the requester is an admin. Every download route calls it — never re-implement inline.
3. **Orders are priced server-side** (spec §8): `amount_agorot` = the template's `base_price_agorot` (or the `simcha_pack` price) minus a validated coupon, computed on the server from the DB. Client-submitted amounts are ignored. Coupon validity (active, not expired, under `max_uses`) is checked server-side and `used_count` incremented atomically.
4. **Only the verified Grow webhook marks an order paid** (spec §13). Flow: checkout → Grow (iframe/redirect) → Grow calls `app/api/payments/grow/route.ts` → handler **verifies the Grow signature**, validates the amount against the order, upserts a `payments` row **idempotent on `provider_ref`**, and flips the order to `paid`. The success-redirect page only *displays* status — it never marks paid and never triggers the PDF.
5. **PDF renders after payment, not before**: the `downloads` row and the Puppeteer render (see `backend`) happen only once the order is `paid`. No paid status ⇒ no PDF is generated or served; the response carries no storage path.
6. **AI free-use cap is enforced server-side** (spec §7.1): `assertAiAllowed(documentId)` allows up to **3 free AI improvements per document** for guests/free users; beyond that requires a paid document or an active premium subscription (phase 2). It returns the uniform `{ ok, error }` shape and is called by every AI action (see `backend`). `documents.ai_uses` is the counter, incremented server-side only.
7. **RLS mirrors these rules** (defense in depth): guests reach their document/order rows via the `session_token` claim; `paid` orders and their `downloads` are readable only by the owner or admin. App check + RLS together — never rely on one alone.
8. **Roles** (spec §11): Guest (no row) buys once; User saves drafts and history; Premium gets unlimited docs + extended AI; Designer (phase 3) uploads marketplace templates; Admin manages everything. Encode role bypass inside the entitlement functions, not as scattered `role === 'admin'` checks.

## Patterns

### The single download-entitlement function

```ts
// lib/access/entitlements.ts
import { createServerClient } from "@/lib/supabase/server";

export async function canDownload(orderId: string, sessionToken: string | null) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: order } = await supabase
    .from("orders")
    .select("status, user_id, documents(session_token)")
    .eq("id", orderId).single();
  if (!order || order.status !== "paid") return false;
  if (user && order.user_id === user.id) return true;
  return !!sessionToken && order.documents?.session_token === sessionToken;
}
```

### AI free-use gate (spec §7.1)

```ts
// lib/access/aiLimit.ts
export async function assertAiAllowed(documentId: string) {
  const supabase = await createServerClient();
  const { data: doc } = await supabase.from("documents")
    .select("ai_uses, orders(status)").eq("id", documentId).single();
  const isPaid = doc?.orders?.some((o) => o.status === "paid");
  if (!isPaid && (doc?.ai_uses ?? 0) >= 3)
    return { ok: false as const, error: "הגעת למכסת השיפורים החינמיים. רכשי את המסמך להמשך שיפורים" };
  return { ok: true as const, data: null };
}
```

### RLS: a paid order's download is owner/admin only

```sql
create policy "owner_reads_paid_download" on downloads
  for select using (
    exists (
      select 1 from orders o
      where o.id = downloads.order_id and o.status = 'paid'
        and (o.user_id = auth.uid() or is_admin(auth.uid()))
    )
  );
```

## Anti-patterns

- ❌ Forcing registration before payment — breaks the guest-first flow (spec §11).
- ❌ Marking an order paid on the success-redirect — only the verified Grow webhook does that.
- ❌ Reading the checkout amount from the client, or applying a coupon without server-side validation.
- ❌ Rendering or serving a PDF for an unpaid order — no PDF exists before payment.
- ❌ Trusting a client-sent `ai_uses` or letting the browser decide the AI cap — enforce server-side.
- ❌ Grow webhook without signature verification or non-idempotent on `provider_ref` — forged/duplicate paid orders.
- ❌ Re-implementing "did they pay?" or "AI still allowed?" inline — call `canDownload` / `assertAiAllowed`.

## Checklist

- [ ] Core create→pay→download flow works for a guest with no account.
- [ ] Order amount computed server-side from DB price + validated coupon.
- [ ] Only the verified, idempotent Grow webhook flips an order to `paid`.
- [ ] PDF generated/served only for a `paid` order, via `canDownload`.
- [ ] AI improvements capped at 3 free per document via `assertAiAllowed`; counter server-side.
- [ ] Matching RLS policies exist for documents, orders, and downloads.
