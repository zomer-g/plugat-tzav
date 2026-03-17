import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignInButton from "./SignInButton";

export const metadata = {
  title: "התחברות | פלוגת צב",
};

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/members");

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-md rounded-2xl bg-dark-card p-8 text-center shadow-xl">
        <img
          src="/logo.png"
          alt="פלוגת צב"
          className="mx-auto mb-6 h-24 w-24 rounded-lg"
        />
        <h1 className="mb-2 text-3xl font-bold text-sand">כניסה לאזור האישי</h1>
        <p className="mb-8 text-gray-400">
          התחברו עם חשבון Google שלכם כדי לגשת לאזור האישי של הפלוגה
        </p>
        <SignInButton />
        <p className="mt-6 text-sm text-gray-500">
          הגישה מותרת למשתמשים מאושרים בלבד.
          <br />
          אם אתם לא מצליחים להתחבר, פנו למפקד הפלוגה.
        </p>
        <a
          href="/"
          className="mt-4 inline-block text-sm text-sand underline hover:text-sand-light"
        >
          חזרה לאתר הראשי
        </a>
      </div>
    </div>
  );
}
