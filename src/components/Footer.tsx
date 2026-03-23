import Image from "next/image";
import type { SiteContent } from "@/lib/db";

interface FooterProps {
  content?: SiteContent["footer"];
}

const defaultContent: SiteContent["footer"] = {
  copyright: "פלוגת צב. כל הזכויות שמורות.",
  links: [
    { href: "#about", label: "אודות" },
    { href: "#impact", label: "השפעתנו" },
    { href: "#gallery", label: "עדכונים" },
    { href: "#contact", label: "צור קשר" },
  ],
};

export default function Footer({ content = defaultContent }: FooterProps) {
  return (
    <footer className="border-t border-slate-mil/20 bg-dark-bg py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="פלוגת צב"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="font-bold text-sand">פלוגת צב</span>
          </div>

          <nav aria-label="ניווט תחתון">
            <div className="flex gap-6 text-sm text-gray-200">
              {content.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-1 py-2 transition-colors hover:text-sand"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 text-center text-sm text-gray-300">
          <a
            href="/privacy"
            className="text-gray-400 transition-colors hover:text-sand"
          >
            מדיניות פרטיות ונגישות
          </a>
          <span>© {new Date().getFullYear()} {content.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
