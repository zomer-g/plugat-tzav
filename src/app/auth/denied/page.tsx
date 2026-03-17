import Link from "next/link";

export const metadata = {
  title: "אין גישה | פלוגת צב",
};

export default function DeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-md rounded-2xl bg-dark-card p-8 text-center shadow-xl">
        <div className="mb-6 text-6xl">🚫</div>
        <h1 className="mb-2 text-3xl font-bold text-red-400">אין גישה</h1>
        <p className="mb-6 text-gray-400">
          אין לכם הרשאה לגשת לעמוד זה.
          <br />
          אם אתם חושבים שזו טעות, פנו למנהל האתר.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/members"
            className="rounded-xl bg-olive px-6 py-3 font-bold text-white transition-colors hover:bg-olive-light"
          >
            לאזור האישי
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 underline hover:text-sand"
          >
            חזרה לאתר הראשי
          </Link>
        </div>
      </div>
    </div>
  );
}
