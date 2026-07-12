"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Global footer — on every page except /print (which Puppeteer rasterizes to
// PDF — any extra content would spill onto a second page). Privacy/terms links
// here satisfy the privacy-compliance requirement (global footer, in Hebrew).
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/print")) return null;
  return (
    <footer className="mt-20 border-t px-4 pb-8 pt-6 text-center text-sm text-gray-500">
      <nav className="flex flex-wrap justify-center gap-4">
        <Link href="/create" className="hover:underline">יצירת מסמך</Link>
        <Link href="/my-documents" className="hover:underline">המסמכים שלי</Link>
        <Link href="/about" className="hover:underline">אודות</Link>
        <Link href="/terms" className="hover:underline">תנאי שימוש</Link>
        <Link href="/privacy" className="hover:underline">מדיניות פרטיות</Link>
      </nav>
      <p className="mt-3">© {new Date().getFullYear()} מזל טוב AI</p>
    </footer>
  );
}
