import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold">הדף לא נמצא</h1>
      <p className="mt-3 text-gray-600">כנראה שהקישור שגוי או שהעמוד הוסר.</p>
      <Link href="/" className="mt-6 rounded-lg bg-brand px-6 py-2 text-brand-fg">
        חזרה לדף הבית
      </Link>
    </main>
  );
}
