export const metadata = {
  title: "תנאי שימוש | מזל טוב AI",
  robots: { index: false },
};

// Legal skeleton only — the binding wording requires a lawyer before launch
// (privacy-compliance skill: legal text is not code).
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-start">
      <h1 className="text-3xl font-bold">תנאי שימוש</h1>
      <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        ⚠️ נוסח טיוטה — מסמך זה טעון בדיקה ואישור של עורך/ת דין לפני השקה מסחרית.
      </p>
      <div className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="font-bold text-gray-900">1. השירות</h2>
          <p>
            "מזל טוב AI" מאפשר יצירת מסמכים מעוצבים (הזמנות, מודעות, קורות חיים
            ועוד) באמצעות תבניות, שיפור נוסח בבינה מלאכותית והורדת קובץ PDF,
            בתשלום חד-פעמי לכל מסמך.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900">2. אחריות על התוכן</h2>
          <p>
            הפרטים המוזנים במסמך (שמות, תאריכים, כתובות) הם באחריות המשתמש/ת.
            מומלץ לבדוק את המסמך היטב לפני הורדה והדפסה. השירות כולל בדיקת כתיב
            אוטומטית, אך אינו מחליף הגהה אנושית.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900">3. תשלום, תיקונים והחזרים</h2>
          <p>
            המחיר מוצג לפני התשלום. כל רכישה כוללת שלושה תיקונים חוזרים לאותו
            מסמך. במקרה של תקלה בקובץ לאחר תשלום — פנו אלינו ונטפל תוך יום עסקים.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900">4. קניין רוחני</h2>
          <p>
            התבניות והעיצובים הם קניין השירות. המסמך המופק מיועד לשימוש אישי —
            הדפסה, שליחה ופרסום של המסמך שיצרתם מותרים ללא הגבלה.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900">5. שימוש בבינה מלאכותית</h2>
          <p>
            שיפורי הנוסח מבוצעים על ידי ספק בינה מלאכותית חיצוני. אין להזין
            תוכן פוגעני או מפר חוק; המערכת מיועדת למסמכים אישיים ומשפחתיים.
          </p>
        </section>
      </div>
    </main>
  );
}
