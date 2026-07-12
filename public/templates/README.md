# תמונות כרטיסי התבניות

כאן מניחים את התמונה של כל תבנית — היא מוצגת בכרטיס שלה בדף בחירת המסמך (`/create`).

## איך מוסיפים תמונה לתבנית

1. שומרים את הקובץ בתיקייה זו בשם ה-slug של התבנית, למשל:
   - `wedding.jpg` — הזמנה לחתונה
   - `bar-mitzvah.jpg` — הזמנה לבר מצווה
   - `bat-mitzvah.jpg`, `brit.jpg`, `engagement.jpg`, `pidyon-haben.jpg`,
     `birthday.jpg`, `welcome-sign.jpg`, `shalom-zachar.jpg`
2. מוסיפים שורה לקובץ התבנית ב-`supabase/seed/templates/<slug>.json`:

   ```json
   "thumbnail": "/templates/wedding.jpg",
   ```

3. זהו — הכרטיס יציג את התמונה. תבנית בלי תמונה מקבלת placeholder צבעוני אוטומטי.

## הנחיות לתמונה

- **יחס**: 4:3 (מומלץ ‎800×600 ומעלה). התמונה נחתכת ל-cover במרכז.
- **פורמט**: JPG / PNG / WebP.
- **תוכן**: סמל של סוג האירוע (טבעות, תפילין, נרות...) — ללא דמויות אנשים (אפיון §12).
