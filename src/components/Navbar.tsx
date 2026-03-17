"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "#about", label: "אודות" },
  { href: "#impact", label: "השפעתנו" },
  { href: "#gallery", label: "עדכונים" },
  { href: "#timeline", label: "ציר הזמן" },
  { href: "/events", label: "אירועים" },
  { href: "#contact", label: "צור קשר" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!menuOpen) return;
      if (e.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [menuOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <nav
      aria-label="ניווט ראשי"
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-dark-bg/90 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="פלוגת צב"
            width={48}
            height={48}
            className="rounded"
          />
          <span className="text-lg font-bold text-sand">פלוגת צב</span>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-2 py-3 text-sm font-medium text-gray-200 transition-colors hover:text-sand"
            >
              {link.label}
            </a>
          ))}

          {/* Members area link */}
          <Link
            href={session ? "/members" : "/auth/signin"}
            className="rounded-full border border-sand/30 px-4 py-2 text-sm font-medium text-sand transition-colors hover:border-sand hover:bg-sand/10"
          >
            {session ? "אזור אישי" : "התחברות"}
          </Link>

          <a
            href={process.env.NEXT_PUBLIC_DONATION_URL || "#donate"}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-olive px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-olive-light"
            aria-label="תרמו עכשיו — ניווט ראשי (נפתח בחלון חדש)"
          >
            תרמו עכשיו
          </a>
        </div>

        <button
          ref={buttonRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label={menuOpen ? "סגור תפריט" : "פתח תפריט"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-transform ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-transform ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-label="תפריט ניווט"
          className="bg-dark-bg/95 backdrop-blur-md md:hidden"
        >
          <div className="flex flex-col items-center gap-4 px-4 py-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-lg font-medium text-gray-200 transition-colors hover:text-sand"
              >
                {link.label}
              </a>
            ))}

            {/* Members area link (mobile) */}
            <Link
              href={session ? "/members" : "/auth/signin"}
              onClick={() => setMenuOpen(false)}
              className="rounded-full border border-sand/30 px-6 py-3 text-lg font-medium text-sand transition-colors hover:border-sand hover:bg-sand/10"
            >
              {session ? "אזור אישי" : "התחברות"}
            </Link>

            <a
              href={process.env.NEXT_PUBLIC_DONATION_URL || "#donate"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-full bg-olive px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-olive-light"
              aria-label="תרמו עכשיו (נפתח בחלון חדש)"
            >
              תרמו עכשיו
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
