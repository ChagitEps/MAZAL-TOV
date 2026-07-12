export const metadata = {
  title: "מדיניות פרטיות | מזל טוב AI",
  robots: { index: false },
};

// Legal skeleton only — the binding wording requires a lawyer before launch
// (privacy-compliance skill; חוק הגנת הפרטיות, תיקון 13).
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-start">
      <h1 className="text-3xl font-bold">מדיניות פרטיות</h1>
      <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        ⚠️ נוסח טיוטה — מסמך זה טעון בדיקה ואישור של עורך/ת דין לפני השקה מסחרית.
      </p>
      <div className="mt-6 flex flex-col gap-5 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="font-bold text-gray-900">1. איזה מידע נאסף</h2>
          <p>
            רק המידע הנחוץ להפקת המסמך ולמשלוחו: הפרטים שמילאתם במסמך (שמות,
            תאריכים, כתובת האירוע), וכתובת דוא"ל לצורך שליחת הקובץ לאחר רכישה.
            אין חובת הרשמה. פרטי אשראי נמסרים ישירות לחברת הסליקה ואינם נשמרים
            אצלנו.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900">2. עיבוד בבינה מלאכותית</h2>
          <p>
            בעת שימוש בשיפור נוסח, הטקסט של השדה המשופר בלבד נשלח לספק בינה
            מלאכותית חיצוני לצורך העיבוד. איננו שולחים את מכלול פרטיכם האישיים.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900">3. שמירה ומחיקה</h2>
          <p>
            טיוטות שלא נרכשו נשמרות בדפדפן שלכם בלבד (במכשיר). מסמכים שנרכשו
            נשמרים לצורך התיקונים הכלולים ברכישה ולחובות חשבונאיות. ניתן לבקש
            עיון במידע או מחיקתו בכל עת בפנייה אלינו — מידע שאינו נדרש על פי דין
            יימחק.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900">4. אבטחה</h2>
          <p>
            האתר פועל בתקשורת מוצפנת (HTTPS) בלבד. הגישה למידע מוגבלת ומאובטחת,
            בהתאם לחוק הגנת הפרטיות ותקנותיו.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900">5. יצירת קשר</h2>
          <p>לשאלות פרטיות, עיון או מחיקה: דרך עמוד יצירת הקשר או בדוא"ל התמיכה.</p>
        </section>
      </div>
    </main>
  );
}
