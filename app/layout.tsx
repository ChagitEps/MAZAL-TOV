import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מזל טוב AI — מסמכים מעוצבים בעברית בדקות",
  description:
    "צרו הזמנות, מודעות, קורות חיים ופליירים מעוצבים בעברית — מילוי טופס, שיפור נוסח ב-AI, תצוגה חיה והורדת PDF באיכות דפוס.",
};

// Root layout: Hebrew + RTL globally (spec §12). All user-facing text is Hebrew.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="font-sans min-h-screen">{children}</body>
    </html>
  );
}
