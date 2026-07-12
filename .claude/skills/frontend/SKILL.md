---
name: frontend
description: >-
  Frontend conventions for "מזל טוב AI": Next.js App Router, RTL Hebrew UI,
  Tailwind + shadcn/ui, the JSON-driven dynamic form, the live preview that
  becomes the PDF, and auto landing pages. Use when building or editing pages,
  the generator, the preview, forms, styling, or any user-facing UI. Triggers:
  "דף", "עמוד", "קומפוננטה", "עיצוב", "תצוגה", "טופס", "מחולל", "תצוגה מקדימה",
  "נחיתה", "page", "component", "UI", "preview", "form", "landing", "RTL".
---

# Frontend — קונבנציות פרונטאנד: Next.js App Router, עברית RTL, מחולל דינמי, תצוגה חיה

## Scope

- **In scope**: pages, components, layouts, styling, client-side form state, the dynamic template form, the live preview surface, auto landing pages per template.
- **Out of scope**: Server Actions, AI calls, and PDF rendering — see the `backend` skill; who may pay/download and AI limits — see the `access-control` skill; consent UI wording — see the `privacy-compliance` skill.

## Rules

1. **Server Components by default.** Add `"use client"` only for interactivity (the fill form, AI buttons, color picker, live-preview updates). Fetch data (templates, documents) in Server Components, never in `useEffect`.
2. **RTL + Hebrew to the pixel** (spec §12): root layout sets `<html lang="he" dir="rtl">`. All user-facing text in Hebrew — forms, errors, payment. Use logical Tailwind utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`) — never `ml-*`/`mr-*`/`text-left`, which break in RTL. Use shadcn/ui components, themed for RTL.
3. **The form is generated from the template JSON, never hard-coded** (spec §4): a `<DynamicForm schema={template.schema} />` renders fields from the template's `schema` (field type, label, default wording, validation). Adding a document type must require **zero** UI code. Never write a bespoke form per document type.
4. **The live preview is the source of the PDF** (spec §13): the same React/HTML that renders the on-screen preview (`<DocumentPreview>`) is what the server rasterizes with Puppeteer. Style it with print-exact units (mm/pt, A5 for invitations, A4 for CVs), embedded Hebrew fonts (פרנק-רול, היבו, דוד). What the user sees must equal the downloaded file — no preview-only or PDF-only styling.
5. **Preview updates live, locally**: typing in the form updates the preview immediately from client state (no round-trip). AI improvements and version saves go through Server Actions (see `backend`) and then update the same state.
6. **Auto landing pages** (spec §9): each template gets a route `/[slug]` generated from its `slug`, rendered as a Server Component with SEO metadata (title, description, OpenGraph) derived from the template — hundreds of pages, no manual work. Use `generateStaticParams`/`generateMetadata`.
7. **Guest-friendly**: the create→preview→pay flow shows no "please log in" wall (spec §11). The paywall appears only at download: preview is free, the final PDF is behind payment (handled by `access-control`).
8. **Content modesty** (spec §12): no photos of people in templates; traditional Hebrew wordings (בס"ד, בעזהשי"ת) as selectable defaults. **Accessibility**: meet Israeli standard ת"י 5568 — semantic HTML, labels, focus states, contrast.
9. **Loading & errors**: every route with data has `loading.tsx` (skeleton) and `error.tsx` with a Hebrew message.

## Patterns

### Dynamic form driven by the template JSON

```tsx
// components/DynamicForm.tsx
"use client";
import type { TemplateSchema } from "@/lib/templates/types";

export function DynamicForm({ schema, value, onChange }: {
  schema: TemplateSchema; value: Record<string, string>;
  onChange: (field: string, v: string) => void;
}) {
  return (
    <form className="flex flex-col gap-4 text-start">
      {schema.fields.map((f) => (
        <label key={f.key} className="flex flex-col gap-1">
          <span className="font-medium">{f.label}</span>
          <input
            className="rounded-md border ps-3 pe-3 py-2"
            defaultValue={value[f.key] ?? f.default ?? ""}
            maxLength={f.maxLength}
            onChange={(e) => onChange(f.key, e.target.value)}   // updates preview live
          />
        </label>
      ))}
    </form>
  );
}
```

### Auto landing page per template (SEO, spec §9)

```tsx
// app/[slug]/page.tsx
import { getTemplateBySlug, getAllTemplateSlugs } from "@/lib/queries/templates";

export async function generateStaticParams() {
  return (await getAllTemplateSlugs()).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTemplateBySlug(slug);
  return { title: `${t.title} | מזל טוב AI`, description: t.description };
}
export default async function TemplateLanding({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTemplateBySlug(slug);
  return <main className="mx-auto max-w-3xl px-4" dir="rtl">{/* hero + CTA to /create/[slug] */}</main>;
}
```

## Anti-patterns

- ❌ A hand-written form or preview per document type — everything renders from `template.schema` (spec §4).
- ❌ Different markup/styles for preview vs PDF — the file must match the preview exactly (spec §12).
- ❌ `ml-*` / `mr-*` / `text-left` / `text-right` — breaks RTL; use logical properties.
- ❌ English strings in the UI, even placeholders — Hebrew from day one.
- ❌ A login wall before the preview/payment step — guests must flow through freely (spec §11).
- ❌ Fetching template data in `useEffect` when a Server Component can fetch it.
- ❌ Photos of people in templates, or ignoring ת"י 5568 accessibility.

## Checklist

- [ ] All user-facing text in Hebrew; layout verified in RTL.
- [ ] Form and preview render from the template JSON, not hard-coded per type.
- [ ] Preview styling is print-exact and identical to what the PDF will produce.
- [ ] `"use client"` only where interactivity requires it.
- [ ] Logical Tailwind spacing utilities only; shadcn/ui components RTL-correct.
- [ ] Auto landing page + SEO metadata generated from the template slug.
- [ ] `loading.tsx` + `error.tsx` exist; ת"י 5568 basics met (labels, focus, contrast).
