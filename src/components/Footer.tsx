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
    <footer className="border-t border-slate-mil/20 bg-dark-bg py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="פלוגת צב"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="font-bold text-sand">פלוגת צב</span>
          </div>

          <a
            href="/privacy"
            className="text-sm text-gray-400 transition-colors hover:text-sand"
          >
            מדיניות פרטיות ונגישות
          </a>

          <span className="text-sm text-gray-500">
            © {new Date().getFullYear()} {content.copyright}
          </span>
        </div>
      </div>
    </footer>
  );
}
