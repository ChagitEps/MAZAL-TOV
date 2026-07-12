# מזל טוב AI

פלטפורמה מבוססת בינה מלאכותית ליצירת מסמכים, הזמנות וקורות חיים מעוצבים בעברית —
מילוי טופס דינמי, שיפור נוסח ב-AI, תצוגה מקדימה חיה וייצוא PDF באיכות דפוס.

הזרימה כולה אורכת פחות מ-5 דקות ואינה דורשת הרשמה לפני התשלום.
אפיון המוצר המלא: [`ipyun-mazaltov-ai-v2.md`](ipyun-mazaltov-ai-v2.md).

## מחסנית טכנולוגית (אפיון §13)

- **Frontend/Backend**: Next.js (App Router) · TypeScript · Tailwind CSS
- **DB + Auth + Storage**: Supabase (PostgreSQL, RLS)
- **AI**: ספק יחיד (Anthropic/OpenAI) מאחורי שכבת הפשטה — `lib/ai/provider.ts`
- **PDF**: Puppeteer בשרת (אותו HTML של התצוגה החיה)
- **תשלומים**: Grow · **Deploy**: Vercel · **Analytics**: PostHog

## מבנה הפרויקט

```
app/          — Next.js App Router (עברית RTL גלובלי)
components/    — קומפוננטות UI (בהמשך: DynamicForm, DocumentPreview)
lib/
  supabase/   — client (browser) · server (RLS) · admin (service_role, server-only)
  ai/         — provider.ts — נקודת הכניסה היחידה ל-AI (אפיון §7.1)
  templates/  — types.ts — חוזה ה-Smart Template (אפיון §4)
  access/     — aiLimit.ts (מכסת AI) · entitlements.ts (הרשאת הורדה)
supabase/
  migrations/ — סכמת מסד הנתונים (אפיון §14)
  seed/       — תבניות לדוגמה (JSON)
.claude/skills/ — סקילים המכתיבים את קונבנציות הקוד לפרויקט
```

## התחלה מהירה

```bash
npm install
cp .env.example .env.local   # מלא ערכי Supabase / AI / Grow
npm run dev                  # http://localhost:3000
```

הרצת המיגרציה מול Supabase (דורש Supabase CLI):

```bash
supabase db push
```

## סקריפטים

| פקודה | פעולה |
|---|---|
| `npm run dev` | שרת פיתוח |
| `npm run build` | בנייה לפרודקשן |
| `npm run typecheck` | בדיקת טיפוסים (tsc) |
| `npm run lint` | ESLint |

## אבטחה ופרטיות

- כסף נשמר ב**אגורות (integer)**; מחירים מהשרת בלבד.
- PDF נוצר רק אחרי **webhook מאומת של Grow** — לעולם לא ב-redirect ההצלחה.
- `service_role` בשרת בלבד (`server-only`); לעולם לא בצד לקוח.
- עמידה בחוק הגנת הפרטיות (תיקון 13) — ראה סקיל `privacy-compliance`.

## סטטוס

שלד ה-MVP (אפיון §15). בהמשך: תבניות מלאות, טופס דינמי, תצוגה חיה, Server Actions,
שכבת AI פעילה, יצירת PDF, תשלום Grow, דפי נחיתה אוטומטיים ודשבורד אדמין.
