---
name: skill-builder
description: >-
  Create or update a project skill for "מזל טוב AI" (Hebrew document-generator
  SaaS). Use when the user asks to create, build, improve, or fix a skill —
  triggers: "צור סקיל", "בנה סקיל", "תעדכן סקיל", "new skill", "create skill",
  "improve skill". Produces skills that enforce the project stack (Next.js App
  Router + Supabase + TypeScript + Puppeteer) and the spec in
  ipyun-mazaltov-ai-v2.md.
---

# Skill Builder — בונה סקילים מותאמים לפרויקט "מזל טוב AI"

בונה סקילים חדשים (או מעדכן קיימים) כך שכל קוד עתידי בפרויקט ייכתב עקבי — מהמחולל ועד יצירת ה־PDF.

## Non-negotiable project constants

Embed these in EVERY skill you create. A skill that contradicts one of these is wrong:

1. **Product**: "מזל טוב AI" — a SaaS that generates print-ready designed documents in Hebrew (invitations, announcements, CVs, flyers) from JSON **Smart Templates**. Core flow (spec §3): choose document → fill a dynamic form → AI improves the wording → choose a design → live preview → pay → download a PDF. The whole flow takes under 5 minutes and requires **no registration before payment**.
2. **Stack** (spec §13): Next.js (App Router) + TypeScript + Tailwind + shadcn/ui on the front; Next.js API Routes + Supabase (Postgres, Auth, Storage, RLS) on the back; **Puppeteer** server-side for PDF (the preview HTML becomes the PDF); **Grow** for payments; one AI provider (Anthropic or OpenAI) **behind an abstraction layer**; Vercel deploy; PostHog analytics. Code examples use this stack only.
3. **Language & direction** (spec §12): all user-facing text is Hebrew; the UI is RTL to the pixel (`dir="rtl"`, `lang="he"`), including forms, errors, and payment. Embedded Hebrew fonts in the PDF. Code, identifiers, and comments are English. Use logical Tailwind utilities (`ms-*`, `me-*`, `text-start`) — never `ml-*`/`text-left`.
4. **The template is JSON, adding a document type needs no code** (spec §4): a Smart Template declares its fields, wording, and layout as JSON. Never hard-code a document type in a component or route — everything renders from the template definition.
5. **Money is integer agorot** (never float); prices come from the **database/template**, never from the client. The PDF is delivered only after a **verified Grow webhook**, never on the success-redirect (spec §13, §8).
6. **Source of truth**: the spec file `ipyun-mazaltov-ai-v2.md` at the project root. Data model = spec §14, roles = spec §11, MVP scope = spec §15 (build MVP only; V2/V3 features stay out until asked).

## Process

Follow these steps in order. Do not skip step 1.

### 1. Read context first

- Read `ipyun-mazaltov-ai-v2.md` (project root) — at minimum the sections relevant to the requested skill.
- List existing skills: `Glob .claude/skills/**/SKILL.md` and read the frontmatter of each.
- **If an existing skill already covers ≥50% of the requested topic — update that skill instead of creating a new one.** Overlapping skills cause conflicting guidance.

### 2. Scope the skill

Answer these before writing (ask the user only if genuinely ambiguous):

- **Trigger**: on which user prompts should this skill load? (e.g. "any UI work", "anything touching AI calls", "anything touching payments or downloads")
- **Enforcement**: what rules/patterns does it enforce? What bug or inconsistency does it prevent?
- **Boundary**: what is explicitly out of scope (covered by another skill)? Name that skill.
- **Phase**: does this belong to the MVP (spec §15) or a later phase? Skills should govern MVP work first.

### 3. Write the skill

Copy `references/skill-template.md` and fill it in. Apply every rule in `references/best-practices.md`. Key rules:

- `description` says **when to load the skill**, not just what it does, and includes trigger keywords in both Hebrew and English.
- One Hebrew summary line at the top of the body; everything else in English.
- Imperative voice: "Do X", "Never Y" — not "you should consider".
- Concrete, copy-pasteable code examples in the project stack, anchored to the spec's data model (spec §14).
- Include an **Anti-patterns** section and a closing **Checklist**.
- Body under ~150 lines; move long material (full schemas, long templates) to `references/*.md` inside the skill folder and link to it.

### 4. Register

- Save to `.claude/skills/<kebab-case-name>/SKILL.md`.
- Update the skills table in `CLAUDE.md` (project root): one row — skill name, when it loads, one-line scope.
- Cross-link: if the new skill borders an existing one, add a one-line "see also" in both.

### 5. Verify

- Frontmatter parses: `name` matches the folder name, `description` is a single YAML string.
- Ask yourself: given a realistic Hebrew prompt (e.g. "תבני את דף התשלום", "הוסף שיפור נוסח ב־AI"), would this description cause the skill to load? If not, sharpen the trigger keywords.
- Confirm no rule contradicts an existing skill or a project constant above.

## Anti-patterns

- ❌ Creating a skill without reading the spec — produces generic advice detached from the product.
- ❌ Carrying over concepts from other domains (lessons, series, lecturers, video URLs) — this project is documents, templates, and orders.
- ❌ Generic content that could apply to any project ("write clean code"). Every rule must be specific enough that violating it is detectable.
- ❌ Duplicating rules that already live in another skill — link to that skill instead.
- ❌ Descriptions that describe the topic ("frontend guidelines") instead of the trigger ("use when building pages, the live preview, or any UI…").
- ❌ Code for a different stack (Express, Firebase, Pages Router) or hard-coded document types instead of JSON templates.
