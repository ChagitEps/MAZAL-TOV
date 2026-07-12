---
name: database
description: >-
  Database schema, migrations, and RLS conventions for "מזל טוב AI" (Supabase
  Postgres). Use when creating or altering tables, writing migrations, adding
  indexes, or designing queries. Triggers: "טבלה", "סכמה", "מסד נתונים",
  "מיגרציה", "שאילתה", "schema", "table", "migration", "SQL", "RLS", "index".
---

# Database — סכמת הנתונים, מיגרציות ו-RLS לפי סעיף 14 באפיון

## Scope

- **In scope**: table design, migrations, constraints, indexes, RLS policy *mechanics*.
- **Out of scope**: who may download/order what (policy *content*, guest checkout, AI limits) — see the `access-control` skill; query call-sites in code — see the `backend` skill.

## Rules

1. **MVP entities are fixed by spec §14**: `users` (extends `auth.users`), `templates`, `template_categories`, `documents`, `document_versions`, `orders`, `payments`, `downloads`, `coupons`. The V2–V3 entities (`organizations`, `fonts`, `colors`, `layouts`, `favorites`, `reviews`, `affiliates`, `affiliate_links`) are **designed-for but not built in the MVP** — do not create them until that phase begins. New tables need a spec-grounded reason.
2. **Every schema change is a Supabase SQL migration** in `supabase/migrations/<timestamp>_<name>.sql`. Never mutate the schema from the dashboard without capturing it as a migration.
3. **RLS enabled on every table, no exceptions.** A table without policies is inaccessible by default — the correct failure mode. Policy content follows the `access-control` skill.
4. **Column conventions**: `id uuid primary key default gen_random_uuid()`, `created_at timestamptz not null default now()`, snake_case names, money in **agorot as `integer`** (`price_agorot`, `amount_agorot`) — never floating point.
5. **The template body is JSON** (spec §4): `templates.schema jsonb not null` holds the field definitions, wording, and layout. Adding a document type is inserting a row, not writing code. `template_categories` groups them (אירועים / עבודה / עסקים / קהילה — spec §6).
6. **Guest documents exist without a user** (spec §11, guest checkout): `documents.user_id uuid references users(id)` is **nullable**; a guest's document is keyed by a server-issued session/claim token. `documents.content jsonb` holds the filled field values; `document_versions` snapshots each edit/AI revision.
7. **Constraints encode the spec**:
   - `orders`: `check (status in ('pending','paid','failed','refunded'))`; `amount_agorot` set server-side from the template/coupon, never the client.
   - `payments`: `unique (provider_ref)` — idempotent on the Grow reference (webhooks retry).
   - `downloads`: one row per generated PDF, `references orders(id)` — a download presupposes a paid order.
   - `coupons`: `unique (code)`, `check (discount_percent between 0 and 100)` or a fixed `discount_agorot`, plus `valid_until`, `max_uses`, `used_count`.
   - `users.role`: `check (role in ('user','premium','designer','admin'))` (spec §11; Guest = no row).
8. **Index the access patterns the flow implies** (spec §3, §9): `templates(category_id)`, `templates(slug)` unique for the auto landing pages (`/wedding`, `/cv`…), `documents(user_id)`, `documents(session_token)`, `orders(user_id, status)`, `orders(document_id)`, `payments(provider_ref)`, `downloads(order_id)`.
9. **Aggregates via views/RPC, not client-side loops**: dashboard metrics — documents created, orders, revenue, conversion funnel, best-selling template (spec §10) — come from SQL views/RPC, never by fetching rows and counting in JS. AI cost per document (spec §7.1) is tracked in a column/table and aggregated in SQL.

## Patterns

The full initial schema (all MVP tables with constraints, indexes, and the
dashboard views) lives in [references/schema.md](references/schema.md) — read it
before writing the first migration or altering any table.

### Migration shape

```sql
-- supabase/migrations/20260712120000_create_templates.sql
create table templates (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references template_categories(id),
  slug text not null unique,               -- drives the auto landing page /:slug (spec §9)
  title text not null,
  schema jsonb not null,                   -- fields, wording, layout (Smart Template, spec §4)
  base_price_agorot integer not null check (base_price_agorot >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table templates enable row level security;
create index templates_category_id_idx on templates (category_id);
```

## Anti-patterns

- ❌ Table without `enable row level security` — one forgotten table leaks personal data or paid PDFs.
- ❌ `numeric`/`float` for prices — use integer agorot.
- ❌ Hard-coding a document type as its own table/columns — the type lives in `templates.schema` JSON (spec §4).
- ❌ `documents.user_id` declared `not null` — it breaks guest checkout (spec §11).
- ❌ Schema edits in the dashboard with no migration file — environments drift.
- ❌ Storing computed dashboard counts on base tables in MVP — derive via views; denormalize only if measured slow.

## Checklist

- [ ] Change exists as a migration file, runs cleanly on a fresh database.
- [ ] RLS enabled on every new table.
- [ ] Money in integer agorot; prices sourced server-side.
- [ ] Constraints from rule 7 present; guest `documents.user_id` stays nullable.
- [ ] Indexes cover the flow's access patterns (rule 8), including the `slug` for landing pages.
- [ ] Entity names match spec §14; no V2/V3 table built early.
