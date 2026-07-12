import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

// Hebrew-first font for UI AND the document preview (the preview is the future
// PDF source — spec §12; print fonts like פרנק-רול are embedded at the PDF stage).
const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo" });

export const metadata: Metadata = {
  title: "מזל טוב AI — מסמכים מעוצבים בעברית בדקות",
  description:
    "צרו הזמנות, מודעות, קורות חיים ופליירים מעוצבים בעברית — מילוי טופס, שיפור נוסח ב-AI, תצוגה חיה והורדת PDF באיכות דפוס.",
};

// Root layout: Hebrew + RTL globally (spec §12). All user-facing text is Hebrew.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-sans flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
