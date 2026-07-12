"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listDrafts, deleteDraft, type Draft } from "@/lib/drafts";

// "My documents" — drafts saved on this device (localStorage). Cloud history
// arrives with user accounts (spec §11 User role, V2).
export default function MyDocumentsPage() {
  const [drafts, setDrafts] = useState<Draft[] | null>(null);

  useEffect(() => {
    setDrafts(listDrafts());
  }, []);

  const remove = (slug: string) => {
    deleteDraft(slug);
    setDrafts(listDrafts());
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-center">המסמכים שלי</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        טיוטות שנשמרו אוטומטית במכשיר הזה. כניסה לחשבון ושמירה בענן — בקרוב.
      </p>

      {drafts === null ? (
        <div className="mt-10 h-24 animate-pulse rounded-2xl bg-gray-100" />
      ) : drafts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed p-10 text-center">
          <p className="text-gray-600">עוד אין מסמכים שמורים.</p>
          <Link href="/create" className="mt-4 inline-block rounded-xl bg-brand px-6 py-2 text-brand-fg">
            ליצירת המסמך הראשון
          </Link>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {drafts.map((d) => (
            <li key={d.slug} className="flex items-center justify-between gap-4 rounded-2xl border p-4">
              <div className="text-start">
                <div className="font-semibold">{d.templateTitle}</div>
                <div className="text-xs text-gray-500">
                  עודכן{" "}
                  {new Intl.DateTimeFormat("he-IL", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(d.updatedAt)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/create/${d.slug}`}
                  className="rounded-lg bg-brand px-4 py-1.5 text-sm text-brand-fg"
                >
                  המשך עריכה
                </Link>
                <button
                  type="button"
                  onClick={() => remove(d.slug)}
                  className="rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:border-red-400 hover:text-red-600"
                >
                  מחיקה
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
