import type { Metadata } from "next";
import {
  Heebo,
  Frank_Ruhl_Libre,
  David_Libre,
  Rubik,
  Secular_One,
} from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

// Hebrew fonts (spec §12: פרנק-רול, היבו, דוד…): Heebo is the UI font; all five
// are user-selectable for the document (lib/styleOptions.ts). Self-hosted via
// next/font, so Puppeteer embeds them in the PDF identically to the preview.
const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo" });
const frank = Frank_Ruhl_Libre({ subsets: ["hebrew", "latin"], variable: "--font-frank" });
const david = David_Libre({ weight: ["400", "500", "700"], subsets: ["hebrew", "latin"], variable: "--font-david" });
const rubik = Rubik({ subsets: ["hebrew", "latin"], variable: "--font-rubik" });
const secular = Secular_One({ weight: "400", subsets: ["hebrew", "latin"], variable: "--font-secular" });

const fontVars = [heebo, frank, david, rubik, secular]
  .map((f) => f.variable)
  .join(" ");

export const metadata: Metadata = {
  title: "מזל טוב AI — מסמכים מעוצבים בעברית בדקות",
  description:
    "צרו הזמנות, מודעות, קורות חיים ופליירים מעוצבים בעברית — מילוי טופס, שיפור נוסח ב-AI, תצוגה חיה והורדת PDF באיכות דפוס.",
};

// Root layout: Hebrew + RTL globally (spec §12). All user-facing text is Hebrew.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={fontVars}>
      <body className="font-sans flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
