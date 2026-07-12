# Skill-Writing Best Practices

Rules the skill-builder enforces on every skill it creates or updates.

## 1. The description is a trigger, not a summary

The `description` frontmatter is the ONLY thing the model sees when deciding
whether to load the skill. It must answer "when should this load?".

- ✅ `Use when building pages, components, layouts, or any user-facing UI. Triggers: "דף", "קומפוננטה", "עיצוב", "page", "component".`
- ❌ `Frontend guidelines for the project.`

Include trigger keywords in **both Hebrew and English** — the user prompts in
Hebrew, code discussions may happen in English.

## 2. Structure

Fixed section order, so all project skills read the same:

1. Title + one Hebrew summary line
2. **Scope** (in / out, with links to bordering skills)
3. **Rules** (numbered, imperative)
4. **Patterns** (code examples)
5. **Anti-patterns**
6. **Checklist**

## 3. Writing rules

- Imperative and testable: "Validate every input with zod" — not "consider validating inputs".
- Every rule must be checkable in code review. If you can't tell whether code violates it, delete or sharpen it.
- No generic advice ("write clean code"). If the rule would fit any project on earth, it doesn't belong here.
- Anchor to the spec where possible: "per spec §14" (data model), "roles per spec §11", "MVP scope per spec §15". The spec (`ipyun-mazaltov-ai-v2.md`) is the tiebreaker in every disagreement.
- Prefer "one way to do it": when the stack offers two mechanisms (e.g. Server Action vs Route Handler), state which to use when — don't present a menu.

## 4. Code examples

- Project stack only: Next.js App Router, Supabase JS client, TypeScript, Tailwind. No Express, no Firebase, no Pages Router, no other ORMs.
- Use real entity names from spec §14 (`templates`, `documents`, `orders`, `payments`, `downloads`, `coupons`) — not `foo`/`items`.
- Each example ≤ ~25 lines and self-contained. Show the right way; put the wrong way only in Anti-patterns, and only as one line.
- Hebrew strings in UI examples (`"רכישת שיעור"`, not `"Buy lesson"`).

## 5. Size and layering

- SKILL.md body ≤ ~150 lines. It's loaded into context whenever triggered — every line costs.
- Long material (full SQL schema, long component templates, provider docs) goes in `references/*.md` within the skill folder; SKILL.md links to it and says when to read it.
- One skill = one concern. If a skill needs two unrelated trigger sets, split it.

## 6. Consistency across skills

- Never restate another skill's rules — write "see the `database` skill" instead. Duplicated rules drift apart.
- Every skill repeats the four project constants only by reference behavior (RTL Hebrew UI, stack, server-side authorization, spec as source of truth) in its Checklist — not as a copied block of text.
- After creating/updating a skill, update the skills table in `CLAUDE.md`.
