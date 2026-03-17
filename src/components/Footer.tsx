import Image from "next/image";

export default function Footer() {
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
              <a href="#about" className="px-1 py-2 transition-colors hover:text-sand">
                אודות
              </a>
              <a href="#impact" className="px-1 py-2 transition-colors hover:text-sand">
                השפעתנו
              </a>
              <a href="#gallery" className="px-1 py-2 transition-colors hover:text-sand">
                עדכונים
              </a>
              <a href="#contact" className="px-1 py-2 transition-colors hover:text-sand">
                צור קשר
              </a>
            </div>
          </nav>
        </div>

        <div className="mt-8 text-center text-sm text-gray-300">
          © {new Date().getFullYear()} פלוגת צב. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
}
