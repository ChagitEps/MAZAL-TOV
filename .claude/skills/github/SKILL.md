---
name: github
description: >-
  Commit and push work to GitHub for "מזל טוב AI" with a detailed, structured
  commit message after completing a task. Use whenever the user asks to save,
  commit, upload, or push work — or says to commit after finishing an action.
  Triggers: "העלה לגיט", "תעלה לגיטהאב", "קומיט", "שמור בגיט", "דחוף", "פוש",
  "commit", "push", "git", "github", "upload to git", "save to git".
---

# GitHub — קומיט ודחיפה ל-GitHub עם הודעת קומיט מפורטת

מעלה את העבודה ל-GitHub אחרי כל פעולה, עם הודעת קומיט ברורה שמתעדת מה נעשה ולמה.

## Scope

- **In scope**: staging changes, writing a detailed commit message, committing, pushing; initializing the repo and remote when missing; branch hygiene.
- **Out of scope**: what code to write — see the domain skills (`frontend`, `backend`, `database`, `access-control`, `privacy-compliance`).

## When to run

Run after a task is **complete and verified** — a feature, fix, migration, or skill update the user is happy with. Commit logically-scoped units of work, not half-finished states. If the user says "commit after every action", treat each completed action as one commit. **Only push when the user asked to** (this skill is invoked precisely for that).

## Environment notes

- This project runs on **Windows / PowerShell**. Prefer the `Bash` tool for git (POSIX syntax), or PowerShell with `;`/`if ($?)` chaining — `&&` is a parser error in PowerShell 5.1.
- The project **may not be a git repo yet** (`git init` needed). If there's no remote, create one with `gh` after confirming the repo name with the user.

## Rules

1. **Check state before acting**: run `git status` and `git diff --stat` first. Never commit blindly. Review what changed; if unrelated changes are mixed in, commit them separately.
2. **Initialize only if needed**: if not a repo, `git init`, add a sensible `.gitignore` (Next.js: `node_modules`, `.next`, `.env*`, `*.pdf` build artifacts), then proceed. Confirm the GitHub repo name/visibility with the user before `gh repo create` — creating a remote is outward-facing.
3. **Never commit secrets**: `.env`, Supabase `service_role` keys, Grow credentials, AI API keys must be gitignored. Scan the diff; if a secret is staged, stop and warn the user.
4. **Detailed commit message, structured**: a concise imperative subject (≤72 chars) + a body explaining **what** changed and **why**, grouped by area. Subject in Hebrew or English per the user's preference (default: Hebrew subject, matching the product language). End with the Claude co-author trailer.
5. **Branch hygiene**: if on `main`/`master` and the change is non-trivial, offer a feature branch; if the user wants to commit directly to main, that's their call. Never force-push or rewrite shared history without an explicit request.
6. **Push and report**: push the current branch, then report the branch, the short SHA, and the remote URL. If push fails (no upstream, auth), surface the exact error — don't retry blindly.

## Commit message format

```
<תיאור תמציתי בציווי — עד 72 תווים>

<למה השינוי נעשה — הקשר קצר.>

- <אזור/קובץ>: מה השתנה
- <אזור/קובץ>: מה השתנה

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

Example:

```
הוספת מחולל מסמכים דינמי מתבנית JSON

התבנית מגדירה שדות ופריסה, כך שסוג מסמך חדש נוסף ללא קוד (אפיון §4).

- components/DynamicForm.tsx: טופס שנבנה מ-schema של התבנית
- components/DocumentPreview.tsx: תצוגה חיה שממנה נוצר ה-PDF
- lib/templates/types.ts: טיפוסים ל-Smart Template

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

## Patterns

### Standard commit + push (existing repo)

```bash
git status
git add -A                       # or specific paths to keep the commit scoped
git commit -m "$(cat <<'EOF'
הוספת שכבת הפשטה לספק ה-AI

ריכוז כל קריאות ה-AI בנקודה אחת לצורך החלפת ספק ומעקב עלות (אפיון §7.1).

- lib/ai/provider.ts: ממשק improveText יחיד מעל הספק
- lib/actions/ai.ts: קריאה דרך השכבה עם בדיקת מכסה

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
git push
```

### First-time setup

```bash
git init
git add -A
git commit -m "..."              # detailed message as above
gh repo create mazal-tov-ai --private --source=. --push   # after confirming name/visibility
```

## Anti-patterns

- ❌ One-word messages ("update", "fix", "wip") — the message must say what and why.
- ❌ Committing `.env`, service_role keys, Grow/AI credentials — gitignore and scan the diff first.
- ❌ `git add -A` when unrelated changes are present — stage the scoped paths instead.
- ❌ `git push --force` or history rewrites without an explicit request.
- ❌ Creating a GitHub remote without confirming the repo name and visibility with the user.
- ❌ Committing a broken/half-finished state — commit completed, verified units.

## Checklist

- [ ] `git status`/`diff` reviewed; changes are scoped and intentional.
- [ ] No secrets staged; `.gitignore` covers `.env*`, `node_modules`, `.next`.
- [ ] Commit subject ≤72 chars, imperative; body explains what + why; co-author trailer present.
- [ ] Pushed to the intended branch; reported branch, short SHA, and remote URL.
