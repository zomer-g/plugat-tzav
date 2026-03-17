import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "פלוגת צב | Plugat Tzav",
  description:
    "פלוגת צב — ביחד, תמיד מוכנים. אתר הפלוגה הרשמי לעדכונים, גלריה ותרומות.",
  openGraph: {
    title: "פלוגת צב | Plugat Tzav",
    description:
      "פלוגת צב — ביחד, תמיד מוכנים. אתר הפלוגה הרשמי לעדכונים, גלריה ותרומות.",
    type: "website",
    locale: "he_IL",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://plugat-tzav.onrender.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
