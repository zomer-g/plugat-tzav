import type { Metadata } from "next";
import Script from "next/script";
import { Heebo } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import ActivityLogger from "@/components/ActivityLogger";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "פלוגת צב | Plugat Tzav",
  description:
    "פלוגת צב — ביחד, תמיד מוכנים. אתר הפלוגה הרשמי לעדכונים, גלריה ותרומות.",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "פלוגת צב | Plugat Tzav",
    description:
      "פלוגת צב — ביחד, תמיד מוכנים. אתר הפלוגה הרשמי לעדכונים, גלריה ותרומות.",
    type: "website",
    locale: "he_IL",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://plugat-tzav.onrender.com",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "פלוגת צב - Plugat Tzav",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DD5DKXP5M3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DD5DKXP5M3');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <SessionProvider>
          <ActivityLogger />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
