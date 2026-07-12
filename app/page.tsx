import Link from "next/link";

// Home page (spec §15 MVP). Server Component. Categories per spec §6.
const categories = [
  { title: "אירועים", desc: "חתונה, ברית, בר/בת מצווה, חינה, וורט ועוד", emoji: "🎉" },
  { title: "עבודה", desc: "קורות חיים, מכתב מקדים, מכתב המלצה", emoji: "💼" },
  { title: "עסקים", desc: "פליירים, מודעות, הצעות מחיר, מכתבים רשמיים", emoji: "🏢" },
  { title: "קהילה", desc: "שיעורי תורה, אירועי קהילה, לוחות זמנים", emoji: "🕍" },
];

const steps = [
  "בוחרים סוג מסמך",
  "ממלאים פרטים",
  "ה-AI משפר את הנוסח",
  "בוחרים עיצוב",
  "תצוגה מקדימה חיה",
  "משלמים ומורידים PDF",
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">מזל טוב AI</h1>
        <p className="mt-4 text-lg text-gray-600">
          מסמכים מעוצבים בעברית בתוך דקות — בלי ידע בעיצוב, בלי הרשמה.
        </p>
        <Link
          href="/create"
          className="mt-8 inline-block rounded-xl bg-brand px-8 py-3 text-brand-fg font-medium shadow-sm transition hover:opacity-90"
        >
          נתחיל ליצור
        </Link>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-center">איך זה עובד</h2>
        <ol className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          {steps.map((step, i) => (
            <li key={step} className="rounded-full bg-gray-100 ps-4 pe-4 py-2">
              <span className="font-bold text-brand">{i + 1}.</span> {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-center">מה אפשר ליצור</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {categories.map((c) => (
            <div key={c.title} className="rounded-2xl border p-6 text-start">
              <div className="text-3xl">{c.emoji}</div>
              <h3 className="mt-2 text-lg font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 border-t pt-6 text-center text-sm text-gray-500">
        <nav className="flex justify-center gap-4">
          <Link href="/my-documents" className="hover:underline">המסמכים שלי</Link>
          <Link href="/about" className="hover:underline">אודות</Link>
          <Link href="/terms" className="hover:underline">תנאי שימוש</Link>
          <Link href="/privacy" className="hover:underline">מדיניות פרטיות</Link>
        </nav>
        <p className="mt-3">© {new Date().getFullYear()} מזל טוב AI</p>
      </footer>
    </main>
  );
}
