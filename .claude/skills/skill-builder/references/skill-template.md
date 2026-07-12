# SKILL.md Template

Copy everything below the line into `.claude/skills/<skill-name>/SKILL.md` and replace the `<placeholders>`.

---

```markdown
---
name: <kebab-case-name>            # must match the folder name
description: >-
  <What this skill enforces, in one clause.> Use when <concrete trigger
  situations: the kinds of user requests / files / features that should load
  this skill>. Triggers: "<Hebrew keyword>", "<Hebrew keyword>",
  "<English keyword>", "<English keyword>".
---

# <Skill Title> — <שורת תקציר בעברית: מה הסקיל אוכף ומתי>

## Scope

- **In scope**: <what this skill governs>
- **Out of scope**: <bordering topics> — see the `<other-skill>` skill.

## Rules

<Numbered, imperative rules. Each rule must be concrete enough that a code
review could check it. Anchor rules to the spec (אפיון-אתר-למידה.md) where
relevant, e.g. "per spec §7".>

1. <Rule>
2. <Rule>

## Patterns

<1–3 short, copy-pasteable code examples in the project stack
(Next.js App Router + Supabase + TypeScript + Tailwind). Show the RIGHT way.
Each example ≤ 25 lines. Longer material goes to references/*.md.>

### <Pattern name>

​```ts
// <minimal working example>
​```

## Anti-patterns

- ❌ <Forbidden thing> — <one-line why / what breaks>.
- ❌ <Forbidden thing> — <why>.

## Checklist

Before finishing any task that used this skill, verify:

- [ ] <Verifiable item>
- [ ] <Verifiable item>
- [ ] All user-facing text is in Hebrew; layout works in RTL.
- [ ] No access decision for paid content relies on client-side checks alone.
```
