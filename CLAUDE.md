# מזל טוב AI — הנחיות לפרויקט

פלטפורמת SaaS ליצירת מסמכים מעוצבים בעברית (הזמנות, מודעות, קורות חיים, פליירים) מתוך
**תבניות חכמות (Smart Templates)** בפורמט JSON. אפיון המוצר: [ipyun-mazaltov-ai-v2.md](ipyun-mazaltov-ai-v2.md) — מקור האמת לכל החלטת מוצר.

## עקרונות ליבה

1. **זרימת הליבה** (§3): בחירת מסמך ← מילוי טופס דינמי ← שיפור נוסח ב-AI ← בחירת עיצוב ← תצוגה חיה ← תשלום ← הורדת PDF. פחות מ-5 דקות, **ללא הרשמה לפני התשלום**.
2. **מחסנית** (§13): Next.js (App Router) + TypeScript + Tailwind + shadcn/ui · Supabase (Postgres, Auth, Storage, RLS) · Puppeteer ל-PDF · Grow לתשלומים · ספק AI יחיד מאחורי שכבת הפשטה · Vercel · PostHog.
3. **עברית ו-RTL ברמת הפיקסל** (§12): כל טקסט למשתמש בעברית; קוד והערות באנגלית; כלי Tailwind לוגיים (`ms-*`, `me-*`, `text-start`).
4. **התבנית היא JSON** (§4): הוספת סוג מסמך = הוספת שורה, לא קוד.
5. **כסף באגורות (integer)**; מחירים מהשרת בלבד; PDF נוצר רק אחרי webhook מאומת של Grow.
6. **היקף MVP בלבד** (§15): פיצ'רים של V2/V3 לא נבנים עד שלבם.

## סקילים

| סקיל | נטען כאשר | תחום |
|---|---|---|
| `skill-builder` | יוצרים/מעדכנים סקיל | בניית סקילים תואמי-פרויקט |
| `frontend` | דפים, מחולל, טופס, תצוגה חיה, עיצוב UI | Next.js RTL, טופס דינמי מ-JSON, תצוגה חיה = מקור ה-PDF, דפי נחיתה |
| `backend` | אקשנים, API, AI, PDF, וובהוקים | Server Actions, שכבת AI, Puppeteer, webhook של Grow |
| `database` | טבלאות, מיגרציות, שאילתות | סכמת §14, RLS, אגורות, אינדקסים |
| `access-control` | תשלום, הזמנה, הורדה, קופון, מגבלת AI | צ'קאאוט אורחת, זרימת Grow, מכסת AI, הרשאת הורדת PDF |
| `privacy-compliance` | הרשמה, מחיקת חשבון, מידע אישי | חוק הגנת הפרטיות (תיקון 13), הסכמה, שימור, מזעור |
| `github` | קומיט / דחיפה / העלאה לגיט | קומיט מפורט ודחיפה ל-GitHub אחרי פעולה |

הסקילים נטענים אוטומטית לפי ה-triggers שבהם. עדכון סקיל — דרך `skill-builder`.

## מבנה נתונים (§14) — MVP

`users`, `template_categories`, `templates`, `documents`, `document_versions`,
`orders`, `payments`, `downloads`, `coupons`. הסכמה המלאה:
[.claude/skills/database/references/schema.md](.claude/skills/database/references/schema.md).

## הרשאות (§11)

Guest (ללא חשבון, רכישה חד-פעמית) · User · Premium · Designer (שלב 3) · Admin.
