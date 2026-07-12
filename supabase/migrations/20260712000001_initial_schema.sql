-- Initial schema for "מזל טוב AI" (spec §14). Money is integer agorot.
-- RLS is enabled on every table here; detailed policy CONTENT lands in a later
-- migration (see the access-control skill). V2–V3 entities are intentionally omitted.

-- users: extends Supabase auth.users (spec §11 roles). Guest = no row.
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text not null default 'user' check (role in ('user', 'premium', 'designer', 'admin')),
  created_at timestamptz not null default now()
);
alter table users enable row level security;

-- template_categories: אירועים / עבודה / עסקים / קהילה (spec §6)
create table template_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table template_categories enable row level security;

-- coupons: discount codes (spec §9, admin-managed). Defined before orders (FK).
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent integer check (discount_percent between 0 and 100),
  discount_agorot integer check (discount_agorot >= 0),
  valid_until timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (discount_percent is not null or discount_agorot is not null)
);
alter table coupons enable row level security;

-- templates: the Smart Template. Adding a document type = inserting a row (spec §4)
create table templates (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references template_categories(id),
  slug text not null unique,               -- powers the auto landing page /:slug (spec §9)
  title text not null,
  description text,
  schema jsonb not null,                   -- fields, wording, layout, color sets
  base_price_agorot integer not null check (base_price_agorot >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table templates enable row level security;
create index templates_category_id_idx on templates (category_id);

-- documents: a user's or GUEST's filled document (spec §3, §11 guest checkout)
create table documents (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates(id),
  user_id uuid references users(id) on delete set null,   -- NULLABLE: guests have no user
  session_token text,                       -- claims a guest document pre-registration
  title text,
  content jsonb not null default '{}'::jsonb,-- current field values
  color_set text,                           -- chosen palette key (spec §15: 4 sets)
  ai_uses integer not null default 0,       -- free-AI counter (spec §7.1: 3 free/guest doc)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or session_token is not null)
);
alter table documents enable row level security;
create index documents_user_id_idx on documents (user_id);
create index documents_session_token_idx on documents (session_token);
create index documents_template_id_idx on documents (template_id);

-- document_versions: snapshot per edit / AI revision (spec §14, §8 "3 revisions")
create table document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  content jsonb not null,
  source text not null default 'user' check (source in ('user', 'ai_writer', 'ai_spell')),
  created_at timestamptz not null default now()
);
alter table document_versions enable row level security;
create index document_versions_document_idx on document_versions (document_id, created_at);

-- orders: one purchase of a document (spec §8). amount set server-side.
create table orders (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id),
  user_id uuid references users(id) on delete set null,   -- NULLABLE: guest orders
  coupon_id uuid references coupons(id),
  product text not null,                    -- 'document' | 'simcha_pack' (spec §8)
  amount_agorot integer not null check (amount_agorot >= 0),
  ai_cost_agorot integer not null default 0,-- cost tracking (spec §7.1, §16 <5%)
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);
alter table orders enable row level security;
create index orders_user_status_idx on orders (user_id, status);
create index orders_document_idx on orders (document_id);

-- payments: Grow transactions. Idempotent on provider_ref (webhooks retry).
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  provider text not null default 'grow',
  provider_ref text not null unique,        -- Grow transaction id (idempotency key)
  amount_agorot integer not null check (amount_agorot >= 0),
  status text not null check (status in ('pending', 'approved', 'declined', 'refunded')),
  raw jsonb,                                -- provider payload for reconciliation
  created_at timestamptz not null default now()
);
alter table payments enable row level security;

-- downloads: one generated PDF, only for a paid order (spec §3, §15)
create table downloads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  storage_path text not null,               -- Supabase Storage path of the rendered PDF
  bytes integer,
  created_at timestamptz not null default now()
);
alter table downloads enable row level security;
create index downloads_order_idx on downloads (order_id);

-- Dashboard views (spec §10): metrics come from SQL, never client-side counting.
create view daily_sales as
select
  date_trunc('day', created_at) as day,
  count(*) filter (where status = 'paid')            as paid_orders,
  sum(amount_agorot) filter (where status = 'paid')  as revenue_agorot,
  sum(ai_cost_agorot) filter (where status = 'paid') as ai_cost_agorot
from orders
group by 1;

create view template_sales as
select t.id as template_id, t.title, count(o.id) as paid_count
from templates t
join documents d on d.template_id = t.id
join orders o on o.document_id = d.id and o.status = 'paid'
group by t.id, t.title;
